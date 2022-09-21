import { ROLE } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { prisma } from "../db/client";
import { type Context } from "../router/context";
import crypto from "crypto";
import { env } from "~/utils/env";
import { LocaleFile } from "@loccy/shared";
import jsum from "jsum";

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
  static encryptKey(key: string) {
    return crypto
      .createHmac("sha256", env.ENCRYPTION_SECRET)
      .update(key)
      .digest("hex");
  }
  static async generateApiKey(projectId: string, name: string) {
    const key = crypto.randomBytes(32).toString("hex");

    const encrypted = ProjectService.encryptKey(key);

    await prisma.apiKey.create({
      data: {
        hashedKey: encrypted,
        name,
        project: { connect: { id: projectId } },
      },
    });
    return key;
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
    return project;
  }

  static getConfigHash(config: LocaleFile) {
    return jsum.digest(config, "SHA1", "HEX");
  }
}
