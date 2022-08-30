import {
  Flex,
  Heading,
  IconButton,
  Stack,
  StackDivider,
  useToast,
  VStack,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { ReactElement } from "react";
import { BiPlus, BiTrash } from "react-icons/bi";
import { getLocaleProps, useI18n } from "~/utils/locales";
import { AppLayout } from "../../../layouts/AppLayout";
import { trpc } from "../../../utils/trpc";

export default function SecretsPage() {
  const context = trpc.useContext();
  const { t } = useI18n();
  const toast = useToast();
  const router = useRouter();

  const { data, refetch } = trpc.useQuery([
    "projects.apiKeys",
    {
      projectId: router.query.projectId as string,
    },
  ]);

  const { mutateAsync: remoteCreateApiKey } = trpc.useMutation([
    "projects.createApiKey",
  ]);
  const { mutateAsync: remoteRevokeApikey } = trpc.useMutation([
    "projects.revokeApikey",
  ]);

  const createApiKey = async () => {
    if (typeof router.query.projectId !== "string") return;
    const key = await remoteCreateApiKey(
      { projectId: router.query.projectId },
      {
        onSuccess() {
          context.invalidateQueries(["projects.apiKeys"]);
        },
      }
    );
    console.log(key);
  };

  const revokeApikey = async (id: string) => {
    if (typeof router.query.projectId !== "string") return;
    remoteRevokeApikey(
      { projectId: router.query.projectId, keyId: id },
      {
        onSuccess() {
          toast({
            status: "success",
            position: "bottom-right",
            title: t("apiKeyRevokeSuccess"),
          });
          context.invalidateQueries(["projects.apiKeys"]);
        },
      }
    );
  };
  return (
    <>
      <Stack>
        <Flex justifyContent="space-between">
          <Heading size="md">{t("secrets")}</Heading>
          <IconButton
            aria-label={t("createApiKey")}
            title={t("createApiKey")}
            icon={<BiPlus />}
            onClick={createApiKey}
          />
        </Flex>
        <VStack divider={<StackDivider borderColor="gray.200" />}>
          {data?.map((apiKey) => (
            <Flex key={apiKey.id}>
              {apiKey.name} | {apiKey.hashedKey}{" "}
              <IconButton
                aria-label={t("revokeApikey")}
                title={t("revokeApikey")}
                icon={<BiTrash />}
                colorScheme="red"
                onClick={() => revokeApikey(apiKey.id)}
              />
            </Flex>
          ))}
        </VStack>
      </Stack>
    </>
  );
}

SecretsPage.getLayout = (page: ReactElement) => <AppLayout>{page}</AppLayout>;

export const getServerSideProps = getLocaleProps();
