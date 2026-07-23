import type { Library } from './library';

export interface Book {
  id: number;
  libraryId: number;
  title: string;
  author: string;
  year: number | null;
  description: string | null;
  coverImage: string | null;
  isAvailable: boolean;
  totalCopies: number;
  availableCopies: number;
  library: Library;
}

export interface BookSearchParams {
  library?: number;
  author?: string;
  title?: string;
  availableOnly?: boolean;
  limit?: number;
  offset?: number;
}