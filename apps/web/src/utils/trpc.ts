import { createTRPCNext } from "@trpc/next";
import type { AppRouter } from "../server/router/index";
import { httpLink } from "@trpc/client";
import superjson from "superjson";

export const trpc = createTRPCNext<AppRouter>({
  config({ ctx }) {
    if (typeof window !== "undefined") {
      // during client requests
      return {
        transformer: superjson, // optional - adds superjson serialization
        links: [
          httpLink({
            url: "/api/trpc",
          }),
        ],
      };
    }
    // The server needs to know your app's full url
    const url = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}/api/trpc`
      : "http://localhost:3000/api/trpc";

    return {
      transformer: superjson, // optional - adds superjson serialization
      links: [
        httpLink({
          url,
          /**
           * Set custom request headers on every request from tRPC
           * @link https://trpc.io/docs/v10/header
           */
          headers() {
            if (ctx?.req) {
              // To use SSR properly, you need to forward the client's headers to the server
              // This is so you can pass through things like cookies when we're server-side rendering
              // If you're using Node 18, omit the "connection" header
              const { connection: _connection, ...headers } = ctx.req.headers;
              return {
                ...headers,
                // Optional: inform server that it's an SSR request
                "x-ssr": "1",
              };
            }
            return {};
          },
        }),
      ],
    };
  },
  ssr: false,
});
