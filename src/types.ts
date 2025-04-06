export interface Note {
  id: string;
  content: string;
  category: string;
  source: string;
  createdAt: Date;
}

export interface Category {
  name: string;
  color: string;
}