import {
  Box,
  Flex,
  Heading,
  IconButton,
  Stack,
  StackDivider,
  Text,
  useToast,
} from "@chakra-ui/react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useRouter } from "next/router";
import { ReactElement, useState } from "react";
import { BiPlus, BiTrash } from "react-icons/bi";
import { ApiKeyAlert } from "~/components/ApiKeyAlert";
import { getLocaleProps, useI18n } from "~/utils/locales";
import { AppLayout } from "../../../layouts/AppLayout";
import { trpc } from "../../../utils/trpc";
dayjs.extend(relativeTime);

export default function SecretsPage() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const context = trpc.useContext();
  const { t } = useI18n();
  const toast = useToast();
  const router = useRouter();

  const { data } = trpc.project.getApiKeys.useQuery({
    projectId: router.query.projectId as string,
  });

  const { mutateAsync: remoteCreateApiKey } =
    trpc.project.createApiKey.useMutation();
  const { mutateAsync: remoteRevokeApikey } =
    trpc.project.revokeApiKey.useMutation();

  const createApiKey = async () => {
    if (typeof router.query.projectId !== "string") return;
    const key = await remoteCreateApiKey(
      { projectId: router.query.projectId },
      {
        onSuccess() {
          context.project.getApiKeys.invalidate();
        },
      }
    );
    setApiKey(key);
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
          context.project.getApiKeys.invalidate();
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

        <Box bg="gray.50" py="4">
          <ApiKeyAlert
            isOpen={apiKey != null}
            onClose={() => setApiKey(null)}
            apiKey={apiKey!}
          />
          <Stack divider={<StackDivider />} spacing="4">
            {data?.map((apiKey) => (
              <Stack
                key={apiKey.id}
                direction="row"
                fontSize="sm"
                px="4"
                spacing="0.5"
                justifyContent="space-between"
                rounded="xl"
              >
                <Box>
                  <Text fontWeight="medium" color="emphasized">
                    {apiKey.name}
                  </Text>
                  <Text color="subtle">
                    Created: {dayjs(apiKey.createdAt).fromNow()}
                  </Text>
                </Box>
                <IconButton
                  size="sm"
                  alignSelf="center"
                  icon={<BiTrash />}
                  colorScheme="red"
                  aria-label={t("revokeApikey")}
                  onClick={() => revokeApikey(apiKey.id)}
                />
              </Stack>
            ))}
          </Stack>
        </Box>
      </Stack>
    </>
  );
}

SecretsPage.getLayout = (page: ReactElement) => <AppLayout>{page}</AppLayout>;

export const getServerSideProps = getLocaleProps();
