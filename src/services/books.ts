import { supabase } from '../lib/supabase'
import { Book, BookWithNotes, ReadingNote } from '../types'

export const bookService = {
  // 获取图书列表
  async getBooks(status?: string): Promise<Book[]> {
    let query = supabase
      .from('books')
      .select('*')
      .order('created_at', { ascending: false })

    if (status && status !== '全部') {
      query = query.eq('status', status)
    }

    const { data, error } = await query
    
    if (error) {
      throw error
    }
    
    return data || []
  },

  // 获取单本图书详情（包含多个读书笔记）
  async getBookWithNotes(bookId: string, userId?: string): Promise<BookWithNotes | null> {
    const { data: book, error: bookError } = await supabase
      .from('books')
      .select('*')
      .eq('book_id', bookId)
      .single()

    if (bookError) {
      return null
    }

    if (!book) {
      return null
    }

    // 如果有用户ID，查询该用户的所有笔记；否则查询该图书的所有笔记
    let notesQuery = supabase
      .from('reading_notes')
      .select('*')
      .eq('book_id', bookId)
      .order('created_at', { ascending: false }) // 按创建时间倒序排列，最新的在前面
    
    if (userId) {
      notesQuery = notesQuery.eq('user_id', userId)
    }
    
    const { data: notes, error: noteError } = await notesQuery

    return {
      ...book,
      reading_notes: notes || []
    }
  },

  // 仅获取图书信息（不包含笔记）
  async getBookWithNote(bookId: string, userId?: string): Promise<BookWithNotes | null> {
    return await this.getBookWithNotes(bookId, userId)
  },

  // 添加图书
  async addBook(book: Omit<Book, 'book_id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('books')
      .insert([book])
      .select()
      .single()

    if (error) {
      throw error
    }

    return data
  },

  // 更新图书
  async updateBook(bookId: string, updates: Partial<Book>) {
    const { data, error } = await supabase
      .from('books')
      .update(updates)
      .eq('book_id', bookId)
      .select()
      .single()

    if (error) {
      throw error
    }

    return data
  },

  // 删除图书
  async deleteBook(bookId: string) {
    const { error } = await supabase
      .from('books')
      .delete()
      .eq('book_id', bookId)

    if (error) {
      throw error
    }
  },

  // 添加读书笔记（允许多个笔记）
  async addReadingNote(note: Omit<ReadingNote, 'note_id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('reading_notes')
      .insert([note])
      .select()
      .single()

    if (error) {
      throw error
    }

    return data
  },

  // 添加或更新读书笔记（保留原有的upsert功能）
  async upsertReadingNote(note: Omit<ReadingNote, 'note_id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('reading_notes')
      .upsert([note], {
        onConflict: 'book_id,user_id'
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return data
  },

  // 更新读书笔记
  async updateReadingNote(noteId: string, updates: Partial<ReadingNote>) {
    const { data, error } = await supabase
      .from('reading_notes')
      .update(updates)
      .eq('note_id', noteId)
      .select()
      .single()

    if (error) {
      throw error
    }

    return data
  },

  // 删除读书笔记
  async deleteReadingNote(noteId: string) {
    const { error } = await supabase
      .from('reading_notes')
      .delete()
      .eq('note_id', noteId)

    if (error) {
      throw error
    }
  }
}

export default bookService