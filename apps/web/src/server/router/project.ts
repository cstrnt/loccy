import { createRouter } from "./context";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { ProjectService } from "../services/ProjectService";
import { LocaleService } from "../services/LocaleService";

export const projectRouter = createRouter()
  .query("getProjectBranch", {
    input: z.object({
      id: z.string(),
      branchName: z.string().nullish(),
    }),
    async resolve({ input, ctx }) {
      await ProjectService.hasAccessToProject({ ctx, projectId: input.id });
      const project = await ctx.prisma.project.findUnique({
        where: { id: input.id },
        include: { branches: { include: { locales: true, localeKeys: true } } },
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
    },
  })
  .mutation("updateKey", {
    input: z.object({
      projectId: z.string(),
      branchName: z.string(),
      locale: z.string(),
      key: z.string(),
      newValue: z.string(),
    }),
    async resolve({ input, ctx }) {
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
      if (!locale || !LocaleService.isValidJSON(locale.content)) {
        throw new TRPCError({ code: "BAD_REQUEST" });
      }

      await ctx.prisma.locale.update({
        where: {
          name_branchId: { name: locale.name, branchId: locale.branchId },
        },
        data: {
          content: {
            ...locale.content,
            [input.key]: input.newValue,
          },
        },
      });
    },
  })
  .query("apiKeys", {
    input: z.object({
      projectId: z.string(),
    }),
    async resolve({ input: { projectId }, ctx }) {
      await ProjectService.hasAccessToProject({
        ctx,
        projectId: projectId,
      });
      return ctx.prisma.apiKey.findMany({
        where: { projectId },
      });
    },
  })
  .mutation("createApiKey", {
    input: z.object({
      name: z.string().optional(),
      projectId: z.string(),
    }),
    async resolve({ input, ctx }) {
      await ProjectService.hasAccessToProject({
        ctx,
        projectId: input.projectId,
      });

      const apiKey = await ProjectService.generateApiKey(
        input.projectId,
        input.name ?? "New Api key"
      );

      return apiKey;
    },
  })
  .mutation("revokeApikey", {
    input: z.object({
      projectId: z.string(),
      keyId: z.string(),
    }),
    async resolve({ input: { keyId, projectId }, ctx }) {
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
    },
  });
