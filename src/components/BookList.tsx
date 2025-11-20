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
} as const;

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
          DialogPlugin.alert({
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
      <div className="container mx-auto px-4 py-6"> {/* 减小了padding */}
        {/* 状态筛选 */}
        <div className="mb-6"> {/* 减小了margin */}
          <h2 className="text-xl font-bold mb-3">我的图书</h2> {/* 减小了字体大小和margin */}
          <Space>
            {statusOptions.map(status => (
              <Button
                key={status}
                theme={selectedStatus === status ? 'primary' : 'default'}
                variant={selectedStatus === status ? 'outline' : 'dashed'}
                size="small" /* 添加了small尺寸 */
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
                  size="small" /* 添加了small尺寸 */
                  icon={<Edit1Icon />}
                  onClick={() => navigate('/books/add')}
                >
                  添加第一本图书
                </Button>
              }
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"> {/* 更多列，更小的gap */}
              {books.map(book => (
                <div 
                  key={book.book_id}
                  className="cursor-pointer transition-transform hover:scale-105 bg-white rounded-lg shadow-sm hover:shadow-md overflow-hidden flex flex-col h-full"
                  onClick={() => handleBookClick(book.book_id)}
                >
                  <Card bordered={false} size="small" className="flex flex-col h-full p-3"> {/* 使用small尺寸和更小的padding */}
                    {/* 封面图区域 - 更紧凑 */}
                    <div className="relative w-full" style={{ paddingBottom: '130%' }}> {/* 更紧凑的宽高比 */}
                      {book.cover_url ? (
                        <img 
                          src={book.cover_url} 
                          alt={book.title}
                          className="absolute inset-0 w-full h-full object-cover rounded"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center rounded">
                          <div className="text-center">
                            <svg className="w-8 h-8 mx-auto mb-1 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"/>
                            </svg>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* 图书信息区域 - 更紧凑 */}
                    <div className="mt-2 flex-grow flex flex-col">
                      <h3 className="font-semibold text-base truncate mb-0.5">{book.title}</h3>
                      <p className="text-gray-500 text-xs truncate mb-1.5">{book.author}</p>
                      
                      <div className="flex items-center justify-between mt-auto pt-1">
                        <Tag 
                          theme={statusColors[book.status as keyof typeof statusColors]}
                          variant="light"
                          size="small"
                          className="text-xs"
                        >
                          {book.status}
                        </Tag>
                        
                        <div onClick={e => e.stopPropagation()}>
                          <Space size="xsmall"> {/* 更小的按钮间距 */}
                            <Button
                              size="small"
                              variant="text"
                              icon={<SearchIcon />}
                              onClick={(e: React.MouseEvent) => {
                                e.stopPropagation()
                                handleBookClick(book.book_id)
                              }}
                            />
                            <Button
                              size="small"
                              variant="text"
                              icon={<Edit1Icon />}
                              onClick={(e: React.MouseEvent) => handleEdit(e, book.book_id)}
                            />
                            <Button
                              size="small"
                              variant="text"
                              icon={<DeleteIcon />}
                              onClick={(e: React.MouseEvent) => handleDelete(e, book.book_id)}
                            />
                          </Space>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              ))}
            </div>
          )}
        </Loading>
      </div>
    </div>
  )
}