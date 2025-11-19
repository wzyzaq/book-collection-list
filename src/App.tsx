import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Navigation } from './components/Navigation'
import { BookList } from './components/BookList'
import { BookDetail } from './components/BookDetail'
import { BookForm } from './components/BookForm'
import { LoginPage } from './pages/LoginPage'
import { User } from '@supabase/supabase-js'
import auth from './services/auth'

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 检查当前用户状态
    const checkUser = async () => {
      try {
        const currentUser = await auth.getCurrentUser()
        setUser(currentUser)
      } catch (error) {
        console.error('获取当前用户失败:', error)
      } finally {
        setLoading(false)
      }
    }

    checkUser()

    // 监听认证状态变化
    const { data: { subscription } } = auth.onAuthStateChange((user) => {
      setUser(user)
    })

    // 清理监听器
    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <Router>
      <div className="App">
        {user ? (
          <>
            <Navigation user={user} onUserChange={setUser} />
            
        <Routes>
          <Route path="/" element={<Navigate to="/books" replace />} />
          <Route 
            path="/books" 
            element={<BookList user={user} />} 
          />
          <Route 
            path="/books/:id" 
            element={<BookDetail user={user} />} 
          />
          <Route 
            path="/books/add" 
            element={<BookForm user={user} />} 
          />
          <Route 
            path="/books/edit/:id" 
            element={<BookForm user={user} />} 
          />
        </Routes>
          </>
        ) : (
          <Routes>
            <Route path="*" element={<LoginPage />} />
          </Routes>
        )}
      </div>
    </Router>
  )
}

export default App