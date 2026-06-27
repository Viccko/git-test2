SET NAMES utf8mb4;

-- 学科表
CREATE TABLE IF NOT EXISTS subjects (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  code VARCHAR(30) NOT NULL UNIQUE,
  name VARCHAR(50) NOT NULL,
  grade_range VARCHAR(50),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 问答记录表
CREATE TABLE IF NOT EXISTS qa_records (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  subject_code VARCHAR(30) NOT NULL,
  grade VARCHAR(20) NOT NULL,
  question TEXT NOT NULL,
  answer_json JSON NOT NULL,
  answer_source VARCHAR(20) NOT NULL DEFAULT 'mock',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 初始化学科数据（重复执行时更新名称）
INSERT INTO subjects (code, name, grade_range) VALUES
  ('math', '数学', '高一-高三'),
  ('english', '英语', '高一-高三'),
  ('physics', '物理', '高一-高三')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  grade_range = VALUES(grade_range);
