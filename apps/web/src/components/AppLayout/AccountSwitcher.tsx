import {
  Avatar,
  Box,
  Flex,
  FlexProps,
  HStack,
  Icon,
  Img,
  Menu,
  MenuDivider,
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
import { BiGitBranch } from "react-icons/bi";
import { HiSelector } from "react-icons/hi";
import { AppRouter } from "../../server/router";
import { trpc } from "../../utils/trpc";

type ButtonProps = {
  data: NonNullable<
    inferProcedureOutput<AppRouter["_def"]["queries"]["user.me"]>
  >;
};

export const AccountSwitcherButton = ({
  data,
  ...props
}: FlexProps & ButtonProps) => {
  const buttonProps = useMenuButton(props);
  const currentProject = data?.projects[0]?.project;
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
    >
      <HStack flex="1" spacing="3">
        <Avatar
          w="8"
          h="8"
          rounded="md"
          objectFit="cover"
          src={data?.image ?? undefined}
          name={data?.name ?? "U"}
        />
        <Box textAlign="start">
          <Box noOfLines={1} fontWeight="semibold">
            {currentProject?.name}
          </Box>
          <Flex alignItems="center" fontSize="xs" color="gray.400">
            <Icon as={BiGitBranch} mr={1} />
            {currentProject?.branches[0]?.name}
          </Flex>
        </Box>
      </HStack>
      <Box fontSize="lg" color="gray.400">
        <HiSelector />
      </Box>
    </Flex>
  );
};

export const AccountSwitcher = () => {
  const { data, isLoading } = trpc.useQuery(["user.me"]);
  const currentProject = data?.projects[0]?.project;
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
          <MenuOptionGroup defaultValue={currentProject?.branches[0]?.name}>
            {currentProject?.branches.map((branch) => (
              <MenuItemOption
                key={branch.name}
                value={branch.name}
                fontWeight="semibold"
                rounded="md"
              >
                <Flex alignItems="center">
                  <Icon as={BiGitBranch} mr={1}/> {branch.name} {branch.isDefault ? "(default)" : ""}
                </Flex>
              </MenuItemOption>
            ))}
          </MenuOptionGroup>
          <MenuDivider />
          <MenuItem rounded="md">Create Branch</MenuItem>
          <MenuItem rounded="md">Workspace settings</MenuItem>
          <MenuItem rounded="md">Add an account</MenuItem>
          <MenuDivider />
          <MenuItem rounded="md">Logout</MenuItem>
        </MenuList>
      </Menu>
    </Skeleton>
  );
};
