import { GetServerSideProps } from "next";
import { unstable_getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]";
import { prisma } from "../../server/db/client";
import { url } from "inspector";

export default function AppPage() {
  return null;
}

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const session = await unstable_getServerSession(req, res, authOptions);

  const user = await prisma.user.findUnique({
    where: { email: session?.user?.email ?? undefined },
    include: {
      projects: { include: { project: { include: { branches: true } } } },
    },
  });

  if (!user || !user.projects[0] || !req.url) {
    return {
      props: {},
      redirect: {
        destination: "/",
      },
    };
  }

  return {
    props: {},
    redirect: {
      destination: `/app/${user.projects[0].projectId}?branch=${
        user.projects[0].project.branches.find((branch) => branch.isDefault)
          ?.name
      }`,
    },
  };
};