import type { NextPage } from "next";
import { signIn } from "next-auth/react";
import Head from "next/head";
import { trpc } from "../utils/trpc";

const Home: NextPage = () => {
  return (
    <>
      <button
        onClick={() =>
          signIn("google", {
            callbackUrl: "/app",
          })
        }
      >
        Sign In
      </button>
    </>
  );
};

export default Home;
