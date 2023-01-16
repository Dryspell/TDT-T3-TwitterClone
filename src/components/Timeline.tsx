import { Typography } from "@mui/material";
import { RouterOutputs, api } from "../utils/api";
import { CreateTweet } from "./CreateTweet";
import Image from "next/image";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import updateLocale from "dayjs/plugin/updateLocale";
import { useEffect, useState } from "react";
import { AiFillHeart } from "react-icons/ai";
import { TbArrowBigDown, TbArrowBigTop } from "react-icons/tb";

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

const useScrollPosition = () => {
  const [scrollPosition, setScrollPosition] = useState(0);

  const handleScroll = () => {
    const height =
      document.documentElement.scrollHeight -
      document.documentElement.clientHeight;
    const windowScroll =
      document.body.scrollTop || document.documentElement.scrollTop;

    const scrolled = (windowScroll / height) * 100;
    setScrollPosition(scrolled);
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);
  return scrollPosition;
};

export const Tweet = ({
  tweet,
}: {
  tweet: RouterOutputs["tweet"]["timeline"]["tweets"][number];
}) => {
  const voteMutation = api.tweet.vote.useMutation().mutateAsync;
  const unVoteMutation = api.tweet.unvote.useMutation().mutateAsync;

  // const upVotes = tweet.votes.filter((vote) => vote.direction > 0);
  // const downVotes = tweet.votes.filter((vote) => vote.direction < 0);
  const hasVoted = tweet.votes.length > 0;

  return (
    <div className="mb-4 border-b-2 border-gray-500">
      <div className="flex p-2">
        <div>
          <Image
            src={tweet.author.image || "/default-profile.png"}
            alt={`${tweet.author.name || "Unknown User"} profile picture`}
            width={48}
            height={48}
            className="rounded-full"
          />
        </div>
        <div className="ml-2">
          <div className="flex items-center">
            <Typography variant="h6">{tweet.author.name}</Typography>
            <Typography
              className="pl-2"
              variant="subtitle1"
              color="textSecondary"
            >
              {dayjs(tweet.createdAt).fromNow()}
            </Typography>
          </div>
          <div>
            <Typography>{tweet.text}</Typography>
          </div>
        </div>
        <div className="mt-4 flex items-center p-2">
          <TbArrowBigTop />
          <AiFillHeart
            color={hasVoted ? "red" : "gray"}
            size="1.5rem"
            onClick={() => {
              console.log("Liked Tweet");
              if (hasVoted) {
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
          <TbArrowBigDown />
          <span className="text-sm text-gray-500">{10}</span>
        </div>
      </div>
    </div>
  );
};

export const Timeline = () => {
  const scrollPosition = useScrollPosition();
  // console.log({ scrollPosition });

  const { data, isLoading, hasNextPage, fetchNextPage, isFetching } =
    api.tweet.timeline.useInfiniteQuery(
      {},
      { getNextPageParam: (lastPage) => lastPage.nextCursor }
    );

  const tweets = data?.pages.flatMap((page) => page.tweets) ?? [];

  useEffect(() => {
    if (scrollPosition > 90 && !isFetching && hasNextPage) {
      fetchNextPage().catch((err) => console.error(err));
    }
  }, [scrollPosition, isFetching, hasNextPage, fetchNextPage]);

  return (
    <div className="border-l-2 border-r-2 border-gray-500">
      <CreateTweet />
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        tweets?.map((tweet) => <Tweet key={tweet.id} tweet={tweet} />)
      )}
      {!hasNextPage && !isLoading && (
        <div className="items-center">
          <Typography>No more items to load</Typography>
        </div>
      )}
    </div>
  );
};
