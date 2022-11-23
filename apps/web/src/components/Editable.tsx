import {
  useEditableControls,
  ButtonGroup,
  IconButton,
  Flex,
  EditablePreview,
  Input,
  EditableInput,
  Editable,
} from "@chakra-ui/react";
import { useState } from "react";
import { BiEditAlt, BiX, BiCheck } from "react-icons/bi";

type Props = {
  initialValue: string;
  onSubmit: (value: string) => void;
};

export function LoccyEditable({ initialValue, onSubmit }: Props) {
  const [value, setValue] = useState(initialValue);

  /* Here's a custom control */
  function EditableControls() {
    const {
      isEditing,
      getSubmitButtonProps,
      getCancelButtonProps,
      getEditButtonProps,
    } = useEditableControls();

    return isEditing ? (
      <ButtonGroup justifyContent="center" size="sm">
        <IconButton
          icon={<BiCheck />}
          {...(getSubmitButtonProps() as any)}
          onClick={(e) => {
            getSubmitButtonProps().onClick?.(e);
            onSubmit(value);
          }}
        />
        <IconButton icon={<BiX />} {...(getCancelButtonProps() as any)} />
      </ButtonGroup>
    ) : (
      <Flex justifyContent="center">
        <IconButton
          size="sm"
          icon={<BiEditAlt />}
          {...(getEditButtonProps() as any)}
        />
      </Flex>
    );
  }

  return (
    <Editable
      textAlign="center"
      value={value}
      onChange={(nextValue) => setValue(nextValue)}
      fontSize="3xl"
      lineHeight="38px"
      isPreviewFocusable={false}
      display="flex"
      alignItems="center"
    >
      <EditablePreview mr={2} minW="100px" fontWeight="semibold" />
      {/* Here is the custom input */}
      <Input
        as={EditableInput}
        mr={2}
        fontSize="3xl"
        minW="100px"
        px={2}
        fontWeight="semibold"
      />
      <EditableControls />
    </Editable>
  );
}
