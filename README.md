# 图书收藏管理系统

一个基于React + TDesign + Supabase的图书收藏管理系统，支持图书的增删改查和读书笔记功能。

## 功能特性

### 核心功能
- 🔐 **用户认证** - 登录/退出功能
- 📚 **图书管理** - 添加、编辑、删除图书
- 📖 **图书列表** - 支持状态筛选（未借阅、正借阅、已借阅）
- 📝 **读书笔记** - 为每本图书添加阅读心得
- 🎨 **现代UI** - 使用TDesign组件库，界面美观易用

### 页面结构
1. **图书清单页（/）** - 首页，显示图书列表和状态筛选
2. **图书详情页（/books/:id）** - 查看图书详情和读书笔记
3. **添加图书页（/books/add）** - 添加新图书
4. **编辑图书页（/books/edit/:id）** - 编辑现有图书

## 技术栈

- **前端框架**: React 18 + TypeScript
- **UI组件库**: TDesign React
- **样式**: Tailwind CSS
- **路由**: React Router v6
- **数据库**: Supabase (PostgreSQL)
- **构建工具**: Vite

## 数据库表结构

### users 表
```sql
user_id: UUID (主键)
user_name: VARCHAR(50) (用户名)
password: VARCHAR(255) (密码)
created_at: TIMESTAMPTZ
updated_at: TIMESTAMPTZ
```

### books 表
```sql
book_id: UUID (主键)
title: VARCHAR(255) (书名)
author: VARCHAR(100) (作者)
cover_url: VARCHAR(500) (封面链接)
status: VARCHAR(20) (借阅状态: 未借阅/正借阅/已借阅)
user_id: UUID (外键，关联users表)
created_at: TIMESTAMPTZ
updated_at: TIMESTAMPTZ
```

### reading_notes 表
```sql
note_id: UUID (主键)
book_id: UUID (外键，关联books表)
user_id: UUID (外键，关联users表)
content: TEXT (笔记内容)
created_at: TIMESTAMPTZ
updated_at: TIMESTAMPTZ
```

## 快速开始

### 1. 环境要求
- Node.js 18+
- npm 或 yarn
- Supabase 项目

### 2. 克隆项目
```bash
cd book-collection-list
```

### 3. 安装依赖
```bash
npm install
```

### 4. 配置环境变量
1. 复制 `.env.example` 为 `.env`
2. 填入你的Supabase配置：

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 5. 设置Supabase数据库
1. 在Supabase项目中执行以下SQL文件：
   - `user_table.sql` - 创建用户表
   - `books_table.sql` - 创建图书表
   - `reading_notes_table.sql` - 创建读书笔记表

### 6. 启动开发服务器
```bash
npm run dev
```

项目将在 `http://localhost:5173` 启动

## 使用说明

### 登录功能
- 点击"登录"按钮
- 输入用户名和密码（初始：admin/123456）
- 登录成功后可以管理图书

### 图书管理
- **添加图书**: 点击"添加图书"按钮
- **编辑图书**: 在图书卡片或详情页点击编辑按钮
- **删除图书**: 在图书卡片或详情页点击删除按钮
- **状态筛选**: 在首页点击状态按钮筛选图书

### 读书笔记
- 在图书详情页点击"添加心得"
- 输入读书感悟并保存
- 可以随时编辑已有的读书笔记

## 项目结构

```
src/
├── components/
│   ├── Auth/
│   │   └── LoginButton.tsx      # 登录按钮组件
│   ├── BookDetail.tsx           # 图书详情页
│   ├── BookForm.tsx             # 添加/编辑图书表单
│   ├── BookList.tsx             # 图书列表页
│   └── Navigation.tsx           # 导航栏
├── lib/
│   └── supabase.ts             # Supabase客户端配置
├── services/
│   ├── auth.ts                 # 认证服务
│   └── books.ts                # 图书相关API服务
├── types/
│   └── index.ts                # TypeScript类型定义
├── App.tsx                     # 主应用组件
├── main.tsx                    # 应用入口
└── index.css                   # 全局样式
```

## 注意事项

1. **时区设置**: 数据库已设置为中国时区（Asia/Shanghai）
2. **时间精度**: 时间戳精确到秒，不显示毫秒
3. **外键约束**: 删除用户时会同时删除相关的图书和笔记
4. **权限控制**: 未登录用户无法操作图书

## 部署

### 构建生产版本
```bash
npm run build
```

### 预览生产版本
```bash
npm run preview
```

部署到Vercel、Netlify等平台时，确保配置正确的环境变量。

## 贡献

欢迎提交Issue和Pull Request来改进这个项目。

## License

MIT License