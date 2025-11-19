// 在浏览器控制台中运行此代码来诊断 Supabase Storage 权限问题

// 替换为你的 Supabase URL 和 anon key
const SUPABASE_URL = 'https://jvpijxjbtvqzbuqcztwb.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY'; // 从 .env 文件中获取

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testStoragePermissions() {
  console.log('开始测试 Supabase Storage 权限...');
  
  try {
    // 1. 检查存储桶是否存在
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    if (bucketError) {
      console.error('获取存储桶列表失败:', bucketError);
      return;
    }
    
    const targetBucket = buckets?.find(b => b.name === 'book-collection-list');
    if (!targetBucket) {
      console.error('未找到 book-collection-list 存储桶');
      return;
    }
    console.log('✅ 存储桶存在:', targetBucket);
    
    // 2. 测试文件上传
    const testFileName = `test/test_${Date.now()}.txt`;
    const testFile = new Blob(['test content'], { type: 'text/plain' });
    
    console.log('尝试上传测试文件:', testFileName);
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('book-collection-list')
      .upload(testFileName, testFile);
    
    if (uploadError) {
      console.error('❌ 文件上传失败:', uploadError);
      console.error('错误详情:', {
        status: uploadError.status,
        message: uploadError.message,
        code: uploadError.code
      });
    } else {
      console.log('✅ 文件上传成功:', uploadData);
    }
    
    // 3. 检查现有策略
    console.log('检查 RLS 策略...');
    // 注意：这需要在 Supabase 控制台的 SQL 编辑器中运行：
    // SELECT * FROM pg_policies WHERE tablename = 'storage.objects';
    
  } catch (error) {
    console.error('诊断过程中出错:', error);
  }
}

// 运行诊断
testStoragePermissions();

// 修复建议
console.log(`
=== 修复建议 ===
1. 在 Supabase 控制台的 SQL 编辑器中运行以下命令：

-- 启用 RLS（如果尚未启用）
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 创建允许所有用户上传的策略
CREATE POLICY "Allow uploads" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'book-collection-list');

-- 创建允许所有用户查看的策略
CREATE POLICY "Allow selects" ON storage.objects
FOR SELECT USING (bucket_id = 'book-collection-list');

2. 确保存储桶设置为公开访问

3. 清除浏览器缓存并重试
`);