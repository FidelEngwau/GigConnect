-- Additive schema for the task chat feature (e.g. "Re: Social media graphics NGO campaign").
-- Run this AFTER schema.sql and tasks_schema.sql have already created users/tasks.
-- Usage: mysql -u root -p jobconnect < database/chat_schema.sql

USE jobconnect;

DROP TABLE IF EXISTS messages;

-- Each task has exactly one implicit conversation between its two participants:
-- tasks.employer_id (the professional/client) and tasks.worker_id (the graduate).
-- There is no separate "conversations" table -- task_id already identifies the thread.
CREATE TABLE messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  task_id INT NOT NULL,
  sender_id INT NOT NULL,
  recipient_id INT NOT NULL,
  body TEXT NOT NULL,
  read_at TIMESTAMP NULL DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_messages_task FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
  CONSTRAINT fk_messages_sender FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_messages_recipient FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Messages are almost always fetched "all messages for this task, oldest first",
-- so the index matches that access pattern.
CREATE INDEX idx_messages_task_created ON messages (task_id, created_at);
CREATE INDEX idx_messages_recipient_unread ON messages (recipient_id, read_at);
