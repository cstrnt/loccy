import { Flex, Heading, Spinner } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { ReactNode } from "react";
import { LoccyEditable } from "~/components/Editable";
import { UsersTable } from "~/components/UsersTable/UsersTable";
import { AppLayout } from "~/layouts/AppLayout";
import { useLoccyURLData } from "~/utils/hooks/useLoccyURLData";
import { getLocaleProps, useI18n } from "~/utils/locales";
import { withSession } from "~/utils/redirect";
import { trpc } from "~/utils/trpc";

/**
 * TODO:
 * - Rename Project (!!!MVP)
 * - Show list of branches (!)
 * - Allow user to change default branch (!)
 * - allow user to delete branch (!!)
 */

export default function SettingsPage() {
  const { t } = useI18n();
  const context = trpc.useContext();
  const { projectId } = useLoccyURLData();

  const { data: project, isLoading } = trpc.project.getById.useQuery({
    id: projectId,
  });

  const { mutateAsync: updateName } = trpc.project.changeName.useMutation({
    onSuccess() {
      context.user.me.invalidate();
    },
  });

  if (isLoading || !project) {
    return <Spinner />;
  }

  return (
    <>
      <Heading size="md">{t("settings")}</Heading>
      <Flex alignItems="center">
        <Heading size="sm" mr={1}>
          My Projects /{" "}
        </Heading>
        <LoccyEditable
          initialValue={project.name}
          onSubmit={(newName) => updateName({ projectId, name: newName })}
        />
      </Flex>
      <UsersTable />
    </>
  );
}

SettingsPage.getLayout = (page: ReactNode) => <AppLayout>{page}</AppLayout>;

export const getServerSideProps = getLocaleProps(withSession);
