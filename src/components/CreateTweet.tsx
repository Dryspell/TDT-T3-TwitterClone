import type { FormEvent } from "react";
import { useState } from "react";
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
      <form
        className="mb-2 flex w-full flex-col rounded-md border-2 p-4"
        onSubmit={handleSubmit}
      >
        <textarea
          className="w-full p-4 shadow"
          value={tweetText}
          onChange={(e) => setTweetText(e.target.value)}
        />

        <div className="mt-4 flex justify-end">
          <button
            className="rounded-md bg-primary px-4 py-2 text-white"
            type="submit"
          >
            Tweet
          </button>
        </div>
      </form>
    </>
  );
}
