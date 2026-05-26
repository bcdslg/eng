export type Category = {
  id: string;
  name: string;
  icon: string;
  color: string;
};

export type Word = {
  id: string;
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;
  chinese: string;
  english: string;
  pronunciation: string;
  imageUrl?: string;
  audioUrl?: string;
};

export type Sentence = {
  id: string;
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;
  chinese: string;
  english: string;
  scene: string;
  imageUrl?: string;
  audioUrl?: string;
};

export type StudyStatus = "new" | "learning" | "known";

export type StudyProgress = {
  userId: string;
  itemId: string;
  status: StudyStatus;
  favorite: boolean;
  mistakes: number;
  studiedCount: number;
  lastStudiedAt?: string;
};

export type ProgressPatch = Partial<
  Pick<StudyProgress, "status" | "favorite" | "mistakes" | "studiedCount" | "lastStudiedAt">
>;

export interface ProgressStore {
  getProgress(userId: string): Promise<Record<string, StudyProgress>>;
  updateProgress(userId: string, itemId: string, patch: ProgressPatch): Promise<StudyProgress>;
}
