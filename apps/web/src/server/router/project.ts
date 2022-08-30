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
  });