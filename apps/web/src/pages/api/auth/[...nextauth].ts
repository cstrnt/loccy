import NextAuth, { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

// Prisma adapter for NextAuth, optional and can be removed
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "../../../server/db/client";
import { ProjectService } from "../../../server/services/ProjectService";
import { env } from "~/utils/env";

export const authOptions: NextAuthOptions = {
  // Configure one or more authentication providers
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXT_AUTH_SECRET,
  events: {
    // Create first event on user creation
    async linkAccount({ user }) {
      if (!user.email) throw new Error("Invalid user");
      const currentUser = await prisma.user.findUnique({
        where: { email: user.email },
        include: { projects: true },
      });
      if (!currentUser) throw new Error("Invalid user");

      if (currentUser?.projects.length === 0) {
        await ProjectService.createDefaultProject(currentUser.id);
      }
    },
  },
  providers: [
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    }),
  ],
};

export default NextAuth(authOptions);
