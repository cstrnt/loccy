import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { ProjectService } from "../services/ProjectService";
import { t } from "../trpc";

export const projectRouter = t.router({
  getProjectBranch: t.procedure
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
      })
    )
    .mutation(async ({ input, ctx }) => {
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
          key_localeName_branchId: {
            key: input.key,
            localeName: input.locale,
            branchId: locale.branchId,
          },
        },
        update: {
          value: input.newValue,
        },
        create: {
          key: input.key,
          localeName: input.locale,
          branchId: locale.branchId,
          value: input.newValue,
          branchName: input.branchName,
          projectId: input.projectId,
        },
      });
    }),
  apiKeys: t.procedure
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
  revokeApikey: t.procedure
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
});
