import { Typography } from "@mui/material";
import { RouterOutputs, api } from "../utils/api";
import { CreateTweet } from "./CreateTweet";
import Image from "next/image";

export const Tweet = ({
  tweet,
}: {
  tweet: RouterOutputs["tweet"]["timeline"][number];
}) => {
  return (
    <div>
      <div>
        <Image
          src={tweet.author.image || "/default-profile.png"}
          alt={`${tweet.author.name || "Unknown User"} profile picture`}
          width={48}
          height={48}
        />
        <Typography>{JSON.stringify(tweet)}</Typography>
      </div>
    </div>
  );
};

export const Timeline = () => {
  const { data: tweets, isLoading } = api.tweet.timeline.useQuery({});

  return (
    <div>
      <CreateTweet />
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        tweets?.map((tweet) => <Tweet key={tweet.id} tweet={tweet} />)
      )}
    </div>
  );
};
