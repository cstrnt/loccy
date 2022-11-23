import {
  Avatar,
  Box,
  Flex,
  FlexProps,
  HStack,
  Icon,
  Menu,
  MenuDivider,
  MenuGroup,
  MenuItem,
  MenuItemOption,
  MenuList,
  MenuOptionGroup,
  Skeleton,
  Text,
  useColorModeValue,
  useMenuButton,
} from "@chakra-ui/react";
import { inferProcedureOutput } from "@trpc/server";
import { signOut } from "next-auth/react";
import { useRouter } from "next/router";
import { BiGitBranch } from "react-icons/bi";
import { HiSelector } from "react-icons/hi";
import { DEFAULT_BRANCH_NAME } from "~/utils/contants";
import { useLoccyURLData } from "~/utils/hooks/useLoccyURLData";
import { AppRouter } from "../../server/router";
import { trpc } from "../../utils/trpc";

type ButtonProps = {
  data: NonNullable<inferProcedureOutput<AppRouter["user"]["me"]>>;
};

export const AccountSwitcherButton = ({
  data,
  ...props
}: FlexProps & ButtonProps) => {
  const { projectId, rawBranch } = useLoccyURLData();
  const buttonProps = useMenuButton(props);
  const currentProject = data?.projects?.find(
    (p) => p.projectId === projectId
  )?.project;

  return (
    <Flex
      as="button"
      {...buttonProps}
      w="full"
      display="flex"
      alignItems="center"
      rounded="lg"
      bg="gray.700"
      px="3"
      py="2"
      fontSize="sm"
      userSelect="none"
      cursor="pointer"
      outline="0"
      transition="all 0.2s"
      _active={{ bg: "gray.600" }}
      _focus={{ shadow: "outline" }}
      overflow="hidden"
    >
      <HStack flex="1" spacing="3" overflow="hidden">
        <Avatar
          w="8"
          h="8"
          src={data?.image ?? undefined}
          name={data?.name ?? "U"}
        />
        <Box textAlign="start" overflow="hidden">
          <Box noOfLines={1} fontWeight="semibold">
            {currentProject?.name}
          </Box>
          <Flex alignItems="center" fontSize="xs" color="gray.400">
            <Icon as={BiGitBranch} mr={1} />
            <Text whiteSpace="nowrap" textOverflow="ellipsis">
              {rawBranch ??
                currentProject?.branches.find((b) => b.isDefault)?.name}{" "}
            </Text>
          </Flex>
        </Box>
      </HStack>
      <Box fontSize="lg" color="gray.400">
        <HiSelector />
      </Box>
    </Flex>
  );
};

function changeBranch(newBranchName: string) {
  const url = new URL(window.location.href);
  url.searchParams.set("branch", newBranchName);
  return url;
}

export const AccountSwitcher = () => {
  const { branchName: currentBranch, projectId } = useLoccyURLData();
  const router = useRouter();
  const { data, isLoading } = trpc.user.me.useQuery(undefined, {
    cacheTime: 1000 * 60 * 5,
  });
  const currentProject = data?.projects.find(
    (p) => p.projectId === projectId
  )?.project;

  return (
    <Skeleton isLoaded={!isLoading}>
      <Menu>
        <AccountSwitcherButton data={data!} />
        <MenuList
          shadow="lg"
          py="4"
          color={useColorModeValue("gray.600", "gray.200")}
          px="3"
        >
          <Text fontWeight="medium" mb="2">
            {data?.email}
          </Text>
          <MenuOptionGroup
            value={currentBranch}
            onChange={(branchName) =>
              router.push(changeBranch(branchName as string))
            }
          >
            {currentProject?.branches.map((branch) => {
              const isCurrentBranch = branch.name === currentBranch;
              return (
                <MenuItemOption
                  key={branch.name}
                  value={branch.name}
                  fontWeight={isCurrentBranch ? "bold" : "normal"}
                  rounded="md"
                >
                  <Flex alignItems="center">
                    <Icon as={BiGitBranch} mr={1} /> {branch.name}{" "}
                    {isCurrentBranch ? "(current)" : ""}
                  </Flex>
                </MenuItemOption>
              );
            })}
          </MenuOptionGroup>
          <MenuDivider />
          <MenuGroup title="Select Project" ml={0}>
            <MenuOptionGroup
              value={projectId}
              onChange={(projectId) => router.push(`/app/${projectId}`)}
            >
              {data?.projects.map(({ project }) => {
                const isCurrentProject = project.id === projectId;
                return (
                  <MenuItemOption
                    key={project.id}
                    value={project.id}
                    fontWeight={isCurrentProject ? "bold" : "normal"}
                    rounded="md"
                  >
                    <Flex alignItems="center">{project.name} </Flex>
                  </MenuItemOption>
                );
              })}
            </MenuOptionGroup>
          </MenuGroup>
          <MenuDivider />
          <MenuItem
            rounded="md"
            onClick={async () => {
              await signOut();
              router.replace("/");
            }}
          >
            Logout
          </MenuItem>
        </MenuList>
      </Menu>
    </Skeleton>
  );
};
