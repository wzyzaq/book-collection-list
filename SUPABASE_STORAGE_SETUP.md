# Supabase Storage 权限配置指南

## 问题
遇到 `StorageApiError: new row violates row-level security policy` 错误是因为 Supabase Storage 启用了行级安全策略（RLS），但没有为存储桶配置适当的权限。

## 解决方案

### 方法一：在 SQL 编辑器中直接创建策略（推荐）

1. 登录 Supabase 控制台
2. 进入 **SQL Editor**
3. 创建新查询并运行以下命令：

```sql
-- 确保启用了 RLS
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 删除可能冲突的策略（可选）
DROP POLICY IF EXISTS "Allow uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow selects" ON storage.objects;

-- 创建允许上传的策略
CREATE POLICY "Allow uploads" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'book-collection-list');

-- 创建允许查看的策略
CREATE POLICY "Allow selects" ON storage.objects
FOR SELECT USING (bucket_id = 'book-collection-list');

-- 验证策略是否创建成功
SELECT * FROM pg_policies WHERE tablename = 'storage.objects';
```

### 方法二：通过界面创建策略

1. 登录 Supabase 控制台
2. 进入 **Storage** -> **Policies**
3. 点击 **New Policy**
4. 选择 **For full customizability**
5. 输入策略名称：`Allow uploads`
6. 选择 **Allowed operation**: `INSERT`
7. 在 **Policy definition** 中输入：
   ```sql
   bucket_id = 'book-collection-list'
   ```
8. 点击 **Save**

9. 重复步骤3-8创建 **Allow selects** 策略：
   - 策略名称：`Allow selects`
   - 选择操作：`SELECT`
   - 策略定义：`bucket_id = 'book-collection-list'`

### 方法三：完全禁用 RLS（仅限开发环境）

⚠️ **警告：这会降低安全性，仅建议在开发环境中使用**

```sql
-- 在 SQL Editor 中运行
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;
```

## 检查存储桶设置

1. 确保存储桶 `book-collection-list` 已存在
2. 检查存储桶是否设置为公开访问：
   - 进入 **Storage** -> **Buckets**
   - 点击 `book-collection-list` 存储桶
   - 确保 **Public** 选项已启用

## 诊断工具

使用项目中的 `debug-storage.js` 文件进行权限诊断：

1. 复制环境变量中的 anon key
2. 在浏览器控制台中运行该脚本
3. 查看详细的权限测试结果

## 常见问题解决

### 问题1：策略创建后仍然报错
- 检查策略是否已启用（Status 应为 ENABLED）
- 确认策略名称没有拼写错误
- 尝试刷新页面后重试

### 问题2：存储桶不存在
```sql
-- 创建存储桶
INSERT INTO storage.buckets (id, name, public) 
VALUES ('book-collection-list', 'book-collection-list', true);
```

### 问题3：仍然无法访问
- 检查 anon key 是否正确
- 确认网络连接正常
- 清除浏览器缓存

## 生产环境建议

在生产环境中，建议：
1. 启用 RLS
2. 使用基于用户 ID 的权限控制
3. 限制文件大小和类型
4. 实现文件清理机制