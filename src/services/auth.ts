import { supabase } from '../lib/supabase'
import { User } from '../types'

// 存储认证状态变化回调
let authStateCallbacks: Array<(user: any) => void> = []

export const auth = {
  // 登录 - 从数据库获取用户信息
  async signIn(username: string, password: string) {
    // 查询数据库中的 users 表
    const { data: userData, error } = await supabase
      .from('users')
      .select('*')
      .eq('user_name', username)
      .single();

    if (error || !userData) {
      throw new Error('无效的登录凭据');
    }

    // 验证密码
    if (userData.password !== password) {
      throw new Error('无效的登录凭据');
    }

    // 找到用户，返回用户信息
    const user = {
      id: userData.user_id,
      email: `${username}@example.com`,
      user_metadata: { username: userData.user_name }
    };
    
    // 手动设置 session（使用 localStorage 存储）
    const session = {
      access_token: `mock_token_${Date.now()}`,
      refresh_token: `mock_refresh_${Date.now()}`,
      expires_in: 3600,
      expires_at: Date.now() + 3600000,
      token_type: 'bearer',
      user: user
    }
    
    // 存储到 localStorage
    localStorage.setItem('sb-auth-token', JSON.stringify(session));
    
    // 触发所有注册的回调
    authStateCallbacks.forEach(callback => {
      callback(user)
    })
    
    // 触发 storage 事件，以便其他标签页也能收到通知
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'sb-auth-token',
      newValue: JSON.stringify(session)
    }))
    
    return {
      user: user,
      session: session
    };
  },

  // 登出
  async signOut() {
    // 清除本地存储
    localStorage.removeItem('sb-auth-token')
    
    // 触发所有注册的回调，通知用户已登出
    authStateCallbacks.forEach(callback => {
      callback(null)
    })
    
    // 触发 storage 事件
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'sb-auth-token',
      newValue: null
    }))
    
    // 使用 Supabase Auth 登出
    const { error } = await supabase.auth.signOut()
  },

  // 获取当前用户
  async getCurrentUser() {
    // 首先尝试从 Supabase Auth 获取当前用户信息
    const { data: { user: supabaseUser } } = await supabase.auth.getUser()
    
    if (supabaseUser) {
      return supabaseUser
    }
    
    // 如果 Supabase 中没有用户，尝试从 localStorage 获取（模拟登录）
    const storedSession = localStorage.getItem('sb-auth-token')
    if (storedSession) {
      try {
        const session = JSON.parse(storedSession)
        // 检查是否过期
        if (session.expires_at && session.expires_at > Date.now()) {
          return session.user
        } else {
          // 已过期，清除
          localStorage.removeItem('sb-auth-token')
        }
      } catch (e) {
        localStorage.removeItem('sb-auth-token')
      }
    }
    
    return null
  },

  // 监听认证状态变化
  onAuthStateChange(callback: (user: any) => void) {
    // 注册回调
    authStateCallbacks.push(callback)
    
    // 监听 Supabase Auth 状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        callback(session.user)
      } else {
        callback(null)
      }
    })
    
    return {
      data: {
        subscription: {
          unsubscribe: () => {
            // 移除回调
            const index = authStateCallbacks.indexOf(callback)
            if (index > -1) {
              authStateCallbacks.splice(index, 1)
            }
            subscription?.unsubscribe()
          }
        }
      }
    }
  }
}

export default auth