-- 设置数据库时区为中国标准时间（CST）
SET TIME ZONE 'Asia/Shanghai';

-- 创建books表
CREATE TABLE IF NOT EXISTS books (
    book_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(100) NOT NULL,
    cover_url VARCHAR(500),
    status VARCHAR(20) DEFAULT '未借阅' CHECK (status IN ('未借阅', '正借阅', '已借阅')),
    user_id UUID,
    created_at TIMESTAMPTZ(0) DEFAULT CURRENT_TIMESTAMP(0),
    updated_at TIMESTAMPTZ(0) DEFAULT CURRENT_TIMESTAMP(0),
    
    -- 外键约束，关联users表
    CONSTRAINT fk_books_user_id 
        FOREIGN KEY (user_id) 
        REFERENCES users(user_id) 
        ON DELETE SET NULL
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_books_title ON books(title);
CREATE INDEX IF NOT EXISTS idx_books_author ON books(author);
CREATE INDEX IF NOT EXISTS idx_books_status ON books(status);
CREATE INDEX IF NOT EXISTS idx_books_user_id ON books(user_id);

-- 创建或替换触发器函数（先删除已存在的触发器）
DROP TRIGGER IF EXISTS update_books_updated_at ON books;
CREATE OR REPLACE FUNCTION update_books_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP(0);
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_books_updated_at BEFORE UPDATE ON books 
FOR EACH ROW EXECUTE FUNCTION update_books_updated_at_column();

-- 插入示例数据
INSERT INTO books (title, author, cover_url, status) 
VALUES 
    ('三体', '刘慈欣', 'https://example.com/cover1.jpg', '未借阅'),
    ('百年孤独', '加西亚·马尔克斯', 'https://example.com/cover2.jpg', '未借阅'),
    ('活着', '余华', 'https://example.com/cover3.jpg', '已借阅'),
    ('平凡的世界', '路遥', 'https://example.com/cover4.jpg', '正借阅');

-- 验证数据插入成功
SELECT 
    book_id,
    title,
    author,
    cover_url,
    status,
    user_id,
    created_at,
    updated_at,
    EXTRACT(TIMEZONE_HOUR FROM created_at) as timezone_offset
FROM books 
ORDER BY created_at DESC;