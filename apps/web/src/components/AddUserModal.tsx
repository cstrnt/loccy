import {
  Button,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  Input,
  useToast,
} from "@chakra-ui/react";
import { useRef, useState } from "react";
import { useLoccyURLData } from "~/utils/hooks/useLoccyURLData";
import { trpc } from "~/utils/trpc";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export function AddUserModal({ isOpen, onClose }: Props) {
  const context = trpc.useContext();
  const [email, setEmail] = useState<string | undefined>();
  const toast = useToast();

  const { projectId } = useLoccyURLData();
  const cancelRef = useRef(null);

  const { mutateAsync: addUser } = trpc.project.addUser.useMutation();

  const onAddClick = async () => {
    try {
      if (!email || !projectId) throw new Error();
      await addUser({
        email,
        projectId,
      });
      context.project.getById.invalidate({ id: projectId });
      onClose();
    } catch (e) {
      toast({
        status: "error",
        title: "Error adding user",
      });
    }
  };

  return (
    <AlertDialog
      isOpen={isOpen}
      leastDestructiveRef={cancelRef}
      onClose={onClose}
      size="2xl"
    >
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            Add User
          </AlertDialogHeader>

          <AlertDialogBody>
            Please insert the user&apos;s email address. Make sure that this
            person has an account already. Otherwise this will not work.
            <Input
              type="email"
              placeholder="hey@loccy.app"
              mt={4}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </AlertDialogBody>

          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="brand" onClick={onAddClick} ml={3}>
              Add
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
}
