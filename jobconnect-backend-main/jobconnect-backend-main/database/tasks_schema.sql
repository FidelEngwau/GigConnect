-- Additive schema for the "Submit work" feature (tasks + submissions).
-- Run this AFTER schema.sql / seed.sql have already created the users table.
-- Usage: mysql -u root -p jobconnect < database/tasks_schema.sql

USE jobconnect;

DROP TABLE IF EXISTS task_submissions;
DROP TABLE IF EXISTS tasks;

-- tasks are created by an employer (acting as the client/NGO) and assigned to
-- one worker (job_seeker). due_at drives the "Due in 4 Hrs" style countdown on the frontend.
CREATE TABLE tasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employer_id INT NOT NULL,
  worker_id INT NOT NULL,
  title VARCHAR(180) NOT NULL,
  description TEXT,
  due_at DATETIME NOT NULL,
  status ENUM('open', 'closed') NOT NULL DEFAULT 'open',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_tasks_employer FOREIGN KEY (employer_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_tasks_worker FOREIGN KEY (worker_id) REFERENCES users(id) ON DELETE CASCADE
);

-- task_submissions stores each upload/Canva-link a worker sends for a task.
-- Multiple rows per task are allowed (revisions); the newest row is what the
-- employer reviews. Exactly one of file_path / canva_link must be present --
-- enforced in the controller since older MariaDB versions ignore CHECK constraints.
CREATE TABLE task_submissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  task_id INT NOT NULL,
  worker_id INT NOT NULL,
  file_path VARCHAR(255),
  original_name VARCHAR(255),
  canva_link VARCHAR(500),
  is_late BOOLEAN NOT NULL DEFAULT FALSE,
  status ENUM('submitted', 'approved', 'rejected') NOT NULL DEFAULT 'submitted',
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_submissions_task FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
  CONSTRAINT fk_submissions_worker FOREIGN KEY (worker_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_tasks_worker_status ON tasks (worker_id, status);
CREATE INDEX idx_submissions_task ON task_submissions (task_id);
