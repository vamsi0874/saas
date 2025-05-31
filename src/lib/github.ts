
import { db } from "@/server/db";
import { Octokit } from "octokit";
import { aiSummariseCommit } from "./gemini";
import axios from "axios";


export const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

type Response = {
  commitHash: string;
  commitMessage: string;
  commitAuthorName: string;
  commitAuthorAvatar: string;
  commitDate: string;
}
const githubUrl = "https://github.com/vamsi0874/saas"
export const getCommitHashes = async (githubUrl: string) : Promise<Response[]> => {
    const {data} = await octokit.rest.repos.listCommits({
    owner: githubUrl.split('/')[3] as string,
    repo: githubUrl.split('/')[4]as string,
    })

    const sortedCommits = data.sort(
      (a, b) =>
        new Date(b.commit.author?.date ?? 0).getTime() -
        new Date(a.commit.author?.date ?? 0).getTime()
    );

    return sortedCommits.slice(0,15).map((commit)=>({
     commitHash: commit.sha,
     commitMessage: commit.commit.message ?? "",
     commitAuthorName: commit.commit.author?.name ?? "",
     commitAuthorAvatar: commit.author?.avatar_url ?? "",
     commitDate: commit.commit.author?.date ?? "",
    }))
  
}

async function fetchProjectGithubUrl(projectId: string) {
  const project = await db.project.findUnique({
    where: { id: projectId },
    select: { githubUrl: true },
  })

  if(!project?.githubUrl) {
    throw new Error("Project not found or does not have a GitHub URL");
  }

  return {project , githubUrl: project?.githubUrl ?? ""};
}

export const pollCommits = async (projectId: string) => {
  const { project, githubUrl } = await fetchProjectGithubUrl(projectId);
  
  const commitHashes = await getCommitHashes(githubUrl);

  const unprocessedCommits = await filterUnprocessedCommits(projectId, commitHashes);

  const summaryResponses: PromiseSettledResult<string>[] = await Promise.allSettled(
    unprocessedCommits.map((commit: Response) => summarizeCommit(githubUrl, commit.commitHash))
  );
  const summaries = summaryResponses.map((response) => {
    if (response.status === "fulfilled") {
      return response.value as string;
    } else {
      console.error("Error summarizing commit:", response.reason);
      return "";
    }
  })



  const commits = await db.commit.createMany({
    data: summaries.map((summary, index) => {

  
      const commit = unprocessedCommits[index];
      if (!commit || !commit.commitHash) {
        throw new Error("Commit or commitHash is undefined");
      }
      return {
        projectId,
        commitHash: commit.commitHash,
        commitMessage: commit.commitMessage,
        commitAuthorName: commit.commitAuthorName,
        commitAuthorAvatar: commit.commitAuthorAvatar,
        commitDate: commit.commitDate,
        summary,
      };
    })

  })

  return commits
}



async function filterUnprocessedCommits(projectId: string, commitHashes: Response[]) {
  const processedCommits = await db.commit.findMany({
    where: { projectId },
  })

  interface ProcessedCommit {
    commitHash: string;
    
  }

  const unprocessedCommits: Response[] = commitHashes.filter(
    (commit: Response) =>
      !processedCommits.some((c: ProcessedCommit) => c.commitHash === commit.commitHash)
  );
  return unprocessedCommits;
}

async function summarizeCommit(githubUrl: string, commitHash: string) {
  
  const {data} = await axios.get(`${githubUrl}/commit/${commitHash}.diff`, {
    headers: {
      Accept: 'application/vnd.github.v3.diff'
    }
})

return await aiSummariseCommit(data);

}