import { Heading } from "@chakra-ui/react";
import { ReactNode } from "react";
import { AppLayout } from "~/layouts/AppLayout";
import { getLocaleProps, useI18n } from "~/utils/locales";
import { redirectGSSP } from "~/utils/redirect";

/**
 * TODO:
 * - Show list of branches
 * - Allow user to change default branch
 * - allow user to delete branch
 * - allow user to add users to this project (invite)
 */

export default function SettingsPage() {
  const { t } = useI18n();
  return (
    <>
      <Heading size="md">{t("settings")}</Heading>
    </>
  );
}

SettingsPage.getLayout = (page: ReactNode) => <AppLayout>{page}</AppLayout>;

export const getServerSideProps = getLocaleProps(redirectGSSP);
