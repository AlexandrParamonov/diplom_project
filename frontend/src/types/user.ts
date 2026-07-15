export type UserRole = 'client' | 'admin' | 'manager';

export interface User {
  id: number;
  email: string;
  name: string;
  contactPhone: string | null;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}