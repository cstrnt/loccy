import {
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Input,
  Select,
  Stack,
  useToast,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { ReactElement, useCallback, useEffect, useState } from "react";
import { LocaleService } from "~/server/services/LocaleService";
import { AppLayout } from "../../../layouts/AppLayout";
import { trpc } from "../../../utils/trpc";
import { useForm } from "react-hook-form";
import { LocaleKey } from "@prisma/client";

export default function MePage() {
  const toast = useToast();
  const router = useRouter();

  const { register, setError, formState, setValue, reset } = useForm({
    mode: "onChange",
  });

  const { data, refetch } = trpc.useQuery([
    "projects.getProjectBranch",
    {
      id: router.query.projectId as string,
      branchName: router.query.branch as string,
    },
  ]);

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

  const { mutateAsync } = trpc.useMutation(["projects.updateKey"]);

  const currentLocaleName =
    data?.locales?.find(
      (locale) => locale.name == (router.query.locale as string)
    )?.name ?? data?.locales?.find((locale) => locale.isDefault)?.name;

  const currentLocale = data?.locales.find(
    (locale) => locale.name === currentLocaleName
  );

  useEffect(() => {
    reset();
    data?.localeKeys.forEach((key) => {
      const value = (currentLocale?.content as any)?.[key.name] ?? "";
      if (!value) {
        setError(LocaleService.cleanLocaleKeyName(key.name), {
          type: "required",
        });
      }
      if (!validateKey(value, key.name)) return;

      setValue(LocaleService.cleanLocaleKeyName(key.name), value);
    });
  }, [
    currentLocale?.content,
    data?.localeKeys,
    reset,
    setError,
    setValue,
    validateKey,
  ]);

  const updateKey = async (newValue: string, key: string) => {
    if (!currentLocaleName || !currentLocale?.content) {
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
        title: "Saved",
      });
      refetch();
    } catch (e) {
      toast({
        position: "bottom-right",
        status: "error",
        title: "Could not update translation",
      });
    }
  };

  return (
    <>
      <Flex>
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
      </Flex>
      <Stack spacing={8}>
        {Array.from(data?.localeKeys ?? [])
          .sort((a, b) => a.name.localeCompare(b.name))
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
    </>
  );
}

MePage.getLayout = (page: ReactElement) => (
  <AppLayout title="Translations">{page}</AppLayout>
);
