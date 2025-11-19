import React from 'react'
import { Layout, Button, Space } from 'tdesign-react'
import { AddIcon, BookOpenIcon } from 'tdesign-icons-react'
import { useNavigate } from 'react-router-dom'
import { User } from '@supabase/supabase-js'
import { LoginButton } from './Auth/LoginButton'

interface NavigationProps {
  user: User | null
  onUserChange: (user: User | null) => void
}

export const Navigation: React.FC<NavigationProps> = ({ user, onUserChange }) => {
  const navigate = useNavigate()

  const handleAddBook = () => {

    if (!user) {
      alert('请先登录')
      return
    }
    navigate('/books/add', { replace: true })
  }

  return (
    <Layout.Header 
      className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md border-b"
      style={{ padding: '0 24px' }}
    >
      <div className="flex items-center justify-between h-16">
        <div className="flex items-center space-x-4">
          <BookOpenIcon size="24" className="text-blue-600" />
          <h1 className="text-xl font-bold text-gray-800">图书收藏管理系统</h1>
        </div>
        
        <Space>
          {user && (
            <Button 
              theme="primary"
              variant="dashed"
              icon={<AddIcon />}
              onClick={handleAddBook}
            >
              添加图书
            </Button>
          )}
          <LoginButton user={user} onUserChange={onUserChange} />
        </Space>
      </div>
    </Layout.Header>
  )
}