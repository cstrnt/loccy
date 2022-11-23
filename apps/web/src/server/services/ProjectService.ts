import { ROLE } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { prisma } from "../db/client";
import { type Context } from "../router/context";
import crypto from "crypto";
import { env } from "~/utils/env";
import { LocaleFile, LocaleKey, DEFAULT_NAMESPACE_NAME } from "@loccy/shared";
import jsum from "jsum";
import { DEFAULT_BRANCH_NAME } from "~/utils/contants";

export abstract class ProjectService {
  static createDefaultProject(userId: string) {
    return prisma.project.create({
      data: {
        name: "New Project",
        branches: {
          create: { name: DEFAULT_BRANCH_NAME, isDefault: true },
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

  static async deleteBranch(projectId: string, branchName: string) {
    const branch = await prisma.projectBranch.findUnique({
      where: {
        name_projectId: {
          name: branchName,
          projectId,
        },
      },
    });
    if (!branch) {
      throw new TRPCError({ code: "NOT_FOUND" });
    }

    await prisma.$transaction([
      prisma.translation.deleteMany({
        where: {
          branchId: branch.id,
        },
      }),
      prisma.localeKey.deleteMany({
        where: {
          branchName: branch.name,
          branchProjectId: branch.projectId,
        },
      }),
      prisma.projectBranch.delete({
        where: {
          name_projectId: {
            name: branchName,
            projectId,
          },
        },
      }),
    ]);
  }
  static async upsertLocaleKey({
    branchName,
    key,
    data,
    index,
    projectId,
    nameSpace = DEFAULT_NAMESPACE_NAME,
  }: {
    key: string;
    data: LocaleKey;
    projectId: string;
    nameSpace?: string;
    branchName: string;
    index: number;
  }) {
    const { description, params } = data;
    return prisma.localeKey.upsert({
      where: {
        name_branchName_branchProjectId_namespace: {
          name: key,
          branchName,
          branchProjectId: projectId,
          namespace: nameSpace,
        },
      },
      create: {
        name: key,
        branchName,
        branchProjectId: projectId,
        description,
        params: params ?? {},
        index,
        namespace: nameSpace,
      },
      update: {
        description,
        params: params ?? {},
        index,
        namespace: nameSpace,
      },
    });
  }
}
