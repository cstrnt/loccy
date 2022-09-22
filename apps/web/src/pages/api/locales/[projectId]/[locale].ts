import { Locale, Translation } from "@prisma/client";
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

    // TODO: CACHE whole JSON file, invalidate on Change?
    // TODO: CACHE IF BRANCH EXISTS?
    let translations: Translation[] | null = null;

    translations = await prisma.translation.findMany({
      where: {
        branchName: branchName,
        localeName: locale,
        projectId: projectId,
      },
    });

    if (!translations || translations.length === 0) {
      translations = await prisma.translation.findMany({
        where: {
          branchName: ProjectService.DEFAULT_BRANCH_NAME,
          localeName: locale,
          projectId: projectId,
        },
      });
    }

    if (!translations) {
      res.status(404).json({ error: "Locale not found" });
      return;
    }

    if (!req.query.noCache) {
      res.setHeader("Cache-Control", `s-maxage=60, stale-while-revalidate`);
    }

    const content = translations.reduce((acc, translation) => {
      acc[translation.key] = translation.value;
      return acc;
    }, {} as Record<string, string>);

    if (type === "module") {
      res.setHeader("Content-Type", "application/javascript");
      res.send(`export default ${JSON.stringify(content)}`);
      return;
    }

    if (type === "json") {
      res.status(200).json(content);
      return;
    }
  } catch (e) {
    res.status(400).json({ error: "Something went wrong" });
  }
}
