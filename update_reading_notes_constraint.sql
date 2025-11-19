-- 移除原有的唯一约束，允许每个用户对每本书创建多条笔记
ALTER TABLE reading_notes DROP CONSTRAINT IF EXISTS unique_user_book_notes;

-- 如果需要，可以创建新的索引来优化查询性能
-- CREATE INDEX IF NOT EXISTS idx_reading_notes_book_user ON reading_notes(book_id, user_id);