import { createRouter } from "./context";
import { TRPCError } from "@trpc/server";

export const userRouter = createRouter().query("me", {
  resolve({ ctx }) {
    if (!ctx.session?.user?.email)
      throw new TRPCError({ code: "UNAUTHORIZED" });
    return ctx.prisma.user.findUnique({
      where: {
        email: ctx.session.user.email,
      },
      include: {
        projects: { include: { project: { include: { branches: true } } } },
      },
    });
  },
});
