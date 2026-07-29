import type { Book } from './book';
import type { Library } from './library';
import type { User } from './user';

export type RentalStatus =
  | 'reserved'
  | 'active'
  | 'completed'
  | 'cancelled';

export interface Rental {
  id: number;
  userId: number;
  bookId: number;
  libraryId: number;
  dateStart: string;
  dateEnd: string;
  status: RentalStatus;
  createdAt: string;
  updatedAt: string;
  user: User;
  book: Book;
  library: Library;
}

export interface CreateRentalPayload {
  bookId: number;
  dateStart: string;
  dateEnd: string;
}

export interface RentalSearchParams {
  status?: RentalStatus;
  userId?: number;
  bookId?: number;
  libraryId?: number;
  limit?: number;
  offset?: number;
}
