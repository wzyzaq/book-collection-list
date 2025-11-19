import React, { useState, useEffect } from 'react'
import { Card, Tag, Button, Space, Loading, Empty, DialogPlugin } from 'tdesign-react'
import { Edit1Icon, DeleteIcon, SearchIcon } from 'tdesign-icons-react'
import { useNavigate } from 'react-router-dom'
import { Book } from '../types'
import bookService from '../services/books'
import { User } from '@supabase/supabase-js'

interface BookListProps {
  user: User | null
}

const statusOptions = ['全部', '未借阅', '正借阅', '已借阅']
const statusColors = {
  '未借阅': 'default',
  '正借阅': 'warning',
  '已借阅': 'success'
}

export const BookList: React.FC<BookListProps> = ({ user }) => {
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState('全部')
  const navigate = useNavigate()

  const fetchBooks = async (status?: string) => {
    setLoading(true)
    try {
      const booksData = await bookService.getBooks(status)
      setBooks(booksData)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBooks(selectedStatus === '全部' ? undefined : selectedStatus)
  }, [selectedStatus])

  const handleBookClick = (bookId: string) => {
    navigate(`/books/${bookId}`)
  }

  const handleEdit = (e: React.MouseEvent, bookId: string) => {
    e.stopPropagation()
    navigate(`/books/edit/${bookId}`)
  }

  const handleDelete = async (e: React.MouseEvent, bookId: string) => {
    e.stopPropagation()
    
    const confirmDia = DialogPlugin.confirm({
      header: '确认删除',
      body: '确定要删除这本图书吗？',
      confirmBtn: '确定',
      cancelBtn: '取消',
      onConfirm: async () => {
        try {
          await bookService.deleteBook(bookId)
          setBooks(books.filter(book => book.book_id !== bookId))
          confirmDia.hide()
        } catch (error) {
          DialogPlugin.error({
            header: '删除失败',
            body: '删除图书失败，请重试',
          })
        }
      },
    })
  }

  if (!user) {
    return (
      <div className="pt-20">
        <Empty 
          description="未登录用户无法查看图书列表"
          action={<Button theme="primary" onClick={() => {}}>请先登录</Button>}
        />
      </div>
    )
  }

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* 状态筛选 */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">我的图书</h2>
          <Space>
            {statusOptions.map(status => (
              <Button
                key={status}
                theme={selectedStatus === status ? 'primary' : 'default'}
                variant={selectedStatus === status ? 'filled' : 'dashed'}
                onClick={() => setSelectedStatus(status)}
              >
                {status}
              </Button>
            ))}
          </Space>
        </div>

        {/* 图书列表 */}
        <Loading loading={loading}>
          {books.length === 0 ? (
            <Empty 
              description="暂无图书"
              action={
                <Button 
                  theme="primary" 
                  icon={<Edit1Icon />}
                  onClick={() => navigate('/books/add')}
                >
                  添加第一本图书
                </Button>
              }
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {books.map(book => (
                <Card
                  key={book.book_id}
                  hoverable
                  className="cursor-pointer transition-transform hover:scale-105"
                  onClick={() => handleBookClick(book.book_id)}
                >
                  <div className="relative">
                    {/* 封面图 */}
                    <div className="h-48 bg-gradient-to-br from-blue-100 to-blue-200 rounded-t-lg flex items-center justify-center mb-4">
                      {book.cover_url ? (
                        <img 
                          src={book.cover_url} 
                          alt={book.title}
                          className="w-full h-full object-cover rounded-t-lg"
                        />
                      ) : (
                        <div className="text-blue-500 text-center">
                          <svg className="w-16 h-16 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"/>
                          </svg>
                          <p className="text-sm">暂无封面</p>
                        </div>
                      )}
                    </div>

                    {/* 图书信息 */}
                    <div className="space-y-2">
                      <h3 className="font-bold text-lg truncate">{book.title}</h3>
                      <p className="text-gray-600 text-sm truncate">{book.author}</p>
                      
                      <div className="flex items-center justify-between">
                        <Tag 
                          theme={statusColors[book.status as keyof typeof statusColors]}
                          variant="light"
                        >
                          {book.status}
                        </Tag>
                        
                        <Space size="small">
                          <Button
                            size="small"
                            variant="text"
                            icon={<SearchIcon />}
                            onClick={(e) => {
                              e.stopPropagation()
                              handleBookClick(book.book_id)
                            }}
                          />
                          <Button
                            size="small"
                            variant="text"
                            icon={<Edit1Icon />}
                            onClick={(e) => handleEdit(e, book.book_id)}
                          />
                          <Button
                            size="small"
                            variant="text"
                            icon={<DeleteIcon />}
                            onClick={(e) => handleDelete(e, book.book_id)}
                          />
                        </Space>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Loading>
      </div>
    </div>
  )
}