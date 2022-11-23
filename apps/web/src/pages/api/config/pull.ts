import { NextApiRequest, NextApiResponse } from "next";
import { ProjectService } from "~/server/services/ProjectService";
import { authHeadersSchema, incomingConfigSchema } from "./push";
import { prisma } from "~/server/db/client";
import { z } from "zod";
import { DEFAULT_NAMESPACE_NAME, LocaleFile, LocaleKey } from "@loccy/shared";

const querySchema = z.object({
  branchName: z.string(),
});

export default async function PullHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const headers = authHeadersSchema.safeParse(req.headers);
  const query = querySchema.safeParse(req.query);

  if (!headers.success || !query.success) {
    res.status(401).end();
    return;
  }

  const hashedKey = ProjectService.encryptKey(headers.data.authorization);

  const apiKey = await prisma.apiKey.findUnique({
    where: {
      hashedKey,
    },
  });

  if (!apiKey) {
    res.status(400).end();
    return;
  }

  const currentBranch = await prisma.projectBranch.upsert({
    where: {
      name_projectId: {
        name: query.data.branchName,
        projectId: apiKey.projectId,
      },
    },
    create: {
      name: query.data.branchName,
      projectId: apiKey.projectId,
    },
    update: {},
    include: {
      locales: true,
      localeKeys: {
        select: {
          description: true,
          name: true,
          params: true,
          index: true,
          namespace: true,
        },
      },
    },
  });

  const config: LocaleFile = {
    projectId: apiKey.projectId,
    defaultLocale: currentBranch.locales.find((l) => l.isDefault)?.name ?? "",
    locales: currentBranch.locales.map((locale) => locale.name),
    keys: currentBranch.localeKeys
      .sort((a, b) => a.index - b.index)
      .reduce<Record<string, LocaleKey>>((acc, cur) => {
        const params = cur.params as LocaleKey["params"];
        if (cur.namespace === DEFAULT_NAMESPACE_NAME) {
          acc[cur.name] = {
            description: cur.description ?? undefined,
            params:
              params != null && Object.keys(params).length > 0
                ? params
                : undefined,
          };
        } else {
          acc[cur.namespace] ??= {};
          // @ts-expect-error stupid TS
          acc[cur.namespace][cur.name] = {
            description: cur.description ?? undefined,
            params:
              params != null && Object.keys(params).length > 0
                ? params
                : undefined,
          };
        }
        return acc;
      }, {}),
  };

  res.json(config);
}
