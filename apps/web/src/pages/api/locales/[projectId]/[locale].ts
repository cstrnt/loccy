import { DEFAULT_NAMESPACE_NAME } from "@loccy/shared";
import { Locale, Translation } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import NextCors from "nextjs-cors";
import { z } from "zod";
import { prisma } from "~/server/db/client";
import { translationFileCacheService } from "~/server/services/cache/TranslationFileCacheService";

import { DEFAULT_BRANCH_NAME } from "~/utils/contants";
import { toDotNotationObject } from "~/utils/helpers";

const paramsSchema = z.object({
  projectId: z.string(),
  locale: z.string(),
  branchName: z.string().optional(),
  type: z.union([z.literal("json"), z.literal("module")]).default("json"),
  ns: z.string().optional().default(DEFAULT_NAMESPACE_NAME),
  nesting: z
    .union([z.literal("true"), z.literal("false")])
    .optional()
    .default("true"),
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
    const { projectId, locale, branchName, type, ns, nesting } = params;
    const useDotNotation = nesting === "false";

    let content: Record<string, string> = {};

    const cachedTranslations =
      await translationFileCacheService.getTranslations(
        projectId,
        branchName ?? DEFAULT_BRANCH_NAME,
        locale,
        ns
      );

    if (cachedTranslations) {
      content = JSON.parse(cachedTranslations);
    } else {
      // TODO: CACHE IF BRANCH EXISTS?
      let translations: Translation[] | null = null;

      translations = await prisma.translation.findMany({
        where: {
          branchName: branchName,
          localeName: locale,
          projectId: projectId,
          namespace: ns,
        },
      });

      if (!translations || translations.length === 0) {
        translations = await prisma.translation.findMany({
          where: {
            branchName: DEFAULT_BRANCH_NAME,
            localeName: locale,
            projectId: projectId,
            namespace: ns,
          },
        });
      }

      if (!translations) {
        res.status(404).json({ error: "Locale not found" });
        return;
      }

      content = translations.reduce((acc, translation) => {
        acc[translation.key] = translation.value;
        return acc;
      }, {} as Record<string, string>);

      // Update cache
      await translationFileCacheService.setTranslations(
        projectId,
        branchName ?? DEFAULT_BRANCH_NAME,
        locale,
        ns,
        JSON.stringify(content)
      );
    }

    if (!req.query.noCache) {
      res.setHeader("Cache-Control", `s-maxage=60, stale-while-revalidate`);
    }

    if (type === "module") {
      res.setHeader("Content-Type", "application/javascript");
      res.send(`export default ${JSON.stringify(content)}`);
      return;
    }

    if (type === "json") {
      if (useDotNotation) {
        res.status(200).json(toDotNotationObject(content));
        return;
      }
      res.status(200).json(content);
      return;
    }
  } catch (e) {
    console.error(e);
    res.status(400).json({ error: "Something went wrong" });
  }
}
