import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { unstable_getServerSession } from "next-auth";
import { authOptions } from "~/pages/api/auth/[...nextauth]";

export function withSession(handler?: GetServerSideProps) {
  return async (ctx: GetServerSidePropsContext) => {
    const session = await unstable_getServerSession(
      ctx.req,
      ctx.res,
      authOptions
    );

    if (!session) {
      return {
        props: {},
        redirect: {
          destination: "/login",
          permanent: false,
        },
      };
    }

    if (handler) {
      return handler?.(ctx);
    }
    return {
      props: {},
    };
  };
}
