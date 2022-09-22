import { initTRPC } from "@trpc/server";
import { Context } from "./router/context";
import superjson from "superjson";

export const t = initTRPC.context<Context>().create({
  // Optional:
  transformer: superjson,
  // Optional:
  errorFormatter({ shape }) {
    return {
      ...shape,
      data: {
        ...shape.data,
      },
    };
  },
});
