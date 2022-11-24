import { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { ProjectService } from "~/server/services/ProjectService";
import { prisma } from "../../../server/db/client";
import { localeFileSchema, isNamespaceObject } from "@loccy/shared";
import { configCacheService } from "~/server/services/cache/ConfigCacheService";
import { MergeService } from "~/server/services/MergeService";
import { DEFAULT_BRANCH_NAME } from "~/utils/contants";

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
    console.error(body.error);
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
  if (savedHash === configHash && process.env.NODE_ENV !== "development") {
    console.log("Config is the same, nothing to do");
    res.status(200).end();
    return;
  }

  let selectedBranch = await prisma.projectBranch.findUnique({
    where: {
      name_projectId: {
        name: branchName,
        projectId: apiKey.projectId,
      },
    },
    include: { locales: true, project: { include: { branches: true } } },
  });

  let isNewBranch = false;

  if (!selectedBranch) {
    isNewBranch = true;
    selectedBranch = await prisma.projectBranch.create({
      data: {
        name: branchName,
        projectId: apiKey.projectId,
      },
      include: { locales: true, project: { include: { branches: true } } },
    });
  }

  // synthetic case, can't happen
  if (!selectedBranch) {
    throw new Error("Branch not found");
  }

  // typescript is stupid, we just checked that it exists
  const currentBranch = selectedBranch!;

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

  if (isNewBranch) {
    await MergeService.merge({
      projectId: apiKey.projectId,
      baseBranch: selectedBranch.name,
      newBranch:
        selectedBranch.project.branches.find((b) => b.isDefault)?.name ??
        DEFAULT_BRANCH_NAME,
    });
  }

  await prisma.localeKey.deleteMany({
    where: {
      name: { notIn: Object.keys(keys) },
      branchName,
      branchProjectId: currentBranch.projectId,
    },
  });

  await Promise.all(
    Object.entries(keys).flatMap(([key, data], index) => {
      if (isNamespaceObject(data)) {
        return Object.entries(data).map(([subKey, value]) => {
          return ProjectService.upsertLocaleKey({
            branchName,
            data: value,
            key: subKey,
            index,
            nameSpace: key,
            projectId: apiKey.projectId,
          });
        });
      }
      return ProjectService.upsertLocaleKey({
        data,
        branchName,
        index,
        key,
        projectId: apiKey.projectId,
      });
    })
  );

  await configCacheService.setFileHash(
    apiKey.projectId,
    branchName,
    ProjectService.getConfigHash(body.data)
  );

  res.status(200).end();
}
