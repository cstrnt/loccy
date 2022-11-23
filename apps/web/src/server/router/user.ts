import { TRPCError } from "@trpc/server";
import { t } from "../trpc";

export const userRouter = t.router({
  me: t.procedure.query(async ({ ctx }) => {
    if (!ctx.session?.user?.email) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    return ctx.prisma.user.findUnique({
      where: {
        email: ctx.session.user.email,
      },
      include: {
        projects: { include: { project: { include: { branches: true } } } },
      },
    });
  }),
});
