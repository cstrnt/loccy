import { prisma } from "~/server/db/client";

export abstract class MergeService {
  static async merge({
    baseBranch,
    newBranch,
    projectId,
  }: {
    baseBranch: string;
    newBranch: string;
    projectId: string;
  }) {
    const currentBranchData = await prisma.projectBranch.findUnique({
      where: {
        name_projectId: {
          name: baseBranch,
          projectId,
        },
      },
      include: {
        localeKeys: true,
        locales: true,
      },
    });

    const newBranchData = await prisma.projectBranch.findUnique({
      where: {
        name_projectId: {
          name: newBranch,
          projectId,
        },
      },
      include: {
        localeKeys: true,
        locales: true,
      },
    });

    if (!currentBranchData || !newBranchData) {
      throw new Error("Branch not found");
    }

    // keys, but also translations
    const keysToDelete = currentBranchData.localeKeys.filter(
      (key) => !newBranchData.localeKeys.find((k) => k.name === key.name)
    );

    const keysToAdd = newBranchData.localeKeys.filter(
      (key) => !currentBranchData.localeKeys.find((k) => k.name === key.name)
    );

    const keysToUpdate = newBranchData.localeKeys.filter((key) =>
      currentBranchData.localeKeys.find((k) => k.name === key.name)
    );

    await prisma.$transaction([
      // 3. Delete all keys that are not in the new branch
      prisma.localeKey.deleteMany({
        where: {
          branchName: baseBranch,
          branchProjectId: projectId,
          name: {
            in: keysToDelete.map((k) => k.name),
          },
        },
      }),
      // 4. Add all keys that are not in the base branch
      prisma.localeKey.createMany({
        data: keysToAdd.map((key) => ({
          branchName: baseBranch,
          branchProjectId: projectId,
          name: key.name,
          index: key.index,
          params: key.params ?? {},
        })),
      }),
      // 5. Update all keys that are in both branches (new branch wins)
      ...keysToUpdate.map((key) =>
        prisma.localeKey.update({
          where: {
            name_branchName_branchProjectId: {
              name: key.name,
              branchName: baseBranch,
              branchProjectId: projectId,
            },
          },
          data: {
            index: key.index,
            params: key.params ?? {},
            description: key.description,
          },
        })
      ),
      // TODO: update translations
      // ...newBranchData.locales.map((locale) =>
      //   prisma.locale.update({
      //     where: {
      //       name_branchId: {
      //         name: locale.name,
      //         branchId: currentBranchData.id,
      //       },
      //     },
      //     data: {
      //       content: locale.content ?? {},
      //     },
      //   })
      // ),
    ]);
  }
}
