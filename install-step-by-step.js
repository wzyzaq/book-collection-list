const { execSync } = require('child_process');

console.log('🚀 开始分步安装依赖...\n');

// 先安装核心依赖
const corePackages = [
  'react@18.2.0',
  'react-dom@18.2.0', 
  'vite@5.2.0',
  'typescript@5.2.2',
  '@types/react@18.2.66',
  '@types/react-dom@18.2.22',
  '@vitejs/plugin-react@4.2.1'
];

try {
  console.log('📦 安装核心依赖...');
  execSync(`npm install ${corePackages.join(' ')}`, { stdio: 'inherit' });
  
  console.log('\n🎨 安装UI组件库...');
  execSync('npm install tdesign-react@1.12.0 tdesign-icons-react@0.5.0', { stdio: 'inherit' });
  
  console.log('\n🛣️ 安装路由...');
  execSync('npm install react-router-dom@6.26.2', { stdio: 'inherit' });
  
  console.log('\n🗄️ 安装数据库客户端...');
  execSync('npm install @supabase/supabase-js@2.39.0', { stdio: 'inherit' });
  
  console.log('\n🎯 安装样式相关...');
  execSync('npm install tailwindcss@3.4.17 postcss@8.5.0 autoprefixer@10.4.20 less@4.3.0', { stdio: 'inherit' });
  
  console.log('\n✅ 所有依赖安装完成！');
  console.log('🚀 运行 npm run dev 启动项目');
  
} catch (error) {
  console.error('❌ 安装失败:', error.message);
  process.exit(1);
}