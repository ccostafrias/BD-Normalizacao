export type Difficulty = 'easy' | 'medium' | 'hard';
export type QuestionType = 'choice' | 'multi-choice' | 'attributes';
export type IconName = 'home' | 'book' | 'flask' | 'chart' | 'check' | 'close' | 'chevron' | 'key' | 'layers' | 'grid' | 'branch' | 'bulb' | 'rotate' | 'search' | 'external' | 'menu' | 'info' | 'play' | 'target' | 'circle' | 'download';
export interface Dependency {
  from: string[];
  to: string[];
}
export interface GuideEntry {
  id: string;
  term: string;
  aliases: string[];
  text: string;
  example: string;
  detail: string;
  related: string[];
}
export interface GuideSection {
  id: string;
  title: string;
  icon: IconName;
  color: string;
  intro: string;
  items: GuideEntry[];
  document: string;
  pages: number[];
}
export interface Relation {
  name: string;
  attributes: string[];
  dependencies: Dependency[];
}
export interface Source {
  document: string;
  pages: number[];
  kind: 'adapted' | 'original';
}
export interface SourceDocument {
  id: string;
  title: string;
  fileName: string;
  url: string;
  pages: number;
}
export interface RelationTable {
  name: string;
  attributes: string[];
  key: string[];
}
export interface SolutionStep {
  title: string;
  text: string;
  tables?: RelationTable[];
}
export interface Option {
  id: string;
  label: string;
  feedback: string;
}
export interface Question {
  id: string;
  moduleId: string;
  type: QuestionType;
  difficulty: Difficulty;
  title: string;
  prompt: string;
  assumption?: string;
  relation?: Relation;
  options?: Option[];
  answer: string[];
  hint: string;
  explanation: string;
  steps: SolutionStep[];
  sources: Source[];
  closureStart?: string[];
}
export interface StudyModule {
  id: string;
  title: string;
  description: string;
  shortTitle: string;
  icon: IconName;
  color: string;
  minutes: number;
  objectives: string[];
}
export interface Attempt {
  questionId: string;
  selected: string[];
  correct: boolean;
  hintUsed: boolean;
  timestamp: number;
}
export interface Progress {
  version: 1;
  attempts: Record<string, Attempt>;
  bookmarks: string[];
}
