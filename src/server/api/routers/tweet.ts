import { tweetSchema } from "../../../components/CreateTweet";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { z } from "zod";

export const tweetRouter = createTRPCRouter({
  create: protectedProcedure
    .input(tweetSchema)
    .mutation(async ({ ctx, input }) => {
      const { prisma, session } = ctx;
      const { text } = input;

      const userId = session.user.id;

      return prisma.tweet.create({
        data: {
          text,
          author: {
            connect: {
              id: userId,
            },
          },
        },
      });
    }),

  timeline: publicProcedure
    .input(
      z.object({
        cursor: z.string().nullish(),
        limit: z.number().min(1).max(100).default(10),
      })
    )
    .query(async ({ ctx, input }) => {
      const { prisma } = ctx;
      const { cursor, limit } = input;

      return await prisma.tweet.findMany({
        orderBy: {
          createdAt: "desc",
        },
        cursor: cursor ? { id: cursor } : undefined,
        take: limit,
        include: {
          author: {
            select: {
              name: true,
              image: true,
              id: true,
            },
          },
        },
      });
    }),
});
