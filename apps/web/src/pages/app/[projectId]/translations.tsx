import {
  Box,
  Flex,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Heading,
  Input,
  Select,
  Stack,
  useToast,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { ReactElement, useCallback, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { LocaleService } from "~/server/services/LocaleService";
import { getLocaleProps, useI18n } from "~/utils/locales";
import { redirectGSSP } from "~/utils/redirect";
import { AppLayout } from "../../../layouts/AppLayout";
import { trpc } from "../../../utils/trpc";

export default function TranslationsPage() {
  const toast = useToast();
  const router = useRouter();
  const { t } = useI18n();

  const { register, setError, formState, setValue, reset } = useForm({
    mode: "onChange",
  });

  const { data } = trpc.getProjectBranch.useQuery({
    id: router.query.projectId as string,
    branchName: router.query.branch as string,
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

  const { mutateAsync } = trpc.updateKey.useMutation();

  const currentLocaleName =
    data?.locales?.find(
      (locale) => locale.name == (router.query.locale as string)
    )?.name ?? data?.locales?.find((locale) => locale.isDefault)?.name;

  const currentTranslations = useMemo(
    () =>
      data?.translations.filter((tr) => tr.localeName === currentLocaleName) ??
      [],
    [currentLocaleName, data?.translations]
  );

  useEffect(() => {
    reset();
    data?.localeKeys.forEach((key) => {
      const value = currentTranslations.find(
        (tr) => tr.key === key.name
      )?.value;

      if (!value) {
        setError(LocaleService.cleanLocaleKeyName(key.name), {
          type: "required",
        });
        return;
      }
      if (!validateKey(value, key.name)) return;

      setValue(LocaleService.cleanLocaleKeyName(key.name), value);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLocaleName]);

  const updateKey = async (newValue: string, key: string) => {
    if (!currentLocaleName || !currentTranslations) {
      return;
    }

    if (!validateKey(newValue, key).isValid) return;

    try {
      await mutateAsync({
        branchName: router.query.branch as string,
        projectId: router.query.projectId as string,
        locale: currentLocaleName!,
        key,
        newValue,
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
            onChange={(e) =>
              router.push({
                ...router,
                query: { ...router.query, locale: e.target.value },
              })
            }
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
        {Array.from(data?.localeKeys ?? [])
          .sort((a, b) => a.index - b.index)
          .map(({ name, description, params }) => (
            <FormControl
              key={`${name}-${currentLocaleName}`}
              isInvalid={
                !!formState.errors[LocaleService.cleanLocaleKeyName(name)]
              }
            >
              <FormLabel>{name}</FormLabel>
              <Input
                {...register(LocaleService.cleanLocaleKeyName(name), {
                  required: "Required",
                  validate: (value) => validateKey(value, name).message,
                  onBlur: (e) => updateKey(e.target.value, name),
                })}
              />
              <FormHelperText>{description}</FormHelperText>
              <FormErrorMessage>
                {formState.errors?.[LocaleService.cleanLocaleKeyName(name)] !=
                null
                  ? (formState.errors?.[LocaleService.cleanLocaleKeyName(name)]
                      ?.message as any)
                  : null}
              </FormErrorMessage>
            </FormControl>
          ))}
      </Stack>
    </Box>
  );
}

TranslationsPage.getLayout = (page: ReactElement) => (
  <AppLayout>{page}</AppLayout>
);

export const getServerSideProps = getLocaleProps(redirectGSSP);
