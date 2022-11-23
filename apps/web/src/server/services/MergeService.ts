import { Translation } from "@prisma/client";
import { prisma } from "~/server/db/client";

export abstract class MergeService {
  private static getTranslationGroups(
    baseBranchTranslations: Translation[],
    newBranchTranslations: Translation[]
  ) {
    const translationsToDelete = baseBranchTranslations.filter(
      (translation) =>
        !newBranchTranslations.some(
          (tr) =>
            tr.localeName === translation.localeName &&
            tr.key === translation.key
        )
    );

    const translationsToAdd: Translation[] = [];
    const translationsToUpdate: Translation[] = [];
    const conflictedTranslations: Translation[] = [];

    newBranchTranslations.forEach((newTr) => {
      const baseTr = baseBranchTranslations.find(
        (tr) => tr.localeName === newTr.localeName && tr.key === newTr.key
      );

      if (!baseTr) {
        translationsToAdd.push(newTr);
        return;
      }
      if (baseTr.value !== newTr.value) {
        if (newTr.updatedAt > baseTr.updatedAt) {
          translationsToUpdate.push(newTr);
        } else {
          conflictedTranslations.push(newTr);
        }
      }
    });

    return {
      translationsToDelete,
      translationsToAdd,
      translationsToUpdate,
      conflictedTranslations,
    };
  }

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
        translations: true,
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
        translations: true,
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

    const oldTranslations = currentBranchData.translations;
    const newTranslations = newBranchData.translations;

    const {
      // TODO: handle conflicts -> rn just leave as is
      conflictedTranslations,
      translationsToAdd,
      translationsToDelete,
      translationsToUpdate,
    } = MergeService.getTranslationGroups(oldTranslations, newTranslations);

    await prisma.$transaction([
      // 3. Delete all keys that are not in the new branch
      ...keysToDelete.map((key) =>
        prisma.localeKey.delete({
          where: {
            name_branchName_branchProjectId_namespace: {
              branchName: currentBranchData.name,
              branchProjectId: projectId,
              name: key.name,
              namespace: key.namespace,
            },
          },
        })
      ),
      // 4. Add all keys that are not in the base branch
      ...keysToAdd.map((key) =>
        prisma.localeKey.create({
          data: {
            branchName: baseBranch,
            branchProjectId: projectId,
            name: key.name,
            index: key.index,
            params: key.params ?? {},
          },
        })
      ),
      // 5. Update all keys that are in both branches (new branch wins)
      ...keysToUpdate.map((key) =>
        prisma.localeKey.upsert({
          where: {
            name_branchName_branchProjectId_namespace: {
              name: key.name,
              branchName: currentBranchData.name,
              branchProjectId: currentBranchData.projectId,
              namespace: key.namespace,
            },
          },
          create: {
            name: key.name,
            branchName: currentBranchData.name,
            branchProjectId: currentBranchData.projectId,
            index: key.index,
            params: key.params ?? {},
            description: key.description,
          },
          update: {
            index: key.index,
            params: key.params ?? {},
            description: key.description,
          },
        })
      ),
      ...translationsToAdd.map(
        ({ createdAt, updatedAt, branchId, branchName, ...translation }) =>
          prisma.translation.create({
            data: {
              ...translation,
              branchId: currentBranchData.id,
              branchName: currentBranchData.name,
            },
          })
      ),
      // TODO: handle conflicts differently
      ...translationsToUpdate.map((translation) =>
        prisma.translation.update({
          where: {
            key_localeName_branchId_namespace: {
              ...translation,
              branchId: currentBranchData.id,
            },
          },
          data: {
            value: translation.value,
          },
        })
      ),
      ...translationsToDelete.map((tr) =>
        prisma.translation.delete({
          where: {
            key_localeName_branchId_namespace: {
              ...tr,
              branchId: currentBranchData.id,
            },
          },
        })
      ),
    ]);
  }
}
