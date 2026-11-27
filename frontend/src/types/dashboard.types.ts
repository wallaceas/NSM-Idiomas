export type CefrCode = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
export type ContentKind = 'VIDEO' | 'EBOOK' | 'SHORT_STORY' | 'EXERCISE';

export interface LevelProgress {
  levelId: string;
  code: CefrCode;
  title: string;
  totalContents: number;
  completedContents: number;
  completionPercentage: number;
}

export interface ResumeContent {
  contentId: string;
  title: string;
  levelCode: CefrCode;
  type: ContentKind;
  lastPosition: string | null;
  percentage: number;
  updatedAt: string;
}

export interface DashboardData {
  dueFlashcardsCount: number;
  overallCompletionPercentage: number;
  levels: LevelProgress[];
  resumeContent: ResumeContent | null;
}