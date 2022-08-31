import {
  Box,
  Circle,
  Flex,
  Heading,
  Stack,
  useColorModeValue as mode,
} from "@chakra-ui/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { PropsWithChildren } from "react";
import { BiBook, BiBuoy, BiCog, BiHome, BiKey } from "react-icons/bi";
import { useI18n } from "~/utils/locales";
import { AccountSwitcher } from "../components/AppLayout/AccountSwitcher";
import { NavItem } from "../components/AppLayout/NavItem";

const useGetUrl = (newPath: string) => {
  const router = useRouter();
  const projectId = router.query.projectId;
  if (!projectId || typeof projectId !== "string") return "/";
  const searchParams = new URLSearchParams(router.asPath.split("?")[1]);
  return `/app/${projectId}/${newPath}?${searchParams.toString()}`;
};

export const AppLayout = ({ children }: PropsWithChildren) => {
  const { t } = useI18n();
  const router = useRouter();

  return (
    <Box height="100vh" overflow="hidden" position="relative">
      <Flex h="full" id="app-container">
        <Box w="64" bg="gray.900" color="white" fontSize="sm">
          <Flex h="full" direction="column" px="4" py="4">
            <AccountSwitcher />
            <Stack spacing="8" flex="1" overflow="auto" pt="8">
              <Stack spacing="1">
                <Link href={useGetUrl("translations")} passHref>
                  <NavItem
                    active={router.asPath.includes("/translations")}
                    icon={<BiHome />}
                    label={t("home")}
                  />
                </Link>
                <Link href={useGetUrl("secrets")} passHref>
                  <NavItem
                    active={router.asPath.includes("/secrets")}
                    icon={<BiKey />}
                    label={t("secrets")}
                  />
                </Link>
                <Link href={useGetUrl("settings")} passHref>
                  <NavItem
                    icon={<BiCog />}
                    active={router.asPath.includes("/settings")}
                    label={t("settings")}
                  />
                </Link>
              </Stack>

              {/* <NavGroup label="Your Business">
                <NavItem icon={<BiCreditCard />} label="Transactions" />
                <NavItem icon={<BiUserCircle />} label="Customers" />
                <NavItem icon={<BiWallet />} label="Income" />
                <NavItem icon={<BiRedo />} label="Transfer" />
              </NavGroup>

              <NavGroup label="Seller Tools">
                <NavItem icon={<BiNews />} label="Payment Pages" />
                <NavItem icon={<BiEnvelope />} label="Invoices" />
                <NavItem icon={<BiPurchaseTagAlt />} label="Plans" />
                <NavItem icon={<BiRecycle />} label="Subscription" />
              </NavGroup> */}
            </Stack>
            <Box>
              <Stack spacing="1">
                <Link href="/docs">
                  <NavItem
                    subtle
                    icon={<BiBook />}
                    label={t("documentation")}
                  />
                </Link>
                <Link href="/help">
                  <NavItem
                    subtle
                    icon={<BiBuoy />}
                    label={t("help")}
                    endElement={<Circle size="2" bg="blue.400" />}
                  />
                </Link>
              </Stack>
            </Box>
          </Flex>
        </Box>
        <Box bg={mode("white", "gray.800")} flex="1" p="6" overflowY="auto">
          {children}
        </Box>
      </Flex>
    </Box>
  );
};
