import React from 'react'
import { Button } from 'tdesign-react'
import { LoginIcon, LogoutIcon } from 'tdesign-icons-react'
import { User } from '@supabase/supabase-js'
import auth from '../../services/auth'

interface LoginButtonProps {
  user: User | null
  onUserChange: (user: User | null) => void
}

export const LoginButton: React.FC<LoginButtonProps> = ({ user, onUserChange }) => {
  const handleLogin = async () => {
    try {
      // 使用简单的演示登录（实际项目中应该使用真实的Supabase认证）
      const email = prompt('请输入邮箱:') || 'admin@example.com'
      const password = prompt('请输入密码:') || 'admin123'
      
      const result = await auth.signIn(email, password)
      // 由于 auth.signIn 返回的不是 Supabase 的 User 类型，我们需要创建兼容的用户对象
      const compatibleUser = {
        id: result.user.id,
        email: result.user.email,
        user_metadata: result.user.user_metadata,
        app_metadata: {}, // 添加缺失的属性
        aud: '', // 添加缺失的属性
        created_at: '' // 添加缺失的属性
      } as User;
      onUserChange(compatibleUser)
    } catch (error) {

      alert('登录失败，请检查用户名和密码')
    }
  }

  const handleLogout = async () => {
    try {
      await auth.signOut()
      onUserChange(null)
    } catch (error) {

    }
  }

  if (user) {
    return (
      <Button 
        variant="outline" 
        icon={<LogoutIcon />}
        onClick={handleLogout}
      >
        退出登录
      </Button>
    )
  }

  return (
    <Button 
      theme="primary"
      icon={<LoginIcon />}
      onClick={handleLogin}
    >
      登录
    </Button>
  )
}