import { GetServerSideProps } from "next";
import { unstable_getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]";
import { prisma } from "../../server/db/client";

export default function AppPage() {
  return null;
}

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
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
    redirect: {
      destination: `/app/${user.projects[0].projectId}/translations?branch=${
        user.projects[0].project.branches.find((branch) => branch.isDefault)
          ?.name
      }&locale=${
        user.projects[0].project.branches[0]?.locales.find((l) => l.isDefault)
          ?.name
      }`,
    },
  };
};
