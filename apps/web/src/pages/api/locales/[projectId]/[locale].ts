import { NextApiRequest, NextApiResponse } from "next";
import NextCors from "nextjs-cors";
import { z } from "zod";
import { prisma } from "~/server/db/client";
import { ProjectService } from "~/server/services/ProjectService";

const paramsSchema = z.object({
  projectId: z.string(),
  locale: z.string(),
  branchName: z.string().optional(),
  type: z.union([z.literal("json"), z.literal("module")]).default("json"),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    await NextCors(req, res, {
      // Options
      methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
      origin: "*",
      optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
    });

    const params = paramsSchema.parse(req.query);
    const { projectId, locale, branchName, type } = params;
    const persistedLocale = await prisma.locale.findFirst({
      where: {
        branch: {
          name: branchName ?? ProjectService.DEFAULT_BRANCH_NAME,
          projectId: projectId,
        },
        name: locale,
      },
    });
    if (!persistedLocale) {
      res.status(404).json({ error: "Locale not found" });
      return;
    }

    if (type === "module") {
      res.setHeader("Content-Type", "application/javascript");
      res.send(`export default ${JSON.stringify(persistedLocale.content)}`);
      return;
    }

    if (type === "json") {
      res.status(200).json(persistedLocale.content);
      return;
    }
  } catch (e) {
    res.status(400).json({ error: "Something went wrong" });
  }
}
