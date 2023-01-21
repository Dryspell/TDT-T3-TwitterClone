import { Typography } from "@mui/material";
import { RouterInputs, api } from "../utils/api";
import { CreateTweet } from "./CreateTweet";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Tweet } from "./Tweet";

const LIMIT = 10;

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

export const Timeline = ({
  userId,
  where = {},
}: {
  userId: string;
  where: RouterInputs["tweet"]["timeline"]["where"];
}) => {
  const scrollPosition = useScrollPosition();
  // console.log({ scrollPosition });

  const { data, isLoading, hasNextPage, fetchNextPage, isFetching } =
    api.tweet.timeline.useInfiniteQuery(
      { limit: LIMIT, where },
      { getNextPageParam: (lastPage) => lastPage.nextCursor }
    );

  const client = useQueryClient();

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
        tweets?.map((tweet) => (
          <Tweet
            key={tweet.id}
            tweet={tweet}
            client={client}
            userId={userId}
            input={{ where, limit: LIMIT }}
          />
        ))
      )}
      {!hasNextPage && !isLoading && (
        <div className="items-center">
          <Typography>No more items to load</Typography>
        </div>
      )}
    </div>
  );
};
