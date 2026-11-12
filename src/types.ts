export type ResourceType = 'notes' | 'syllabus' | 'pyqs' | 'important-questions' | 'short-notes';

export interface Subject {
  id: string;
  code: string;
  title: string;
  slug: string;
  semester: number;
  category: 'Pharmacology' | 'Pharmaceutics' | 'Medicinal Chemistry' | 'Pharmaceutical Analysis' | 'Pharmacognosy' | 'Core & Allied';
  summary: string;
  unitsCount: number;
  trending: boolean;
  createdAt: string;
}

export interface ResourceItem {
  id: string;
  title: string;
  subjectSlug: string;
  subjectCode: string;
  subjectTitle: string;
  semester: number;
  type: ResourceType;
  unitNumber: number; // 0 for full syllabus/PYQ, 1-5 for unit notes
  university: 'AKTU' | 'AKTU (PCI Syllabus)' | string;
  pages: number;
  fileSize: string;
  summary: string;
  previewContent: string;
  pdfDataUrl?: string;
  featured: boolean;
  downloads: number;
  authorUid: string;
  createdAt: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  category: 'GPAT & NIPER' | 'Exam Alerts' | 'Career Guidance' | 'D.Pharm to B.Pharm';
  readTime: string;
  publishedDate: string;
  excerpt: string;
  content: string;
  imageUrl: string;
  authorName: string;
  authorUid: string;
  createdAt: string;
}

export interface UserBookmark {
  id: string;
  userId: string;
  resourceId: string;
  resourceTitle: string;
  subjectSlug: string;
  semester: number;
  type: ResourceType;
  createdAt: string;
}

export interface RecentlyViewedItem {
  resourceId: string;
  title: string;
  subjectTitle: string;
  subjectSlug: string;
  semester: number;
  type: ResourceType;
  viewedAt: string;
}

export interface DrugFlashcard {
  id: string;
  abbrev: string;
  latinOrFull: string;
  meaning: string;
  category: 'Frequency' | 'Route' | 'Formulation' | 'Clinical Instruction';
  clinicalExample: string;
}

export interface QuizQuestion {
  id: string;
  subjectCategory: 'Pharmacology' | 'Pharmaceutics' | 'Medicinal Chemistry' | 'Pharmaceutical Analysis' | 'Pharmacognosy';
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}
