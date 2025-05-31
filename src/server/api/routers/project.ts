
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { pollCommits } from "@/lib/github";
import { checkCredits, indexGithubRepo } from "@/lib/github-loader";

export const projectRouter = createTRPCRouter({
    createProject: protectedProcedure.input(
        z.object({
            name: z.string(),
            githubUrl: z.string(),
            githubToken: z.string().optional(),
        })
    ).mutation(async ({ ctx, input }) => {
          const { name, githubUrl } = input;
         const user = await ctx.db.user.findUnique({
           where: { id: ctx.user.userId! },
           select: { credits: true }
         })
         if(!user) throw new Error("User not found");
         const currentCredits = user.credits || 0;
         const fileCount = await checkCredits(githubUrl, input.githubToken);

         if(fileCount! > currentCredits) throw new Error("Not enough credits to create this project. Please purchase more credits.");

          const project = await ctx.db.project.create({
            data: {
              name,
              githubUrl,
              userToProjects: {
                create: {
                  userId: ctx.user.userId!,
                },
              },
            },
          });
          await indexGithubRepo(project.id, githubUrl, input.githubToken);
        await pollCommits(project.id);
        await ctx.db.user.update({
          where: { id: ctx.user.userId! },
          data: {
            credits: {
              decrement: fileCount
            }
          },
        });
        return project
    }),

    getProjects: protectedProcedure.input(z.void()).query(async ({ ctx }) => {
      

      try {
        const projects = await ctx.db.project.findMany({
            where: {
               userToProjects: {
                   some: {
                       userId: ctx.user.userId!,
                   }
               },
               deletedAt: null
            }
        })
        return projects
      } catch (error) {
        console.error("Error fetching projects:", error);
       
      }
    }),

    getCommits: protectedProcedure.input(z.object({
        projectId: z.string()
    })).query(async ({ ctx,input }) => {
      pollCommits(input.projectId).catch(console.error);
        const commits = await ctx.db.commit.findMany({
            where: {
                projectId: input.projectId,
              
            }
        })
        return commits
    }),

  saveAnswer: protectedProcedure.input(z.object({
  projectId: z.string(),
  question: z.string(),
  answer: z.string(),
  filesReferences: z.any()
})).mutation(async ({ ctx, input }) => {
  return await ctx.db.question.create({
    data: {
      answer: input.answer,
      filesReferences: input.filesReferences,
      projectId: input.projectId,
      question: input.question,
      userId: ctx.user.userId!
    }
  })
}),

getQuestions: protectedProcedure
  .input(z.object({ projectId: z.string() }))
  .query(async ({ ctx, input }) => {
    return await ctx.db.question.findMany({
  where: {projectId: input.projectId },
  include: { user: true},
  orderBy: [{createdAt: 'desc' }]})
}),

 archiveProject: protectedProcedure.input(z.object({
  projectId: z.string()})).mutation(async ({ ctx, input }) => {   
  return await ctx.db.project.update({
    where: { id: input.projectId,  },
    data: { deletedAt: new Date(), }, })
  }),
  getTeamMembers: protectedProcedure.input(z.object({projectId: z.string()})).query(async ({ ctx, input }) => {
    return await ctx.db.userToProject.findMany({
      where: {
        projectId: input.projectId!
      },
      include: {
        user: true
      }
    })
  }),
  getMyCredits: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.user.findUnique({
      where: { id: ctx.user.userId! },
      select: { credits: true }
    })
  }),
  checkCredits: protectedProcedure.input(z.object({
    githubUrl: z.string(),
    githubToken: z.string().optional()

  })).mutation(async ({ ctx,input }) => {
     const fileCount = await checkCredits(input.githubUrl, input.githubToken)
     const userCredits = await ctx.db.user.findUnique({
      where: { id: ctx.user.userId! },
      select: { credits: true }
     })

     return {
        fileCount,
        userCredits: userCredits?.credits || 0
     }
  })


});