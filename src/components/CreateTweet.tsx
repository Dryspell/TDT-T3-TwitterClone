import { FormEvent, useState } from "react";
import { api } from "../utils/api";
import { ZodError, z } from "zod";

export const tweetSchema = z.object({
  text: z
    .string({
      required_error:
        "Tweet text is required to be between 1 and 280 characters",
    })
    .min(1)
    .max(280),
});

export function CreateTweet() {
  const [tweetText, setTweetText] = useState("");
  const [error, setError] = useState("");

  const { mutateAsync } = api.tweet.create.useMutation();

  const handleSubmit = async (e: FormEvent) => {
    console.log("Tweeting: ", tweetText);
    e.preventDefault();

    try {
      tweetSchema.parse({ text: tweetText });
    } catch (err: ZodError | unknown) {
      console.log(err);
      if (err instanceof ZodError) setError(err.message);
      return;
    }

    await mutateAsync({ text: tweetText });
  };

  return (
    <>
      {error && <p>{JSON.stringify(error)}</p>}
      <form onSubmit={handleSubmit}>
        <textarea
          value={tweetText}
          onChange={(e) => setTweetText(e.target.value)}
        />

        <div>
          <button type="submit">Tweet</button>
        </div>
      </form>
    </>
  );
}
