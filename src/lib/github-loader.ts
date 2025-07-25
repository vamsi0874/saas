import { GithubRepoLoader } from '@langchain/community/document_loaders/web/github'
import { generateEmbedding, summariseCode } from './gemini'
import type { Document } from '@langchain/core/documents'
import { db } from '@/server/db'
import { Octokit } from 'octokit';



function delay(ms: number) {
  return new Promise(res => setTimeout(res, ms));
}

async function getFileCount (path: string, octokit: Octokit, githubOwner: string, githubRepo: string, acc: number = 0) {
  const {data} = await octokit.rest.repos.getContent({
    owner: githubOwner,
    repo: githubRepo,
    path
  })
  if(!Array.isArray(data) && data.type === 'file') {
    return acc + 1; 
  }
  if (Array.isArray(data)) {
    let fileCount = 0
    const directories: string[] = []

    for (const item of data) {
      if (item.type === 'dir') {
        directories.push(item.path)
      } else {
        fileCount++
      }
    }

    if (directories.length > 0) {
      const directoryFileCounts = await Promise.all(directories.map(dir => getFileCount(dir, octokit, githubOwner, githubRepo)))
    }
    return acc
  }
}

export const checkCredits = async (githubUrl: string, githubToken?: string) => {
  // find out how many files are in the repo
  const octokit = new Octokit({ auth: githubToken })
  const githubOwner = githubUrl.split('/')[3]
  const githubRepo = githubUrl.split('/')[4]
  if (!githubOwner || !githubRepo) {
    return 0
  }

  const fileCount = await getFileCount('', octokit, githubOwner, githubRepo,0)
  return fileCount
}

export const loadGithubRepo = async (githubUrl: string, githubToken?: string) => {
  const loader = new GithubRepoLoader(githubUrl, {
    accessToken: githubToken || '',
    branch: 'main',
    ignoreFiles: ['package-lock.json', 'yarn.lock', 'pnpm-lock.yaml', 'bun.lockb','.gitignore', 'README.md','.env.example','package.json', 'tsconfig.json', 'tsconfig.build.json',],
    recursive: true,
    unknown: 'warn',
    maxConcurrency: 5,
  })

  const docs = await loader.load()
  return docs
}


export const indexGithubRepo = async (
  projectId: string,
  githubUrl: string,
  githubToken?: string,
) => {
  const docs = await loadGithubRepo(githubUrl, githubToken)
  const allEmbeddings = await generateEmbeddings(docs)
  await Promise.allSettled(allEmbeddings.map(async (embedding, index) => {

    console.log(`processing ${index} of ${allEmbeddings.length}`)
    if (!embedding) return

    const sourceCodeEmbedding = await db.sourceCodeEmbedding.create({
      data: {
        projectId,
        fileName: embedding.fileName,
        summary: embedding.summary,
        sourceCode: embedding.sourceCode,
      },
    })

    await db.$executeRaw`
    UPDATE "SourceCodeEmbedding"
    SET "summaryEmbedding" = ${embedding.embedding}::vector WHERE "id" = ${sourceCodeEmbedding.id}`
  })
)}



const generateEmbeddings = async (docs: Document[]) => {
  return await Promise.all(docs.slice(0, 10).map(async (doc) => {
    await delay(4000) 
    const summary = await summariseCode(doc)
    const embedding = await generateEmbedding(summary)
    return {
      summary,
      embedding,
      sourceCode: JSON.parse(JSON.stringify(doc.pageContent)),
      fileName: doc.metadata.source,
    }
  }))
}

