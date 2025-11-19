-- 设置数据库时区为中国标准时间（CST）
SET TIME ZONE 'Asia/Shanghai';

-- 创建users表（user是PostgreSQL保留关键字，改为users）
CREATE TABLE IF NOT EXISTS users (
    user_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_name VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ(0) DEFAULT CURRENT_TIMESTAMP(0),
    updated_at TIMESTAMPTZ(0) DEFAULT CURRENT_TIMESTAMP(0)
);

-- 创建或替换触发器函数（先删除已存在的触发器）
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP(0);
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 插入初始数据（如果不存在）
INSERT INTO users (user_name, password) 
SELECT 'admin', '123456' 
WHERE NOT EXISTS (SELECT 1 FROM users WHERE user_name = 'admin');
