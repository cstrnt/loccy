import { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { ProjectService } from "~/server/services/ProjectService";
import { prisma } from "../../../server/db/client";
import { localeFileSchema } from "@loccy/shared";
import bcrypt from "bcrypt";

const incomingSchema = localeFileSchema.merge(
  z.object({
    branchName: z.string().default(ProjectService.DEFAULT_BRANCH_NAME),
  })
);

const headersSchema = z.object({
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

  const body = incomingSchema.safeParse(req.body);
  const headers = headersSchema.safeParse(req.headers);

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

  const currentBranch = await prisma.projectBranch.findFirst({
    where: {
      project: { apiKeys: { some: { hashedKey } } },
    },
    include: { locales: true, localeKeys: true },
  });

  if (!currentBranch) {
    console.log({ hashedKey, authorization });
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
            branchProjectId: currentBranch.projectId,
          },
        },
        create: {
          name: key,
          branchName,
          branchProjectId: currentBranch.projectId,
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
