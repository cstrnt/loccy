import {
  Box,
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Heading,
  Icon,
  Input,
  InputGroup,
  InputRightElement,
  Select,
  Stack,
  Tooltip,
  useToast,
} from "@chakra-ui/react";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { Fragment, ReactElement, useCallback, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { BsTranslate } from "react-icons/bs";
import { TranslationInput } from "~/components/TranslationInput";
import { LocaleService } from "~/server/services/LocaleService";
import { DEFAULT_BRANCH_NAME } from "~/utils/contants";
import { groupTranslationsByNS } from "~/utils/helpers";
import { useLoccyURLData } from "~/utils/hooks/useLoccyURLData";
import { getLocaleProps, useI18n } from "~/utils/locales";
import { withSession } from "~/utils/redirect";
import { AppLayout } from "../../../layouts/AppLayout";
import { trpc } from "../../../utils/trpc";

export default function TranslationsPage() {
  const { projectId } = useLoccyURLData();
  const toast = useToast();
  const router = useRouter();
  const { t } = useI18n();

  const branchName = (router.query.branch as string) || DEFAULT_BRANCH_NAME;

  const { register, setError, formState, setValue, reset } = useForm({
    mode: "onChange",
  });

  const { data } = trpc.project.getBranch.useQuery({
    id: router.query.projectId as string,
    branchName,
  });

  const validateKey = useCallback(
    (value: string, keyName: string) => {
      const selectedKey = data?.localeKeys?.find((k) => k.name === keyName);
      if (!selectedKey) {
        return {
          isValid: false,
          message: "Key not found",
        };
      }

      const { isValid, missingParams } = LocaleService.isValidLocaleValue(
        value,
        selectedKey
      );

      if (!isValid) {
        return {
          isValid: false,
          message: `Missing params: ${missingParams.join(", ")}`,
        };
      }

      return {
        isValid: true,
        message: undefined,
      };
    },
    [data?.localeKeys]
  );

  const { mutateAsync } = trpc.project.updateKey.useMutation();

  const defaultLocale = useMemo(
    () => data?.locales?.find((l) => l.isDefault),
    [data?.locales]
  );

  const currentLocaleName =
    data?.locales?.find(
      (locale) => locale.name == (router.query.locale as string)
    )?.name ?? defaultLocale?.name;

  const currentTranslations = useMemo(
    () =>
      data?.translations.filter((tr) => tr.localeName === currentLocaleName) ??
      [],
    [currentLocaleName, data?.translations]
  );

  useEffect(() => {
    // reset every key
    reset(
      data?.localeKeys.reduce<Record<string, string>>((acc, key) => {
        acc[LocaleService.cleanLocaleKeyName(key.name)] = "";
        return acc;
      }, {})
    );

    data?.localeKeys.forEach((key) => {
      const cleanKeyName = LocaleService.cleanLocaleKeyName(key.name);

      const value = currentTranslations.find(
        (tr) => tr.key === key.name
      )?.value;

      if (!value) {
        setError(cleanKeyName, {
          type: "required",
        });
        return;
      }
      if (!validateKey(value, key.name)) return;

      setValue(cleanKeyName, value);
    });
  }, [
    currentLocaleName,
    currentTranslations,
    data?.localeKeys,
    reset,
    setError,
    setValue,
    validateKey,
  ]);

  const updateKey = async (
    newValue: string,
    key: string,
    namespace: string
  ) => {
    if (!currentLocaleName || !currentTranslations) {
      return;
    }

    if (!validateKey(newValue, key).isValid) return;

    try {
      await mutateAsync({
        branchName,
        projectId: router.query.projectId as string,
        locale: currentLocaleName!,
        key,
        newValue,
        nameSpace: namespace,
      });
      toast({
        position: "bottom-right",
        status: "success",
        title: t("saved"),
      });
    } catch (e) {
      toast({
        position: "bottom-right",
        status: "error",
        title: t("localeSaveError"),
      });
    }
  };

  return (
    <Box height="100%">
      <Flex alignItems="center" justifyContent="space-between" mb={4}>
        <Box mb={6}>
          <Heading size="md">{t("translations")}</Heading>
        </Box>
        <FormControl maxW={150}>
          <FormLabel>{t("selectLocale")}</FormLabel>
          <Select
            value={currentLocaleName}
            onChange={(e) => {
              router.push(
                {
                  ...router,
                  query: { ...router.query, locale: e.target.value },
                },
                undefined,
                { shallow: true }
              );
            }}
          >
            {data?.locales.map((locale) => (
              <option key={locale.name} value={locale.name}>
                {locale.name}
              </option>
            ))}
          </Select>
        </FormControl>
      </Flex>

      <Stack spacing={8} overflowY="auto" height="calc(100% - 6rem)" px={2}>
        {Object.entries(
          groupTranslationsByNS(
            data?.localeKeys.sort((a, b) => a.index - b.index) ?? []
          )
        ).map(([namespace, entries]) => (
          <Fragment key={namespace}>
            <Heading size="xs" mb="-1rem !important">
              {namespace}
            </Heading>
            {entries.map(({ name, description }) => {
              const currentTranslation = data?.translations.find(
                (t) => t.localeName === currentLocaleName && t.key === name
              );

              return (
                <FormControl
                  key={`${name}-${currentLocaleName}`}
                  isInvalid={
                    !!formState.errors[LocaleService.cleanLocaleKeyName(name)]
                  }
                >
                  <FormLabel display="flex" alignItems="center">
                    {name}
                    {currentTranslation?.isAutoTranslated && (
                      <Tooltip
                        label="This translation was generated using AutoTranslate"
                        placement="top"
                        hasArrow
                      >
                        <Box as="span" ml={1}>
                          <BsTranslate />
                        </Box>
                      </Tooltip>
                    )}
                  </FormLabel>
                  <TranslationInput
                    nameSpace={namespace}
                    locale={currentLocaleName!}
                    hideTranslateButton={
                      currentLocaleName === defaultLocale?.name
                    }
                    languageKey={name}
                    isTranslationDisabled={!currentTranslation?.value}
                    {...register(LocaleService.cleanLocaleKeyName(name), {
                      required: "Required",
                      validate: (value) => validateKey(value, name).message,
                      onBlur: (e) => updateKey(e.target.value, name, namespace),
                    })}
                  />
                  <FormHelperText>{description}</FormHelperText>
                  <FormErrorMessage>
                    {formState.errors?.[
                      LocaleService.cleanLocaleKeyName(name)
                    ] != null
                      ? (formState.errors?.[
                          LocaleService.cleanLocaleKeyName(name)
                        ]?.message as any)
                      : null}
                  </FormErrorMessage>
                </FormControl>
              );
            })}
          </Fragment>
        ))}
      </Stack>
    </Box>
  );
}

TranslationsPage.getLayout = (page: ReactElement) => (
  <AppLayout>{page}</AppLayout>
);

export const getServerSideProps = withSession(getLocaleProps());
