# ✅ SERVERS ARE RUNNING! Now Complete Database Setup

## Status Check ✅
- ✅ **Backend Server**: Running on http://localhost:5000
- ✅ **Frontend Server**: Running on http://localhost:5174
- ⏳ **Database**: NOT SET UP YET (needed for login/register)

---

## NEXT STEP: Set Up MySQL Database

### Quick Version (Copy & Paste)

#### If you have MySQL Workbench installed:
1. Open MySQL Workbench
2. Connect to your MySQL server
3. File → Open SQL Script → Choose: `C:\Users\FYDO\Desktop\GigConnect\MANUAL_DATABASE_SETUP.sql`
4. Click the ⚡ Execute button
5. Wait for completion

#### If you have MySQL Command Line:
1. Open PowerShell or Command Prompt
2. Run: `mysql -u root -proot` (enter password if prompted)
3. At the `mysql>` prompt, type:
```sql
SOURCE C:\Users\FYDO\Desktop\GigConnect\MANUAL_DATABASE_SETUP.sql;
```

---

## What If I Don't Have MySQL?

### Option A: Install MySQL (Recommended)
- Download: https://dev.mysql.com/downloads/mysql/
- Install MySQL Server 8.0+
- Set root password to: `root` (or update `.env` file)
- Then run the SQL setup above

### Option B: Use MariaDB (Free, Easier)
- Download: https://mariadb.org/download/
- Install with default settings
- Should work exactly like MySQL

---

## Detailed Manual Setup (If Commands Don't Work)

### Step 1: Verify MySQL is Running
```powershell
# Check MySQL service
Get-Service MySQL*

# If stopped, start it:
Start-Service MySQL80

# Or try MariaDB:
Start-Service MariaDB
```

### Step 2: Connect to MySQL
```powershell
# Open MySQL command line
mysql -u root -proot
# Or just:
mysql -u root
```

### Step 3: Create Database (Copy Each Section)
```sql
-- Create database
CREATE DATABASE IF NOT EXISTS jobconnect;
USE jobconnect;

-- Create users table
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'employer', 'job_seeker') NOT NULL,
  status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create employer_profiles table
CREATE TABLE employer_profiles (
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

-- Create job_seeker_profiles table
CREATE TABLE job_seeker_profiles (
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

-- Create jobs table
CREATE TABLE jobs (
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

-- Create applications table
CREATE TABLE applications (
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

-- Create indexes
CREATE INDEX idx_jobs_search ON jobs (title, location, job_type, status);
CREATE INDEX idx_applications_status ON applications (status);

-- Insert test accounts (password: "password123" - bcrypt hashed)
INSERT INTO users (id, name, email, password, role, status) VALUES
(1, 'Test Job Seeker', 'seeker@test.com', '$2b$10$LNJPkbtC6ASk9j.E/35sIO7BILb7tzbSO1IoJCsL.ARCHLCSbcJQq', 'job_seeker', 'active'),
(2, 'Test Employer', 'employer@test.com', '$2b$10$LNJPkbtC6ASk9j.E/35sIO7BILb7tzbSO1IoJCsL.ARCHLCSbcJQq', 'employer', 'active');

INSERT INTO employer_profiles (user_id, company_name, company_description, industry, location, phone, website) VALUES
(2, 'Test Company', 'A test company for JobConnect', 'Technology', 'Kampala', '+256700000000', 'http://testcompany.com');

INSERT INTO job_seeker_profiles (user_id, phone, location, skills, education, experience_level, cv_file) VALUES
(1, '+256700000001', 'Kampala', 'React, JavaScript, Node.js', 'BSc Computer Science', 'Mid level', NULL);

-- Verify setup
SELECT 'Database setup complete!' as Status;
SELECT COUNT(*) as Tables_Created FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'jobconnect';
SELECT COUNT(*) as User_Accounts FROM users;
```

### Step 4: Exit MySQL
```sql
EXIT;
```

---

## After Database Setup Complete

### Step 1: Test Backend Connection
```powershell
Invoke-WebRequest -Uri "http://localhost:5000/api/health" -UseBasicParsing | ConvertFrom-Json
```

You should see:
```json
{
  "status": "ok",
  "database": "connected"
}
```

### Step 2: Open Frontend in Browser
Visit: http://localhost:5174

### Step 3: Test Login
- **Email**: seeker@test.com
- **Password**: password123

or

- **Email**: employer@test.com
- **Password**: password123

---

## Troubleshooting

### Still Getting "Access denied for user 'root'"?

The backend is trying to connect to MySQL but failing. Solutions:

**1. Update Backend .env File**

File: `C:\Users\FYDO\Desktop\GigConnect\jobconnect-backend-main\jobconnect-backend-main\.env`

Make sure it says:
```
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=root
DB_NAME=jobconnect
```

**2. Restart Backend**

After updating .env, press `rs` in the backend terminal window, or:
- Kill backend (Ctrl+C)
- Restart: `npm run dev`

**3. Verify MySQL is Running**
```powershell
Get-Service MySQL* | Where-Object {$_.Status -eq 'Running'}
```

If not running:
```powershell
Start-Service MySQL80
```

---

## System Architecture

```
Your Browser
    ↓
http://localhost:5174 (React Frontend)
    ↓ (Axios HTTP calls)
http://localhost:5000/api (Express Backend)
    ↓ (SQL Queries)
MySQL Database (localhost:3306)
```

---

## Common Errors & Solutions

| Error | Solution |
|-------|----------|
| "Cannot reach localhost:5000" | Backend not running, start it with: `npm run dev` |
| "Cannot reach localhost:5174" | Frontend not running, start it with: `npm run dev` |
| "Invalid email or password" | Wrong credentials or database not set up |
| "CORS error" | Check both servers running on correct ports |
| "Connection refused" | MySQL not running - start with `Start-Service MySQL80` |

---

## File Locations Reference

```
GigConnect/
├── backend/
│   ├── .env                    ← Update DB_PASSWORD here if needed
│   ├── server.js               ← Main server file
│   ├── config/db.js            ← Database connection
│   └── routes/                 ← API endpoints
│
├── frontend/
│   ├── .env                    ← Should have VITE_API_URL=http://localhost:5000/api
│   ├── src/
│   │   ├── pages/Login.jsx
│   │   ├── pages/Register.jsx
│   │   └── services/api.js     ← Axios configuration
│   └── vite.config.js
│
├── MANUAL_DATABASE_SETUP.sql   ← SQL file to run
└── QUICK_START.md              ← This guide
```

---

## Next Steps

1. ✅ Servers are running - DONE!
2. ⏳ **Set up MySQL database** - DO THIS NEXT
3. Test backend: http://localhost:5000/api/health
4. Open frontend: http://localhost:5174
5. Try to register or login
6. Test creating jobs and applications

Good luck! You're almost there! 🚀
