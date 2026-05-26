import type { ProgressPatch, ProgressStore, StudyProgress } from "../types";

const keyForUser = (userId: string) => `english-word-cards:progress:${userId}`;

const createDefaultProgress = (userId: string, itemId: string): StudyProgress => ({
  userId,
  itemId,
  status: "new",
  favorite: false,
  mistakes: 0,
  studiedCount: 0
});

export class LocalProgressStore implements ProgressStore {
  async getProgress(userId: string): Promise<Record<string, StudyProgress>> {
    const raw = window.localStorage.getItem(keyForUser(userId));
    if (!raw) return {};

    try {
      return JSON.parse(raw) as Record<string, StudyProgress>;
    } catch {
      return {};
    }
  }

  async updateProgress(userId: string, itemId: string, patch: ProgressPatch): Promise<StudyProgress> {
    const allProgress = await this.getProgress(userId);
    const nextProgress = {
      ...createDefaultProgress(userId, itemId),
      ...allProgress[itemId],
      ...patch
    };

    allProgress[itemId] = nextProgress;
    window.localStorage.setItem(keyForUser(userId), JSON.stringify(allProgress));
    return nextProgress;
  }
}

export const progressStore: ProgressStore = new LocalProgressStore();
