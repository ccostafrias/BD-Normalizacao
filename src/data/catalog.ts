import rawModules from './modules.json';
import rawDocuments from './documents.json';
import { validateQuestions } from '../lib/content-validation.mjs';
import type { Question, SourceDocument, StudyModule } from '../types';

export const modules = rawModules as StudyModule[];
export const documents = rawDocuments as SourceDocument[];
const files = import.meta.glob<Question[]>('./questions/*.json', { eager: true, import: 'default' });
export const questions: Question[] = validateQuestions(Object.values(files).flat(), modules, documents);
export const questionById = new Map(questions.map((q) => [q.id, q]));
export const questionsByModule = new Map(modules.map((module) => [module.id, questions.filter((q) => q.moduleId === module.id)]));
export const difficultyLabels = { easy: 'Fácil', medium: 'Intermediário', hard: 'Desafio' } as const;
export function sourceUrl(document: SourceDocument, page?: number) {
  return `${document.url}${page ? `#page=${page}` : ''}`;
}
