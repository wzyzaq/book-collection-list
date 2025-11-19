@echo off
echo 图书收藏管理系统 - 启动脚本
echo.

REM 检查Node.js是否安装
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 错误: 未检测到Node.js，请先安装Node.js
    echo 下载地址: https://nodejs.org/
    pause
    exit /b 1
)

echo 检测到Node.js，开始安装依赖...
echo.

REM 安装依赖
call npm install

if %errorlevel% neq 0 (
    echo 依赖安装失败，请检查网络连接
    pause
    exit /b 1
)

echo.
echo 依赖安装完成！
echo.

REM 检查环境变量文件
if not exist .env (
    echo 警告: 未找到.env文件
    echo 请复制.env.example为.env并配置Supabase信息
    echo.
)

echo 启动开发服务器...
echo 服务器地址: http://localhost:5173
echo.

REM 启动开发服务器
call npm run dev

pause