import { TRPCError } from "@trpc/server";
import { t } from "../trpc";

const authMiddleware = t.middleware(async ({ ctx, next }) => {
  // Any queries or mutations after this middleware will
  // raise an error unless there is a current session
  if (!ctx.session) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next();
});

export const authRouter = t.router({
  getSession: t.procedure.query(({ ctx }) => ctx.session),
  getSecretMessage: t.procedure
    .use(authMiddleware)
    .query(({}) => "You are logged in and can see this secret message!"),
});
