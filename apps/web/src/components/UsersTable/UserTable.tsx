import {
  Avatar,
  Badge,
  Box,
  Checkbox,
  HStack,
  Icon,
  IconButton,
  Table,
  TableProps,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import { ProjectUsers, User } from "@prisma/client";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import { IoArrowDown } from "react-icons/io5";

type Props = TableProps & {
  users: Array<ProjectUsers & { user: User }>;
  canEdit?: boolean;
};

export const MemberTable = ({ users, canEdit, ...props }: Props) => (
  <Table {...props}>
    <Thead>
      <Tr>
        <Th>
          <HStack spacing="3">
            {/* <Checkbox /> */}
            <HStack spacing="1">
              <Text>Name</Text>
              {/* <Icon as={IoArrowDown} color="muted" boxSize="4" /> */}
            </HStack>
          </HStack>
        </Th>
        <Th>Role</Th>
        <Th>Email</Th>
        <Th></Th>
      </Tr>
    </Thead>
    <Tbody>
      {users.map(({ role, user }) => (
        <Tr key={user.id}>
          <Td>
            <HStack spacing="3">
              {/* <Checkbox /> */}
              <Avatar name={user.name ?? "L"} src={user.image!} boxSize="10" />
              <Box>
                <Text fontWeight="medium">{user.name}</Text>
              </Box>
            </HStack>
          </Td>
          <Td>
            <Badge
              size="sm"
              colorScheme={role === "ADMIN" ? "green" : "orange"}
            >
              {role}
            </Badge>
          </Td>
          <Td>
            <Text color="muted">{user.email}</Text>
          </Td>

          <Td>
            <HStack spacing="1">
              {canEdit && role !== "ADMIN" ? (
                <IconButton
                  icon={<FiTrash2 fontSize="1.25rem" />}
                  variant="ghost"
                  aria-label="Delete member"
                  colorScheme="red"
                />
              ) : null}
              {/* <IconButton
                icon={<FiEdit2 fontSize="1.25rem" />}
                variant="ghost"
                aria-label="Edit member"
              /> */}
            </HStack>
          </Td>
        </Tr>
      ))}
    </Tbody>
  </Table>
);
