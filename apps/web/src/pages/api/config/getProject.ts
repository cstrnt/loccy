import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "~/server/db/client";
import { z } from "zod";
import { authHeadersSchema } from "./push";
import { ProjectService } from "~/server/services/ProjectService";

export default async function PullHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const headers = await authHeadersSchema.parseAsync(req.headers);

  const hashedKey = ProjectService.encryptKey(headers.authorization);

  const project = await prisma.project.findFirst({
    where: {
      apiKeys: {
        some: {
          hashedKey,
        },
      },
    },
  });

  if (!project) {
    res.status(401).json({ error: "Invalid Token" });
    return;
  }

  res.json(project);
}
