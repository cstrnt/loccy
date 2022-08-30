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
import { BiBuoy, BiCog, BiHome, BiKey } from "react-icons/bi";
import { AccountSwitcher } from "../components/AppLayout/AccountSwitcher";
import { NavItem } from "../components/AppLayout/NavItem";

const getUrl = (projectId: string, newPath: string) => {
  if (typeof window === "undefined") return "/";
  const currentUrl = new URL(window.location.href);
  currentUrl.pathname = `/app/${projectId}/${newPath}`;
  return currentUrl.href;
};

export const AppLayout = ({
  children,
  title,
}: PropsWithChildren<{ title?: string }>) => {
  const router = useRouter();
  const projectId = router.query.projectId as string;

  return (
    <Box height="100vh" overflow="hidden" position="relative">
      <Flex h="full" id="app-container">
        <Box w="64" bg="gray.900" color="white" fontSize="sm">
          <Flex h="full" direction="column" px="4" py="4">
            <AccountSwitcher />
            <Stack spacing="8" flex="1" overflow="auto" pt="8">
              <Stack spacing="1">
                <Link href={getUrl(projectId, "translations")} passHref>
                  <NavItem
                    active={router.asPath.includes("/translations")}
                    icon={<BiHome />}
                    label="Home"
                  />
                </Link>
                <Link href={getUrl(projectId, "secrets")} passHref>
                  <NavItem
                    active={router.asPath.includes("/secrets")}
                    icon={<BiKey />}
                    label="Secrets"
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
                <Link href={getUrl(projectId, "settings")} passHref>
                  <NavItem
                    subtle
                    icon={<BiCog />}
                    active={router.asPath.includes("/secrets")}
                    label="Settings"
                  />
                </Link>
                <Link href="/help">
                  <NavItem
                    subtle
                    icon={<BiBuoy />}
                    label="Help & Support"
                    endElement={<Circle size="2" bg="blue.400" />}
                  />
                </Link>
              </Stack>
            </Box>
          </Flex>
        </Box>
        <Box bg={mode("white", "gray.800")} flex="1" p="6">
          <Box w="full" h="full" rounded="lg" overflowY="auto" p={6}>
            {title != null && (
              <Heading size="md" mb={6}>
                {title}
              </Heading>
            )}
            {children}
          </Box>
        </Box>
      </Flex>
    </Box>
  );
};
