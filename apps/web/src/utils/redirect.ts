import { GetServerSidePropsContext } from "next";
import { unstable_getServerSession } from "next-auth";
import { authOptions } from "~/pages/api/auth/[...nextauth]";
import { prisma } from "~/server/db/client";

export async function redirectGSSP({ req, res }: GetServerSidePropsContext) {
  const session = await unstable_getServerSession(req, res, authOptions);

  const user = await prisma.user.findUnique({
    where: { email: session?.user?.email ?? "" },
    include: {
      projects: {
        include: {
          project: { include: { branches: { include: { locales: true } } } },
        },
      },
    },
  });

  if (!user || !user.projects[0] || !req.url) {
    console.log("redirecting to login");
    return {
      props: {},
      redirect: {
        destination: "/login",
      },
    };
  }
  return {
    props: {},
  };
}
