import { type NextPage } from "next";
import { useSession } from "next-auth/react";
import Head from "next/head";
import { LoggedOutBanner } from "../components/LoggedOutBanner";
import { CreateTweet } from "../components/CreateTweet";
import { Container } from "../components/Container";

const Home: NextPage = () => {
  const { data: session } = useSession();
  return (
    <>
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div>
        {/* Disabled ESLint rule for promise check void return */}
        <Container>
          <CreateTweet />
        </Container>
        <div>
          {session &&
            Object.entries(session as object).map(([key, value]) => (
              <p key={key}>
                {key}: {JSON.stringify(value)}
              </p>
            ))}
          {/* <p>{JSON.stringify(session)}</p> */}
        </div>
        <LoggedOutBanner />
      </div>
    </>
  );
};

export default Home;
