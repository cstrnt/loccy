import { DEFAULT_NAMESPACE_NAME } from "@loccy/shared";
import { ROLE } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { translationFileCacheService } from "../services/cache/TranslationFileCacheService";
import { ProjectService } from "../services/ProjectService";
import { translationService } from "../services/TranslationService";
import { t } from "../trpc";

export const projectRouter = t.router({
  getById: t.procedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      await ProjectService.hasAccessToProject({ ctx, projectId: input.id });
      return ctx.prisma.project.findUniqueOrThrow({
        where: {
          id: input.id,
        },
        include: {
          users: {
            include: {
              user: true,
            },
          },
        },
      });
    }),
  getBranch: t.procedure
    .input(
      z.object({
        id: z.string(),
        branchName: z.string().nullish(),
      })
    )
    .query(async ({ input, ctx }) => {
      await ProjectService.hasAccessToProject({ ctx, projectId: input.id });
      const project = await ctx.prisma.project.findUnique({
        where: { id: input.id },
        include: {
          branches: {
            include: { locales: true, localeKeys: true, translations: true },
          },
        },
      });

      if (!project) throw new TRPCError({ code: "NOT_FOUND" });

      if (!input.branchName) {
        return project.branches.find((branch) => branch.isDefault);
      }
      const selectedBranch = project.branches.find(
        (branch) => branch.name === input.branchName
      );
      if (!selectedBranch) throw new TRPCError({ code: "NOT_FOUND" });

      return selectedBranch;
    }),
  updateKey: t.procedure
    .input(
      z.object({
        projectId: z.string(),
        branchName: z.string(),
        locale: z.string(),
        key: z.string(),
        newValue: z.string(),
        nameSpace: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const nameSpace = input.nameSpace ?? DEFAULT_NAMESPACE_NAME;
      await ProjectService.hasAccessToProject({
        ctx,
        projectId: input.projectId,
      });
      const locale = await ctx.prisma.locale.findFirst({
        where: {
          branch: {
            project: { id: input.projectId },
            name: input.branchName,
          },

          name: input.locale,
        },
      });

      if (!locale) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      await ctx.prisma.translation.upsert({
        where: {
          key_localeName_branchId_namespace: {
            key: input.key,
            localeName: input.locale,
            branchId: locale.branchId,
            namespace: nameSpace,
          },
        },
        update: {
          value: input.newValue,
          isAutoTranslated: false,
        },
        create: {
          key: input.key,
          localeName: input.locale,
          branchId: locale.branchId,
          value: input.newValue,
          branchName: input.branchName,
          projectId: input.projectId,
          namespace: nameSpace,
          isAutoTranslated: false,
        },
      });

      await translationFileCacheService.updateTranslationKey(
        input.projectId,
        input.branchName,
        input.locale,
        input.key,
        input.newValue,
        nameSpace
      );
    }),
  getApiKeys: t.procedure
    .input(
      z.object({
        projectId: z.string(),
      })
    )
    .query(async ({ input: { projectId }, ctx }) => {
      await ProjectService.hasAccessToProject({
        ctx,
        projectId: projectId,
      });
      return ctx.prisma.apiKey.findMany({
        where: { projectId },
        orderBy: { createdAt: "desc" },
      });
    }),
  createApiKey: t.procedure
    .input(
      z.object({
        name: z.string().optional(),
        projectId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await ProjectService.hasAccessToProject({
        ctx,
        projectId: input.projectId,
      });

      const apiKey = await ProjectService.generateApiKey(
        input.projectId,
        input.name ?? "New Api key"
      );

      return apiKey;
    }),
  revokeApiKey: t.procedure
    .input(
      z.object({
        projectId: z.string(),
        keyId: z.string(),
      })
    )
    .mutation(async ({ input: { keyId, projectId }, ctx }) => {
      await ProjectService.hasAccessToProject({
        ctx,
        projectId,
      });
      await ctx.prisma.project.findFirst({
        where: {
          id: projectId,
          apiKeys: {
            some: { id: keyId },
          },
        },
      });
      await ctx.prisma.apiKey.delete({
        where: {
          id: keyId,
        },
      });
    }),
  deleteBranch: t.procedure
    .input(
      z.object({
        projectId: z.string(),
        branchName: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ProjectService.hasAccessToProject({
        ctx,
        projectId: input.projectId,
      });

      await ProjectService.deleteBranch(input.projectId, input.branchName);
    }),
  getBranches: t.procedure
    .input(
      z.object({
        projectId: z.string(),
      })
    )
    .query(({ ctx, input }) => {
      if (!ctx.session?.user) throw new TRPCError({ code: "UNAUTHORIZED" });
      return ctx.prisma.projectBranch.findMany({
        where: {
          projectId: input.projectId,
          project: {
            users: {
              some: {
                user: {
                  email: ctx.session.user?.email,
                },
              },
            },
          },
        },
      });
    }),
  addUser: t.procedure
    .input(
      z.object({
        projectId: z.string(),
        email: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ProjectService.hasAccessToProject({
        ctx,
        projectId: input.projectId,
      });

      const user = await ctx.prisma.user.findUnique({
        where: {
          email: input.email,
        },
      });

      if (!user) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "User not found" });
      }

      await ctx.prisma.projectUsers.create({
        data: {
          userId: user.id,
          projectId: input.projectId,
          role: ROLE.USER,
        },
      });
    }),
  changeName: t.procedure
    .input(
      z.object({
        projectId: z.string(),
        name: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ProjectService.hasAccessToProject({
        ctx,
        projectId: input.projectId,
      });

      await ctx.prisma.project.update({
        where: {
          id: input.projectId,
        },
        data: {
          name: input.name,
        },
      });
    }),
  getKeyTranslations: t.procedure
    .input(
      z.object({
        projectId: z.string(),
        branchName: z.string(),
        locale: z.string(),
        key: z.string(),
        nameSpace: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ProjectService.hasAccessToProject({
        ctx,
        projectId: input.projectId,
      });

      const branch = await ctx.prisma.projectBranch.findUnique({
        where: {
          name_projectId: {
            name: input.branchName,
            projectId: input.projectId,
          },
        },
        include: {
          locales: { where: { isDefault: true } },
        },
      });

      const defaultBranch = branch?.locales.find((l) => l.isDefault);

      if (!branch || !defaultBranch) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Branch or locale not found",
        });
      }

      const translationInDefaultLocale =
        await ctx.prisma.translation.findUnique({
          where: {
            key_localeName_branchId_namespace: {
              key: input.key,
              localeName: defaultBranch.name,
              branchId: branch.id,
              namespace: input.nameSpace ?? DEFAULT_NAMESPACE_NAME,
            },
          },
        });

      if (!translationInDefaultLocale) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Translation not found",
        });
      }

      const newTranslation = await translationService.translate(
        translationInDefaultLocale.value,
        translationInDefaultLocale.localeName,
        input.locale
      );

      await ctx.prisma.translation.upsert({
        create: {
          key: input.key,
          value: newTranslation,
          localeName: input.locale,
          namespace: input.nameSpace ?? DEFAULT_NAMESPACE_NAME,
          branchName: branch.name,
          branchId: branch.id,
          projectId: input.projectId,
          isAutoTranslated: true,
        },
        update: {
          value: newTranslation,
          isAutoTranslated: true,
        },
        where: {
          key_localeName_branchId_namespace: {
            key: input.key,
            localeName: input.locale,
            branchId: branch.id,
            namespace: input.nameSpace ?? DEFAULT_NAMESPACE_NAME,
          },
        },
      });
    }),
});
