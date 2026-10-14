export type ResourceKind = 'link' | 'video' | 'assessment' | 'timeline' | 'file';

export type AssessmentType = 'quiz' | 'test' | 'exam' | 'assignment' | 'past_paper' | 'project';

export interface Category {
  id: string;
  name: string;
  parent: string;
  order: number;
  visibleToStudents?: boolean;
  createdAt?: number;
  updatedAt?: number;
}

export interface ShelfItem {
  id: string;
  type: 'link' | 'file';
  kind?: ResourceKind;
  title: string;
  url?: string;
  cat: string;
  note?: string;
  fileName?: string;
  fileData?: string;
  ext?: string;
  size?: number;
  visibleToStudents?: boolean;
  // Assessment fields
  assessmentType?: AssessmentType;
  dueDate?: string;
  maxMarks?: number;
  // Video fields
  videoDuration?: string;
  embedUrl?: string;
  // Timeline fields
  timelineDate?: string;
  timelinePhase?: string;
  createdAt?: number;
  updatedAt?: number;
}

export interface TimelineMilestone {
  id: string;
  title: string;
  date: string;
  phase?: string;
  description?: string;
  cat?: string;
  linkUrl?: string;
  visibleToStudents?: boolean;
}

export interface ShelfConfig {
  shelfTitle?: string;
  shelfDescription?: string;
  teacherPasscodeHash?: string;
  seeded?: boolean;
  // Teacher visibility control for sections
  showExtraResourcesToStudents?: boolean;
  showAssessmentsToStudents?: boolean;
  showTimelineToStudents?: boolean;
  // Timeline app integration
  timelineAppUrl?: string;
  timelineAppTitle?: string;
  timelineEmbedMode?: boolean;
  updatedAt?: number;
}

export type ThemeMode = 'light' | 'dark' | 'auto';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

