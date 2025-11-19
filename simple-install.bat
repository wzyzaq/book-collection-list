@echo off
chcp 65001 >nul
echo Book Collection System - Simple Installer
echo.

REM Set encoding for proper display
chcp 65001 >nul

echo Cleaning up files...
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del package-lock.json
echo Cleanup completed!
echo.

echo Setting npm registry...
call npm config set registry https://registry.npmmirror.com
echo Registry configured!
echo.

echo Installing React and Vite...
call npm install react@18.2.0 react-dom@18.2.0 vite@5.2.0 typescript@5.2.2

echo Installing dev tools...
call npm install -D @types/react@18.2.66 @types/react-dom@18.2.22 @vitejs/plugin-react@4.2.1

echo Installing TDesign UI...
call npm install tdesign-react@1.12.0 tdesign-icons-react@0.5.0

echo Installing remaining packages...
call npm install react-router-dom@6.26.2 @supabase/supabase-js@2.39.0 tailwindcss@3.4.17 postcss@8.5.0 autoprefixer@10.4.20 less@4.3.0

echo.
echo Installation completed!
echo.

if not exist .env (
    echo Warning: .env file not found
    echo Please copy .env.example to .env and configure Supabase settings
    echo.
)

echo Starting development server...
echo Server: http://localhost:5173
echo Press Ctrl+C to stop
echo.

call npm run dev

pause