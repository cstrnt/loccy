import {
  Box,
  Button,
  Container,
  Skeleton,
  Stack,
  Text,
  useBreakpointValue,
  useColorModeValue,
  useDisclosure,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useLoccyURLData } from "~/utils/hooks/useLoccyURLData";
import { trpc } from "~/utils/trpc";
import { AddUserModal } from "../AddUserModal";
import { MemberTable } from "./UserTable";

export const UsersTable = () => {
  const { projectId } = useLoccyURLData();

  const {
    isOpen: isModalOpen,
    onClose: closeModal,
    onOpen: openModal,
  } = useDisclosure();

  const { data: project, isLoading } = trpc.project.getById.useQuery({
    id: projectId,
  });

  const { data: me } = trpc.user.me.useQuery();

  return (
    <>
      <Skeleton isLoaded={!isLoading}>
        <Box
          bg="bg-surface"
          boxShadow={{ base: "none", md: useColorModeValue("sm", "sm-dark") }}
          borderRadius={useBreakpointValue({ base: "none", md: "lg" })}
        >
          <Stack spacing="5">
            <Box px={{ base: "4", md: "6" }} pt="5">
              <Stack
                direction={{ base: "column", md: "row" }}
                justify="space-between"
              >
                <Text fontSize="lg" fontWeight="medium">
                  Members
                </Text>

                {/* 
                // TODO: re-enable search
                <InputGroup maxW="xs">
                  <InputLeftElement pointerEvents="none">
                    <Icon as={FiSearch} color="muted" boxSize="5" />
                  </InputLeftElement>
                  <Input placeholder="Search" />
                </InputGroup> */}
                <Button colorScheme="brand" onClick={openModal}>
                  Add User
                </Button>
              </Stack>
            </Box>
            <Box overflowX="auto">
              <MemberTable
                users={project?.users ?? []}
                canEdit={project?.users?.some(
                  (u) => u.userId === me?.id && u.role === "ADMIN"
                )}
              />
            </Box>
            {/* <Box px={{ base: "4", md: "6" }} pb="5">
              <HStack spacing="3" justify="space-between">
                {!isMobile && (
                  <Text color="muted" fontSize="sm">
                    Showing 1 to 5 of 42 results
                  </Text>
                )}
                <ButtonGroup
                  spacing="3"
                  justifyContent="space-between"
                  width={{ base: "full", md: "auto" }}
                  variant="secondary"
                >
                  <Button>Previous</Button>
                  <Button>Next</Button>
                </ButtonGroup>
              </HStack>
            </Box> */}
          </Stack>
        </Box>
      </Skeleton>
      <AddUserModal isOpen={isModalOpen} onClose={closeModal} />
    </>
  );
};
