import { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { MergeService } from "~/server/services/MergeService";

const bodySchema = z.object({
  fromBranchName: z.string(),
  toBranchName: z.string(),
  // can be removed -> infer from apiKey
  projectId: z.string(),
});

export default async function PullHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  const body = bodySchema.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: "Invalid body" });
    return;
  }
  const { fromBranchName, toBranchName, projectId } = body.data;

  // TODO: check if the user has access to the project
  await MergeService.merge({
    baseBranch: toBranchName,
    newBranch: fromBranchName,
    projectId,
  });

  res.status(200).end();
}
