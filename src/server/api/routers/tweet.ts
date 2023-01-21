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
        where: z
          .object({
            author: z.object({ name: z.string().optional() }).optional(),
          })
          .optional(),
        cursor: z.string().nullish(),
        limit: z.number().min(1).max(100).default(10),
      })
    )
    .query(async ({ ctx, input }) => {
      const { prisma } = ctx;
      const { cursor, limit, where } = input;

      const tweets = await prisma.tweet.findMany({
        orderBy: {
          createdAt: "desc",
        },
        cursor: cursor ? { id: cursor } : undefined,
        take: limit + 1,
        where,
        include: {
          author: {
            select: {
              name: true,
              image: true,
              id: true,
            },
          },
          votes: {
            // where: {
            //   userId: ctx.session?.user?.id;
            // },
            select: {
              userId: true,
              direction: true,
            },
          },
          // _count: {
          //   select: {
          //     votes: { where: { direction: 1 } },
          //   },
          // },
        },
      });

      let nextCursor: typeof cursor = null;

      if (tweets.length > limit) {
        const nextItem = tweets.pop() as (typeof tweets)[number];
        nextCursor = nextItem.id;
      }

      return { tweets, nextCursor };
    }),

  vote: protectedProcedure
    .input(
      z.object({
        tweetId: z.string(),
        direction: z.number().min(-1).max(1).int().default(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { prisma, session } = ctx;
      const { tweetId, direction } = input;

      const userId = session.user.id;

      return prisma.vote.upsert({
        where: {
          tweetId_userId: {
            tweetId,
            userId,
          },
        },
        create: {
          tweet: {
            connect: {
              id: tweetId,
            },
          },
          user: {
            connect: {
              id: userId,
            },
          },
          direction,
        },
        update: { direction },
      });
    }),

  unvote: protectedProcedure
    .input(
      z.object({
        tweetId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { prisma, session } = ctx;
      const { tweetId } = input;

      const userId = session.user.id;

      return prisma.vote.delete({
        where: {
          tweetId_userId: {
            tweetId,
            userId,
          },
        },
      });
    }),
});
