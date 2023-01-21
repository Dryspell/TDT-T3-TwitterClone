import { type NextPage } from "next";
import { useSession } from "next-auth/react";
import Head from "next/head";
import { LoggedOutBanner } from "../components/LoggedOutBanner";
import { Container } from "../components/Container";
import { Timeline } from "../components/Timeline";

const Home: NextPage = () => {
  const { data: session } = useSession();
  return (
    <>
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="TDT Twitter Clone" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div>
        {/* Disabled ESLint rule for promise check void return */}
        <Container>
          <Timeline userId={session?.user?.id || ""} />
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
