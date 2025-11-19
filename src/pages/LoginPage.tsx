import React, { useState, useEffect } from 'react'
import { Card, Form, Input, Button, MessagePlugin } from 'tdesign-react'
import { LoginIcon } from 'tdesign-icons-react'
import { useNavigate } from 'react-router-dom'
import auth from '../services/auth'
import { User } from '@supabase/supabase-js'

export const LoginPage: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('123456')
  const [form] = Form.useForm()
  const navigate = useNavigate()

  // 确保默认值被设置
  useEffect(() => {
  
    // 使用 Form 的 setFieldsValue 设置初始值
    form.setFieldsValue({
      username: 'admin',
      password: '123456'
    })
  }, [form])

  const handleLogin = async (e?: React.FormEvent | any) => {
    if (e && e.preventDefault) {
      e.preventDefault()
    }
    

    setLoading(true)

    try {
      const { user } = await auth.signIn(username, password)

      if (user) {
        MessagePlugin.success('登录成功')
        // onAuthStateChange 会触发 App.tsx 中的状态更新，自动切换到图书列表
        // 这里导航到首页确保路由正确
        navigate('/')
      } else {
        MessagePlugin.error('登录失败，请检查用户名和密码')
      }
    } catch (error: any) {

      MessagePlugin.error(error?.message || '登录失败，请检查用户名和密码')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card 
        className="w-full max-w-md"
        title="图书收藏管理系统"
        header={
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              📚 图书收藏管理系统
            </h1>
            <p className="text-gray-600">
              请登录以访问您的图书收藏
            </p>
          </div>
        }
      >
        <Form form={form}>
          <Form.FormItem 
            name="username"
            label="用户名"
          >
            <Input
              placeholder="请输入用户名"
              onChange={(value) => {
                setUsername(value)
                form.setFieldsValue({ username: value })
              }}
            />
          </Form.FormItem>

          <Form.FormItem 
            name="password"
            label="密码"
          >
            <Input
              type="password"
              placeholder="请输入密码"
              onChange={(value) => {
                setPassword(value)
                form.setFieldsValue({ password: value })
              }}
            />
          </Form.FormItem>

          <Form.FormItem>
            <Button 
              theme="primary"
              size="large"
              loading={loading}
              block
              icon={<LoginIcon />}
              onClick={handleLogin}
            >
              {loading ? '登录中...' : '登录'}
            </Button>
          </Form.FormItem>
        </Form>
      </Card>
    </div>
  )
}