import { InfiniteData, QueryClient } from "@tanstack/react-query";
import { RouterInputs, api } from "../utils/api";
import { Session } from "@prisma/client";
import { TbArrowBigDown, TbArrowBigTop } from "react-icons/tb";
import Image from "next/image";
import type { RouterOutputs } from "../utils/api";
import Link from "next/link";
import { Typography } from "@mui/material";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import updateLocale from "dayjs/plugin/updateLocale";

dayjs.extend(relativeTime);
dayjs.extend(updateLocale);
dayjs.updateLocale("en", {
  relativeTime: {
    // relative time format strings, keep %s %d as the same
    future: "in %s", // e.g. in 2 hours, %s been replaced with 2hours
    past: "%s ago",
    s: "a few seconds",
    m: "a minute",
    mm: "%d minutes",
    h: "an hour",
    hh: "%d hours", // e.g. 2 hours, %d been replaced with 2
    d: "a day",
    dd: "%d days",
    M: "a month",
    MM: "%d months",
    y: "a year",
    yy: "%d years",
  },
});

const updateCache = ({
  client,
  variables,
  data,
  action,
  input,
}: {
  client: QueryClient;
  variables: {
    tweetId: string;
  };
  data: {
    userId: string;
    direction: number;
  };
  action: "Vote" | "Unvote";
  input: RouterInputs["tweet"]["timeline"];
}) => {
  client.setQueryData(
    [
      ["tweet", "timeline"],
      {
        input,
        type: "infinite",
      },
    ],
    (oldData) => {
      console.log({ oldData });
      const newData = oldData as InfiniteData<
        RouterOutputs["tweet"]["timeline"]
      >;

      const newTweets = newData.pages.map((page) => {
        return {
          tweets: page.tweets.map((tweet) => {
            if (tweet.id === variables.tweetId) {
              return {
                ...tweet,
                votes:
                  action === "Unvote"
                    ? []
                    : [{ userId: data.userId, direction: data.direction }],
              };
            }
            return tweet;
          }),
        };
      });

      return {
        ...newData,
        pages: newTweets,
      };
    }
  );
};

export const Tweet = ({
  tweet,
  client,
  userId,
  input,
}: {
  tweet: RouterOutputs["tweet"]["timeline"]["tweets"][number];
  client: QueryClient;
  userId: Session["userId"];
  input: RouterInputs["tweet"]["timeline"];
}) => {
  const voteMutation = api.tweet.vote.useMutation({
    onSuccess: (data, variables) => {
      updateCache({ client, data, variables, action: "Vote", input });
    },
  }).mutateAsync;
  const unVoteMutation = api.tweet.unvote.useMutation({
    onSuccess: (data, variables) => {
      updateCache({ client, data, variables, action: "Unvote", input });
    },
  }).mutateAsync;

  // const upVotes = tweet.votes.filter((vote) => vote.direction > 0);
  // const downVotes = tweet.votes.filter((vote) => vote.direction < 0);
  const myVote = tweet.votes.find((vote) => vote.userId === userId);

  return (
    <div className="mb-2 border-b-2 border-gray-500">
      <div className="flex p-1">
        <div className="flex flex-col items-center p-2">
          <TbArrowBigTop
            color={myVote && myVote.direction > 0 ? "red" : "gray"}
            size="1.5rem"
            onClick={() => {
              console.log("Liked Tweet");
              if (myVote && myVote.direction > 0) {
                unVoteMutation({ tweetId: tweet.id }).catch((err) =>
                  console.error(err)
                );
                return;
              }
              voteMutation({ tweetId: tweet.id }).catch((err) =>
                console.error(err)
              );
            }}
          />
          <span className="text-sm text-gray-500">
            {tweet.votes.filter((vote) => vote.direction > 0).length -
              tweet.votes.filter((vote) => vote.direction < 0).length}
          </span>
          <TbArrowBigDown
            color={myVote && myVote.direction < 0 ? "red" : "gray"}
            size="1.5rem"
            onClick={() => {
              console.log("Liked Tweet");
              if (myVote && myVote.direction < 0) {
                unVoteMutation({ tweetId: tweet.id }).catch((err) =>
                  console.error(err)
                );
                return;
              }
              voteMutation({ tweetId: tweet.id, direction: -1 }).catch((err) =>
                console.error(err)
              );
            }}
          />
        </div>
        <div className="ml-2">
          <div className="flex items-center">
            <div>
              <Image
                src={tweet.author.image || "/default-profile.png"}
                alt={`${tweet.author.name || "Unknown User"} profile picture`}
                width={48}
                height={48}
                className="rounded-full"
              />
            </div>
            <Typography className="pl-2" variant="h6">
              {tweet.author.name && (
                <Link href={`/${tweet.author.name}`}>{tweet.author.name}</Link>
              )}
            </Typography>
            <Typography
              className="pl-2"
              variant="subtitle1"
              color="textSecondary"
            >
              {dayjs(tweet.createdAt).fromNow()}
            </Typography>
          </div>
          <div className="p-2">
            <Typography>{tweet.text}</Typography>
          </div>
        </div>
      </div>
    </div>
  );
};
