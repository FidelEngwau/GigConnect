-- JobConnect Database Setup SQL Commands
-- Copy and run these commands directly in MySQL Workbench or mysql command line

-- Step 1: Create the database
CREATE DATABASE IF NOT EXISTS jobconnect;
USE jobconnect;

-- Step 2: Create users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'employer', 'job_seeker') NOT NULL,
  status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Step 3: Create employer_profiles table
CREATE TABLE IF NOT EXISTS employer_profiles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  company_name VARCHAR(160) NOT NULL,
  company_description TEXT,
  industry VARCHAR(120),
  location VARCHAR(160),
  phone VARCHAR(40),
  website VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_employer_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Step 4: Create job_seeker_profiles table
CREATE TABLE IF NOT EXISTS job_seeker_profiles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  phone VARCHAR(40),
  location VARCHAR(160),
  skills TEXT,
  education TEXT,
  experience_level VARCHAR(80),
  cv_file VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_job_seeker_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Step 5: Create jobs table
CREATE TABLE IF NOT EXISTS jobs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employer_id INT NOT NULL,
  title VARCHAR(180) NOT NULL,
  description TEXT NOT NULL,
  requirements TEXT,
  responsibilities TEXT,
  location VARCHAR(160) NOT NULL,
  job_type ENUM('Full-time', 'Part-time', 'Contract', 'Internship', 'Remote') NOT NULL,
  salary_range VARCHAR(100),
  deadline DATE NOT NULL,
  status ENUM('open', 'closed') NOT NULL DEFAULT 'open',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_jobs_employer FOREIGN KEY (employer_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Step 6: Create applications table
CREATE TABLE IF NOT EXISTS applications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  job_id INT NOT NULL,
  job_seeker_id INT NOT NULL,
  cover_letter TEXT NOT NULL,
  cv_file VARCHAR(255) NOT NULL,
  status ENUM('Pending', 'Shortlisted', 'Rejected', 'Hired') NOT NULL DEFAULT 'Pending',
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_applications_job FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
  CONSTRAINT fk_applications_seeker FOREIGN KEY (job_seeker_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT unique_job_application UNIQUE (job_id, job_seeker_id)
);

-- Step 7: Create indexes for better performance
CREATE INDEX idx_jobs_search ON jobs (title, location, job_type, status);
CREATE INDEX idx_applications_status ON applications (status);

-- Step 8: Insert test data (optional - all passwords are 'password123' hashed with bcrypt)
INSERT INTO users (id, name, email, password, role, status) VALUES
(1, 'Test Job Seeker', 'seeker@test.com', '$2b$10$LNJPkbtC6ASk9j.E/35sIO7BILb7tzbSO1IoJCsL.ARCHLCSbcJQq', 'job_seeker', 'active'),
(2, 'Test Employer', 'employer@test.com', '$2b$10$LNJPkbtC6ASk9j.E/35sIO7BILb7tzbSO1IoJCsL.ARCHLCSbcJQq', 'employer', 'active');

INSERT INTO employer_profiles (user_id, company_name, company_description, industry, location, phone, website) VALUES
(2, 'Test Company', 'A test company', 'Technology', 'Kampala', '+256700000000', 'http://test.com');

INSERT INTO job_seeker_profiles (user_id, phone, location, skills, education, experience_level, cv_file) VALUES
(1, '+256700000001', 'Kampala', 'React, JavaScript', 'BSc Computer Science', 'Mid level', NULL);

-- Verify the setup
SELECT 'Database setup complete!' as status;
SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'jobconnect';
SELECT COUNT(*) as user_count FROM users;
