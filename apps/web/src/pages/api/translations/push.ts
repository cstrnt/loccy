import { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { prisma } from "~/server/db/client";
import { ProjectService } from "~/server/services/ProjectService";
import { DEFAULT_BRANCH_NAME } from "~/utils/contants";
import { authHeadersSchema } from "../config/push";

const incomingBodySchema = z.array(
  z.object({
    locale: z.string(),
    namespace: z.string(),
    data: z.object({}).catchall(z.string()),
  })
);

export default async function pushTranslationsHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.status(405).end();
    return;
  }

  const body = incomingBodySchema.safeParse(req.body);
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

  const projectBranch = await prisma.projectBranch.findFirst({
    where: {
      projectId: apiKey.projectId,
      isDefault: true,
    },
  });
  if (!projectBranch) {
    res.status(400).end();
    return;
  }

  console.log({
    branchId: projectBranch.id,
    branchName: projectBranch.name,
    projectId: apiKey.projectId,
  });

  await prisma.translation.createMany({
    skipDuplicates: true,
    data: body.data.flatMap(({ data, locale, namespace }) =>
      Object.entries(data).map(([key, value]) => ({
        branchId: projectBranch.id,
        branchName: projectBranch.name,
        projectId: apiKey.projectId,
        localeName: locale,
        key,
        value,
        namespace,
      }))
    ),
  });

  res.status(200).end();
}
