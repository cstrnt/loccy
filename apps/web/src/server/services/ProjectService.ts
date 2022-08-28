import { ROLE } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { prisma } from "../db/client";
import { Context } from "../router/context";

export abstract class ProjectService {
  static DEFAULT_BRANCH_NAME = "main";

  static createDefaultProject(userId: string) {
    return prisma.project.create({
      data: {
        name: "New Project",
        branches: {
          create: { name: ProjectService.DEFAULT_BRANCH_NAME, isDefault: true },
        },
        users: {
          create: { role: ROLE.ADMIN, user: { connect: { id: userId } } },
        },
      },
    });
  }
  static async hasAccessToProject({
    ctx,
    projectId,
  }: {
    projectId: string;
    ctx: Context;
  }) {
    if (!ctx.session?.user?.email) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    const project = await ctx.prisma.project.findFirst({
      where: {
        id: projectId,
        users: {
          some: {
            user: { email: ctx.session?.user?.email },
          },
        },
      },
    });

    if (!project) throw new TRPCError({ code: "UNAUTHORIZED" });
  }
}
