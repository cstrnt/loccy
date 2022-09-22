import { authRouter } from "./auth";
import { userRouter } from "./user";
import { projectRouter } from "./project";
import { t } from "../trpc";

export const appRouter = t.mergeRouters(authRouter, userRouter, projectRouter);

// export type definition of API
export type AppRouter = typeof appRouter;
