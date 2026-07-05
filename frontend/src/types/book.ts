export interface Book {
  id: number;
  title: string;
  author: string;
  year: number;
  description: string;
  coverImage: string;
  availableIn: number;
  category: 'featured' | 'new';
}