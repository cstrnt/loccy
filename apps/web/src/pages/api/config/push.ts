import { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { ProjectService } from "~/server/services/ProjectService";
import { prisma } from "../../../server/db/client";
import { localeFileSchema } from "@loccy/shared";
import { configCacheService } from "~/server/services/ConfigCacheService";

export const incomingConfigSchema = localeFileSchema.merge(
  z.object({
    branchName: z.string(),
  })
);

export const authHeadersSchema = z.object({
  authorization: z.string(),
});

export default async function pushConfigHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.status(405).end();
    return;
  }

  const body = incomingConfigSchema.safeParse(req.body);
  const headers = authHeadersSchema.safeParse(req.headers);

  if (!headers.success) {
    res.status(401).end();
    return;
  }

  if (!body.success) {
    res.status(400).send(body.error);
    return;
  }

  const { locales, defaultLocale, keys, branchName } = body.data;
  const { authorization } = headers.data;

  if (!locales.includes(defaultLocale)) {
    console.log("default locale not in locales");
    res.status(400).end();
    return;
  }

  const hashedKey = ProjectService.encryptKey(authorization);

  const apiKey = await prisma.apiKey.findUnique({
    where: {
      hashedKey,
    },
  });

  if (!apiKey) {
    res.status(400).end();
    return;
  }

  const configHash = ProjectService.getConfigHash(body.data);

  const savedHash = await configCacheService.getFileHash(
    apiKey.projectId,
    branchName
  );

  // we are done here, nothing changed
  if (savedHash === configHash) {
    console.log("Config is the same, nothing to do");
    res.status(200).end();
    return;
  }

  const currentBranch = await prisma.projectBranch.upsert({
    where: {
      name_projectId: {
        name: branchName,
        projectId: apiKey.projectId,
      },
    },
    create: {
      name: branchName,
      projectId: apiKey.projectId,
    },
    update: {},
    include: { locales: true },
  });

  const missingLocales = locales.filter(
    (locale) => !currentBranch.locales.some((l) => l.name === locale)
  );

  await Promise.all(
    missingLocales.map((locale) =>
      prisma.locale.upsert({
        where: { name_branchId: { branchId: currentBranch.id, name: locale } },
        create: {
          name: locale,
          branchId: currentBranch.id,
          isDefault: locale === defaultLocale,
        },
        update: {},
      })
    )
  );

  await prisma.localeKey.deleteMany({
    where: {
      name: { notIn: Object.keys(keys) },
      branchName,
      branchProjectId: currentBranch.projectId,
    },
  });

  await Promise.all(
    Object.entries(keys).map(([key, { description, params }], index) =>
      prisma.localeKey.upsert({
        where: {
          name_branchName_branchProjectId: {
            name: key,
            branchName,
            branchProjectId: currentBranch.projectId,
          },
        },
        create: {
          name: key,
          branchName,
          branchProjectId: currentBranch.projectId,
          description,
          params: params ?? {},
          index,
        },
        update: {
          description,
          params: params ?? {},
          index,
        },
      })
    )
  );

  await configCacheService.setFileHash(
    apiKey.projectId,
    branchName,
    ProjectService.getConfigHash(body.data)
  );

  res.status(200).end();
}
