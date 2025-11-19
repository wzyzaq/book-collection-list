import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Button, Space, Tag, Loading, Empty, Dialog, Form, Input, MessagePlugin, DialogPlugin, Divider } from 'tdesign-react'
import { Edit1Icon, DeleteIcon, AddIcon, ArrowLeftIcon } from 'tdesign-icons-react'
import { BookWithNotes, ReadingNote } from '../types'
import bookService from '../services/books'
import { User } from '@supabase/supabase-js'

interface BookDetailProps {
  user: User | null
}

const statusColors = {
  '未借阅': 'default',
  '正借阅': 'warning',
  '已借阅': 'success'
}

export const BookDetail: React.FC<BookDetailProps> = ({ user }) => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [book, setBook] = useState<BookWithNotes | null>(null)
  const [loading, setLoading] = useState(false)
  const [noteModalVisible, setNoteModalVisible] = useState(false)
  const [noteContent, setNoteContent] = useState('')
  const [notes, setNotes] = useState<ReadingNote[]>([])
  const [noteForm] = Form.useForm()

  useEffect(() => {
    if (id) {
      fetchBookDetail(id)
    }
  }, [id])

  const fetchBookDetail = async (bookId: string) => {
    setLoading(true)
    try {
      const bookData = await bookService.getBookWithNotes(bookId, user?.id)
      setBook(bookData)
      
      if (bookData?.reading_notes) {
        setNotes(bookData.reading_notes)
      } else {
        setNotes([])
      }
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = () => {
    if (book) {
      navigate(`/books/edit/${book.book_id}`)
    }
  }

  const handleDelete = async () => {
    if (!book) return

    const confirmDia = DialogPlugin.confirm({
      header: '确认删除',
      body: '确定要删除这本图书吗？',
      confirmBtn: '确定',
      cancelBtn: '取消',
      onConfirm: async () => {
        try {
          await bookService.deleteBook(book.book_id)
          MessagePlugin.success('图书删除成功')
          navigate('/')
          confirmDia.hide()
    } catch (error) {
      MessagePlugin.error('删除图书失败')
    }
      },
    })
  }

  const handleAddNote = () => {
    if (!user) {
      alert('请先登录')
      return
    }
    setNoteContent('')
    setNoteModalVisible(true)
  }

  const handleNoteSubmit = async () => {
    if (!book || !user) return
    if (!noteContent.trim()) {
      MessagePlugin.error('笔记内容不能为空')
      return
    }

    try {
      // 现在可以添加多条笔记了，因为数据库约束已移除
      await bookService.addReadingNote({
        book_id: book.book_id,
        user_id: user.id,
        content: noteContent
      })
      
      MessagePlugin.success('读书笔记保存成功')
      setNoteModalVisible(false)
      fetchBookDetail(book.book_id) // 重新获取数据以显示新的心得
    } catch (error: any) {
      MessagePlugin.error('保存读书笔记失败: ' + error?.message || '未知错误')
    }
  }

  if (!user) {
    return (
      <div className="pt-20">
        <Empty description="未登录用户无法查看图书详情" />
      </div>
    )
  }

  if (!book) {
    return (
      <div className="pt-20">
        <Loading loading={loading}>
          <Empty description="图书不存在或已被删除" />
        </Loading>
      </div>
    )
  }

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <Loading loading={loading}>
          {/* 返回按钮 */}
          <Button 
            variant="text" 
            icon={<ArrowLeftIcon />}
            onClick={() => navigate('/')}
            className="mb-6"
          >
            返回列表
          </Button>

          {/* 图书详情卡片 */}
          <Card className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* 封面图 */}
              <div className="md:col-span-1">
                <div className="h-96 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                  {book.cover_url ? (
                    <img 
                      src={book.cover_url} 
                      alt={book.title}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <div className="text-blue-500 text-center p-8">
                      <svg className="w-24 h-24 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"/>
                      </svg>
                      <p className="text-lg">暂无封面</p>
                    </div>
                  )}
                </div>
              </div>

              {/* 图书信息 */}
              <div className="md:col-span-2 space-y-6">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{book.title}</h1>
                  <p className="text-xl text-gray-600 mb-4">作者：{book.author}</p>
                  
                  <div className="flex items-center space-x-4 mb-6">
                    <Tag 
                      theme={statusColors[book.status as keyof typeof statusColors]}
                      variant="light"
                      size="large"
                    >
                      {book.status}
                    </Tag>
                    
                    <Space>
                      <Button 
                        theme="primary" 
                        icon={<Edit1Icon />}
                        onClick={handleEdit}
                      >
                        编辑图书
                      </Button>
                      <Button 
                        theme="danger" 
                        variant="outline"
                        icon={<DeleteIcon />}
                        onClick={handleDelete}
                      >
                        删除图书
                      </Button>
                    </Space>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold">阅读心得</h2>
                    <Button 
                      theme="primary" 
                      variant="dashed"
                      icon={<AddIcon />}
                      onClick={handleAddNote}
                    >
                      添加心得
                    </Button>
                  </div>

                  {/* 多个阅读心得列表 */}
                  {notes && notes.length > 0 ? (
                    <div 
                      className="overflow-y-auto pr-2 border border-gray-200 rounded-lg" 
                      style={{ 
                        maxHeight: '12rem',  // 精确设置高度显示约2条心得
                        scrollbarWidth: 'thin' 
                      }}
                    >
                      {notes.map((note, index) => (
                        <div key={note.note_id} className="p-6 border-b border-gray-200 last:border-b-0 relative group hover:bg-gray-50">
                          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                            {note.content}
                          </p>
                          <p className="text-sm text-gray-500 mt-4">
                            {new Date(note.created_at).toLocaleString()}
                          </p>
                          <Button
                            theme="danger"
                            variant="outline"
                            size="small"
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={async () => {
                              const confirmDia = DialogPlugin.confirm({
                                header: '确认删除',
                                body: '确定要删除这条读书笔记吗？',
                                confirmBtn: '确定',
                                cancelBtn: '取消',
                                onConfirm: async () => {
                                  try {
                                    await bookService.deleteReadingNote(note.note_id)
                                    MessagePlugin.success('读书笔记删除成功')
                                    fetchBookDetail(book!.book_id) // 重新获取数据
                                    confirmDia.hide()
                                  } catch (error) {
                                    MessagePlugin.error('删除读书笔记失败')
                                  }
                                },
                              })
                            }}
                          >
                            删除
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="border border-gray-200 rounded-lg p-8">
                      <Empty description="暂无心得，快来添加第一篇吧！" />
                    </div>
                  )}
                </div>

                {/* 其他信息 */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-3">图书信息</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">创建时间：</span>
                      {new Date(book.created_at).toLocaleString()}
                    </div>
                    <div>
                      <span className="text-gray-500">更新时间：</span>
                      {new Date(book.updated_at).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </Loading>

        {/* 读书笔记弹窗 */}
        <Dialog
          header="添加读书心得"
          visible={noteModalVisible}
          onClose={() => setNoteModalVisible(false)}
          onConfirm={handleNoteSubmit}
          confirmBtn="保存"
          width={600}
        >
          <Form onSubmit={handleNoteSubmit}>
            <Form.FormItem name="content" label="心得内容">
              <Input
                value={noteContent}
                onChange={setNoteContent}
                placeholder="请分享你的读书心得..."
                type="textarea"
                autosize={{ minRows: 8, maxRows: 12 }}
                maxLength={2000}
              />
            </Form.FormItem>
          </Form>
        </Dialog>
      </div>
    </div>
  )
}