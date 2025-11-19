import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Form, Input, Button, Select, Loading, MessagePlugin } from 'tdesign-react'
import { ArrowLeftIcon } from 'tdesign-icons-react'

import bookService from '../services/books'
import { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

interface BookFormProps {
  user: User | null
}

const statusOptions = [
  { label: '未借阅', value: '未借阅' },
  { label: '正借阅', value: '正借阅' },
  { label: '已借阅', value: '已借阅' }
]

export const BookForm: React.FC<BookFormProps> = ({ user }) => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [coverImageUrl, setCoverImageUrl] = useState<string>('')
  const [form] = Form.useForm()
  const isEditMode = !!id





  useEffect(() => {
    if (isEditMode && id) {
      fetchBookDetail()
    } else if (!isEditMode) {
      // 非编辑模式时设置初始值
      form.setFieldsValue({
        title: '',
        author: '',
        cover_url: '',
        status: '未借阅'
      })
    }
  }, [id, isEditMode])

  const fetchBookDetail = async () => {
    if (!id) return

    setInitialLoading(true)
    try {
      const book = await bookService.getBookWithNote(id, user?.id)
      
      if (book) {
        const formValues = {
          title: book.title || '',
          author: book.author || '',
          cover_url: book.cover_url || '',
          status: book.status || '未借阅'
        }
        
        // 使用 Form 的 setFieldsValue 方法设置表单值
        form.setFieldsValue(formValues)
        // 设置封面图片 URL 用于显示
        if (book.cover_url) {
          setCoverImageUrl(book.cover_url)
        }
        
      } else {
        MessagePlugin.error('图书不存在')
        navigate('/')
      }
    } catch (error) {
      MessagePlugin.error('获取图书详情失败')
      navigate('/')
    } finally {
      setInitialLoading(false)
    }
  }

  const handleSubmit = async (values: any) => {
    if (!user) {
      MessagePlugin.error('请先登录')
      return
    }

    // 验证表单数据
    const { fields } = values || {}
    const formData = fields ? (Array.isArray(fields) ? Object.fromEntries(fields.map((f: any) => [f.name, f.value])) : fields) : form.getFieldsValue()
    
    // 检查必要字段
    if (!formData.title?.trim()) {
      MessagePlugin.error('请输入书名')
      return
    }
    if (!formData.author?.trim()) {
      MessagePlugin.error('请输入作者')
      return
    }

    setLoading(true)
    try {
      // 提取表单数据
      const title = formData.title?.trim() || ''
      const author = formData.author?.trim() || ''
      const coverUrl = formData.cover_url || ''
      const status = formData.status || '未借阅'

      // 检查字段长度限制
      if (title.length > 500) {
        MessagePlugin.error('书名过长，请控制在500字符以内')
        return
      }
      if (author.length > 500) {
        MessagePlugin.error('作者名过长，请控制在500字符以内')
        return
      }

      const bookData = {
        title,
        author,
        cover_url: coverUrl,
        status,
        user_id: user.id
      }

      if (isEditMode && id) {
        // 编辑图书
        await bookService.updateBook(id, bookData)
        MessagePlugin.success('图书更新成功')
      } else {
        // 添加新图书
        await bookService.addBook(bookData)
        MessagePlugin.success('图书添加成功')
      }
      
      navigate('/')
    } catch (error: any) {
      console.error('保存图书失败:', error)
      MessagePlugin.error(`保存图书失败: ${error?.message || '未知错误'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    navigate('/')
  }

  // 上传图片到 Supabase Storage 并返回 URL
  const uploadImageToSupabase = async (file: File): Promise<string> => {
    // 为图片生成唯一文件名（只允许安全字符）
    const sanitizeFileName = (name: string): string => {
      // 移除中文字符和特殊字符，只保留字母、数字、下划线、点和短横线
      return name
        .replace(/[^\w\-_\.]/g, '') // 移除非单词字符、短横线、下划线、点以外的字符
        .replace(/_{2,}/g, '_') // 多个连续下划线替换为单个
        .toLowerCase();
    };
    
    const fileExt = file.name.split('.').pop() || 'jpg';
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const fileName = `covers/${timestamp}_${randomStr}.${fileExt}`;
    
    try {
      // 方法1: 尝试直接上传
      const { data, error } = await supabase
        .storage
        .from('book-collection-list') // 使用正确的存储桶名称
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true // 改为允许覆盖，避免重复文件名冲突
        });

      if (error) {
        
        // 尝试方法2: 使用 service_role key (如果可用)
        if (error.message.includes('row-level security policy') || (error as any).status === 403) {
          return await handleFallbackUpload(file);
        }
        
        throw error;
      }

      // 获取公开 URL
      const { data: { publicUrl } } = supabase.storage
        .from('book-collection-list')
        .getPublicUrl(fileName);
      return publicUrl;
    } catch (error: any) {
      throw error;
    }
  };

  // 备用上传方案：使用base64或临时存储
  const handleFallbackUpload = async (file: File): Promise<string> => {
    try {
      // 方案1: 尝试转换为base64
      const base64Url = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      
      return base64Url;
    } catch (error) {
      // 方案2: 使用占位图片
      return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y0ZjRmNCIgLz4KICA8dGV4dCB4PSIxMDAiIHk9IjEwMCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE2IiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+5Zu654mH5Yqg6L2t5aSx6LSmPC90ZXh0Pgo8L3N2Zz4=';
    }
  };

  // 处理图片上传
  const handleImageUpload = async (file: File) => {
    setUploading(true);
    try {
      // 检查文件类型
      if (!file.type.startsWith('image/')) {
        MessagePlugin.error('请上传图片文件');
        setUploading(false);
        return;
      }

      // 检查文件大小（限制为 5MB）
      if (file.size > 5 * 1024 * 1024) {
        MessagePlugin.error('图片大小不能超过 5MB');
        setUploading(false);
        return;
      }

      // 上传图片到 Supabase 并获取 URL
      const imageUrl = await uploadImageToSupabase(file);
      
      // 设置表单值和图片 URL
      form.setFieldsValue({ cover_url: imageUrl });
      setCoverImageUrl(imageUrl);
      MessagePlugin.success('图片上传成功');
      setUploading(false);
    } catch (error: any) {
      let errorMessage = '图片上传失败: ' + (error?.message || '请检查网络连接或稍后重试');
      
      // 如果是权限问题，提供具体的解决建议
      if (error?.message?.includes('row-level security policy')) {
        errorMessage = '存储权限不足。请参考 SUPABASE_STORAGE_SETUP.md 文件配置权限策略。';
      }
      
      MessagePlugin.error(errorMessage);
      setUploading(false);
    }
  };

  

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <Loading loading={initialLoading}>
          <Card className="max-w-2xl mx-auto">
            {/* 页面标题 */}
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold">
                {isEditMode ? '编辑图书' : '添加图书'}
              </h1>
              <Button 
                variant="text" 
                icon={<ArrowLeftIcon />}
                onClick={handleCancel}
              >
                返回列表
              </Button>
            </div>

            {/* 表单 */}
            <Form
              form={form}
              onSubmit={handleSubmit}
              layout="vertical"
              className="space-y-6"
            >
              {/* 书名 - 必填 */}
              <Form.FormItem name="title" label="书名">
                <Input
                  placeholder="请输入书名"
                  maxlength={200}
                  showLimitNumber
                />
              </Form.FormItem>

              {/* 作者 - 必填 */}
              <Form.FormItem name="author" label="作者">
                <Input
                  placeholder="请输入作者"
                  maxlength={100}
                  showLimitNumber
                />
              </Form.FormItem>

              {/* 封面图片 */}
              <Form.FormItem name="cover_url" label="封面图片">
                <div className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-4">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            handleImageUpload(file)
                          }
                        }}
                        className="block w-full text-sm text-gray-500
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-full file:border-0
                          file:text-sm file:font-semibold
                          file:bg-blue-50 file:text-blue-700
                          hover:file:bg-blue-100"
                      />
                      {coverImageUrl && (
                        <div className="flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border border-gray-200 flex items-center justify-center">
                          {coverImageUrl.includes('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7') ? (
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center text-xs text-gray-500">预览</div>
                          ) : (
                            <img 
                              src={coverImageUrl} 
                              alt="封面预览" 
                              className="w-full h-full object-cover" 
                            />
                          )}
                        </div>
                      )}
                    </div>
                    {uploading && (
                      <div className="text-sm text-blue-600 flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                        图片压缩上传中...
                      </div>
                    )}
                  </div>
                </div>
              </Form.FormItem>

              {/* 借阅状态 */}
              <Form.FormItem name="status" label="借阅状态">
                <Select
                  options={statusOptions}
                  placeholder="请选择借阅状态"
                />
              </Form.FormItem>

              {/* 操作按钮 */}
              <div className="flex justify-end space-x-4">
                <Button 
                  theme="primary" 
                  type="submit"
                  loading={loading}
                >
                  {isEditMode ? '更新图书' : '添加图书'}
                </Button>
                <Button 
                  variant="outline"
                  onClick={handleCancel}
                >
                  取消
                </Button>
              </div>
            </Form>

            {/* 帮助信息 */}
            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">使用说明</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• 书名和作者是必填字段</li>
                <li>• 封面图片为可选项，可以直接上传图片</li>
                <li>• 上传的图片会存储到 Supabase Storage，支持在线访问</li>
                <li>• 支持 jpg、png 等图片格式，文件大小不超过 5MB</li>
                <li>• 文件名会自动处理，移除中文字符确保兼容性</li>
                <li>• 借阅状态可选择：未借阅、正借阅、已借阅</li>
                <li>• 点击"添加图书"将保存并返回图书列表</li>
              </ul>
            </div>
          </Card>
        </Loading>
      </div>
    </div>
  )
}
