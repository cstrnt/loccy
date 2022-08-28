import { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { ProjectService } from "~/server/services/ProjectService";
import { prisma } from "../../../server/db/client";

const incomingSchema = z.object({
  // TODO: REMOVE!!
  projectId: z.string(),
  locales: z.array(z.string()),
  defaultLocale: z.string(),
  branchName: z.string().default(ProjectService.DEFAULT_BRANCH_NAME),
  keys: z.object({}).catchall(
    z.object({
      description: z.string().optional(),
      params: z.object({}).catchall(z.string()).optional(),
    })
  ),
});

export default async function pushConfigHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.status(405).end();
    return;
  }
  const body = incomingSchema.safeParse(req.body);

  if (!body.success) {
    res.status(400).send(body.error);
    return;
  }

  const { locales, defaultLocale, keys, projectId, branchName } = body.data;

  if (!locales.includes(defaultLocale)) {
    console.log("default locale not in locales");
    res.status(400).end();
    return;
  }

  const currentBranch = await prisma.projectBranch.findUnique({
    where: {
      name_projectId: {
        projectId,
        name: branchName,
      },
    },
    include: { locales: true, localeKeys: true },
  });

  if (!currentBranch) {
    res.status(400).end();
    return;
  }

  const missingLocales = locales.filter(
    (locale) => !currentBranch.locales.some((l) => l.name === locale)
  );

  await Promise.all(
    missingLocales.map((locale) =>
      prisma.locale.upsert({
        where: { name_branchId: { branchId: currentBranch.id, name: locale } },
        create: { name: locale, branchId: currentBranch.id, content: {} },
        update: {},
      })
    )
  );

  await Promise.all(
    Object.entries(keys).map(([key, { description, params }]) =>
      prisma.localeKey.upsert({
        where: {
          name_branchName_branchProjectId: {
            name: key,
            branchName,
            branchProjectId: projectId,
          },
        },
        create: {
          name: key,
          branchName,
          branchProjectId: projectId,
          description,
          params: params ?? {},
        },
        update: {
          description,
          params,
        },
      })
    )
  );
  res.status(200).end();
}
