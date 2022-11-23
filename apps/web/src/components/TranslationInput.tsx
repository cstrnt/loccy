import {
  InputGroup,
  Input,
  InputRightElement,
  Button,
  InputProps,
  IconButton,
  Tooltip,
} from "@chakra-ui/react";
import { forwardRef } from "react";
import { BsTranslate } from "react-icons/bs";
import { LocaleService } from "~/server/services/LocaleService";
import { useLoccyURLData } from "~/utils/hooks/useLoccyURLData";
import { trpc } from "~/utils/trpc";

function getTranslationButtonText(isDisabled?: boolean) {
  if (isDisabled) {
    return "You can't use the AutoTranslate feature because there is no given translation for the default locale";
  }
  return "Translate this key using the AI-powered AutoTranslate feature based on the default locale";
}

type Props = {
  nameSpace: string;
  name: string;
  languageKey: string;
  locale: string;
  hideTranslateButton?: boolean;
  isTranslationDisabled?: boolean;
} & Omit<InputProps, "name">;

// eslint-disable-next-line react/display-name
export const TranslationInput = forwardRef<HTMLInputElement, Props>(
  (
    {
      nameSpace,
      hideTranslateButton,
      isTranslationDisabled,
      languageKey,
      ...props
    },
    ref
  ) => {
    const utils = trpc.useContext();
    const { branchName, locale, projectId } = useLoccyURLData();
    const { mutate: autoTranslate, isLoading } =
      trpc.project.getKeyTranslations.useMutation({
        onSuccess: () => {
          utils.project.getBranch.invalidate({
            id: projectId,
            branchName,
          });
        },
      });

    return (
      <InputGroup>
        <Input ref={ref} pr="4.5rem" {...props} />
        {!hideTranslateButton && (
          <InputRightElement width="4.5rem">
            <Tooltip
              hasArrow
              label={getTranslationButtonText(isTranslationDisabled)}
              openDelay={500}
            >
              <IconButton
                aria-label={getTranslationButtonText(isTranslationDisabled)}
                h="1.75rem"
                w={10}
                size="sm"
                isLoading={isLoading}
                isDisabled={isTranslationDisabled}
                onClick={async () => {
                  autoTranslate({
                    branchName,
                    key: languageKey,
                    projectId,
                    locale,
                    nameSpace,
                  });
                }}
              >
                <BsTranslate />
              </IconButton>
            </Tooltip>
          </InputRightElement>
        )}
      </InputGroup>
    );
  }
);
