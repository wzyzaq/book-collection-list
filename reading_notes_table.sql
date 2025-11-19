-- 设置数据库时区为中国标准时间（CST）
SET TIME ZONE 'Asia/Shanghai';

-- 创建reading_notes表（读书笔记表）
CREATE TABLE IF NOT EXISTS reading_notes (
    note_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    book_id UUID NOT NULL,
    user_id UUID NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ(0) DEFAULT CURRENT_TIMESTAMP(0),
    updated_at TIMESTAMPTZ(0) DEFAULT CURRENT_TIMESTAMP(0),
    
    -- 外键约束，关联books表和users表
    CONSTRAINT fk_reading_notes_book_id 
        FOREIGN KEY (book_id) 
        REFERENCES books(book_id) 
        ON DELETE CASCADE,
    
    CONSTRAINT fk_reading_notes_user_id 
        FOREIGN KEY (user_id) 
        REFERENCES users(user_id) 
        ON DELETE CASCADE,
    
    -- 同一个用户对同一本书只能有一条笔记的约束
    CONSTRAINT unique_user_book_notes 
        UNIQUE (book_id, user_id)
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_reading_notes_book_id ON reading_notes(book_id);
CREATE INDEX IF NOT EXISTS idx_reading_notes_user_id ON reading_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_reading_notes_created_at ON reading_notes(created_at);

-- 创建或替换触发器函数（先删除已存在的触发器）
DROP TRIGGER IF EXISTS update_reading_notes_updated_at ON reading_notes;
CREATE OR REPLACE FUNCTION update_reading_notes_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP(0);
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_reading_notes_updated_at BEFORE UPDATE ON reading_notes 
FOR EACH ROW EXECUTE FUNCTION update_reading_notes_updated_at_column();

-- 插入示例数据（需要先有books和users数据）
INSERT INTO reading_notes (book_id, user_id, content) 
SELECT 
    b.book_id, 
    u.user_id, 
    '这是关于《' || b.title || '》的读书笔记。作者：' || b.author || '，这本书的主题深刻，令人深思。'
FROM books b, users u 
WHERE b.title = '三体' AND u.user_name = 'admin'
AND NOT EXISTS (
    SELECT 1 FROM reading_notes rn 
    WHERE rn.book_id = b.book_id AND rn.user_id = u.user_id
);

INSERT INTO reading_notes (book_id, user_id, content) 
SELECT 
    b.book_id, 
    u.user_id, 
    '《' || b.title || '》是一本经典的文学作品，值得反复阅读。'
FROM books b, users u 
WHERE b.title = '百年孤独' AND u.user_name = 'admin'
AND NOT EXISTS (
    SELECT 1 FROM reading_notes rn 
    WHERE rn.book_id = b.book_id AND rn.user_id = u.user_id
);

-- 验证数据插入成功
SELECT 
    rn.note_id,
    rn.book_id,
    b.title as book_title,
    rn.user_id,
    u.user_name,
    rn.content,
    LEFT(rn.content, 50) || '...' as content_preview,
    rn.created_at,
    rn.updated_at,
    EXTRACT(TIMEZONE_HOUR FROM rn.created_at) as timezone_offset
FROM reading_notes rn
JOIN books b ON rn.book_id = b.book_id
JOIN users u ON rn.user_id = u.user_id
ORDER BY rn.created_at DESC;