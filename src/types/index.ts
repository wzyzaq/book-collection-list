export interface User {
  user_id: string;
  user_name: string;
  created_at: string;
  updated_at: string;
}

export interface Book {
  book_id: string;
  title: string;
  author: string;
  cover_url?: string;
  status: '未借阅' | '正借阅' | '已借阅';
  user_id?: string;
  created_at: string;
  updated_at: string;
}

export interface ReadingNote {
  note_id: string;
  book_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface BookWithNotes extends Book {
  reading_notes?: ReadingNote[];
}