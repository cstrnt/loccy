import { useRouter } from "next/router";
import { DEFAULT_BRANCH_NAME } from "../contants";

export function useLoccyURLData() {
  const router = useRouter();

  const projectId = router.query.projectId as string;
  const branch = router.query.branch as string;
  const locale = router.query.locale as string;
  const branchName = branch || DEFAULT_BRANCH_NAME;

  return { projectId, branchName, rawBranch: branch, locale };
}
