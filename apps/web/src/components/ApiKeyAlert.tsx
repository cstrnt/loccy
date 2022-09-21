import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogCloseButton,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
  useToast,
} from "@chakra-ui/react";
import { useRef } from "react";
import { BiCopy } from "react-icons/bi";
import { useI18n } from "~/utils/locales";

type Props = {
  onClose: () => void;
  isOpen: boolean;
  apiKey: string;
};

export function ApiKeyAlert({ isOpen, onClose, apiKey }: Props) {
  const toast = useToast();
  const { t } = useI18n();
  const closeButtonRef = useRef(null);

  const onCopyClick = async () => {
    await navigator.clipboard.writeText(apiKey);
    toast({
      title: t("apiKeyAlert.copied"),
      position: "bottom-right",
      status: "success",
    });
  };

  return (
    <AlertDialog
      motionPreset="slideInBottom"
      leastDestructiveRef={closeButtonRef}
      onClose={onClose}
      isOpen={isOpen}
      isCentered
    >
      <AlertDialogOverlay />

      <AlertDialogContent>
        <AlertDialogHeader>New Api Key</AlertDialogHeader>
        <AlertDialogCloseButton />
        <AlertDialogBody>
          {/* TODO: use translation */}
          Make sure to copy your personal access token now. You won’t be able to
          see it again!
          <InputGroup>
            <Input readOnly disabled pr="4.5rem" defaultValue={apiKey} />
            <InputRightElement width="4.5rem">
              <IconButton
                colorScheme="brand"
                h="2rem"
                icon={<BiCopy />}
                aria-label="Copy ApiKey"
                onClick={onCopyClick}
              />
            </InputRightElement>
          </InputGroup>
        </AlertDialogBody>
        <AlertDialogFooter>
          <Button ref={closeButtonRef} onClick={onClose}>
            {t("close")}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
