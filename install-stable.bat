@echo off
echo 🚀 图书收藏管理系统 - 稳定安装脚本
echo.

REM 清理残留文件
echo 🧹 清理残留文件...
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del package-lock.json

echo ✅ 清理完成！
echo.

REM 设置淘宝镜像
echo 🔧 设置npm镜像...
npm config set registry https://registry.npmmirror.com
npm config set fetch-timeout 120000

echo ✅ 镜像配置完成！
echo.

REM 分步安装
echo 📦 开始安装核心依赖...
call npm install react@18.2.0 react-dom@18.2.0 vite@5.2.0 typescript@5.2.2

if %errorlevel% neq 0 (
    echo ❌ 核心依赖安装失败
    pause
    exit /b 1
)

echo 📦 安装开发工具...
call npm install @types/react@18.2.66 @types/react-dom@18.2.22 @vitejs/plugin-react@4.2.1

if %errorlevel% neq 0 (
    echo ❌ 开发工具安装失败
    pause
    exit /b 1
)

echo 🎨 安装UI组件...
call npm install tdesign-react@1.12.0 tdesign-icons-react@0.5.0

if %errorlevel% neq 0 (
    echo ❌ UI组件安装失败
    pause
    exit /b 1
)

echo 🛣️ 安装其他依赖...
call npm install react-router-dom@6.26.2 @supabase/supabase-js@2.39.0 tailwindcss@3.4.17 postcss@8.5.0 autoprefixer@10.4.20 less@4.3.0

if %errorlevel% neq 0 (
    echo ❌ 其他依赖安装失败
    pause
    exit /b 1
)

echo.
echo 🎉 所有依赖安装成功！
echo.

REM 检查环境变量
if not exist .env (
    echo ⚠️  警告: 未找到.env文件
    echo 请复制.env.example为.env并配置Supabase信息
    echo.
)

echo 🚀 启动开发服务器...
echo 服务器地址: http://localhost:5173
echo 按Ctrl+C停止服务器
echo.

call npm run dev

pause