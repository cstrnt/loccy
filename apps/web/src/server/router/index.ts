import { authRouter } from "./auth";
import { userRouter } from "./user";
import { projectRouter } from "./project";
import { t } from "../trpc";

export const appRouter = t.router({
  auth: authRouter,
  project: projectRouter,
  user: userRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
