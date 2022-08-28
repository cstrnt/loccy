import { ReactElement } from "react";
import { AppLayout } from "../layouts/AppLayout";
import { trpc } from "../utils/trpc";

export default function MePage() {
  const { data } = trpc.useQuery(["user.me"]);
  return <pre>{JSON.stringify(data, null, 2)}</pre>;
}

MePage.getLayout = (page: ReactElement) => <AppLayout>{page}</AppLayout>;
