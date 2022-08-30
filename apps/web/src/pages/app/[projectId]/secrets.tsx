import { Flex, Heading, IconButton, Stack, useToast } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { ReactElement } from "react";
import { BiPlus } from "react-icons/bi";
import { useI18n } from "~/utils/locales";
import { AppLayout } from "../../../layouts/AppLayout";
import { trpc } from "../../../utils/trpc";

export default function SecretsPage() {
  const { t } = useI18n();
  const toast = useToast();
  const router = useRouter();

  const { data, refetch } = trpc.useQuery([
    "projects.apiKeys",
    {
      projectId: router.query.projectId as string,
    },
  ]);

  const { mutateAsync } = trpc.useMutation(["projects.createApiKey"]);

  const createApiKey = async () => {
    if (typeof router.query.projectId !== "string") return;
    const key = await mutateAsync({ projectId: router.query.projectId });
    console.log(key);
  };

  console.log(data);
  return (
    <>
      <Stack>
        <Flex justifyContent="space-between">
          <Heading size="md">Api Keys</Heading>
          <IconButton
            aria-label={t("createApiKey")}
            title={t("createApiKey")}
            icon={<BiPlus />}
            onClick={createApiKey}
          />
        </Flex>
        <Stack>
          {data?.map((apiKey) => (
            <Flex key={apiKey.id}>
              {apiKey.name} | {apiKey.hashedKey}
            </Flex>
          ))}
        </Stack>
      </Stack>
    </>
  );
}

SecretsPage.getLayout = (page: ReactElement) => <AppLayout>{page}</AppLayout>;
