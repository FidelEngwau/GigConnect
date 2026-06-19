# JobConnect Complete Setup & Troubleshooting Guide

## Quick Start (Easiest Method)

### Step 1: Run the Complete Startup Script
```powershell
# From the GigConnect folder, run:
.\START-ALL.bat
```

This script will:
1. ✅ Set up the MySQL database (creates `jobconnect` database and tables)
2. ✅ Start the backend server on port 5000
3. ✅ Start the frontend server on port 5173
4. ✅ Open the app in your browser

---

## Manual Setup (If Needed)

### Prerequisites
- **MySQL Server** running locally (with root user)
- **Node.js** installed
- **Port 5000** and **5173** available

### Step 1: Verify MySQL is Running
```powershell
# Check MySQL service
Get-Service MySQL80

# If not running, start it
Start-Service MySQL80

# Test connection
mysql -u root -proot -e "SELECT 1"
```

### Step 2: Set Up Database
```powershell
cd "C:\Users\FYDO\Desktop\GigConnect"
.\setup-database.ps1
```

This will:
- Create `jobconnect` database
- Create all required tables
- Populate sample data (seed.sql)

### Step 3: Install Dependencies (First Time Only)
```powershell
# Backend
cd "jobconnect-backend-main\jobconnect-backend-main"
npm install

# Frontend
cd "..\..\jobconnect-frontend-main\jobconnect-frontend-main"
npm install
```

### Step 4: Start Servers
```powershell
# Terminal 1 - Backend
cd "C:\Users\FYDO\Desktop\GigConnect\jobconnect-backend-main\jobconnect-backend-main"
npm run dev

# Terminal 2 - Frontend
cd "C:\Users\FYDO\Desktop\GigConnect\jobconnect-frontend-main\jobconnect-frontend-main"
npm run dev
```

---

## Test Accounts (From Seed Data)

After setup, you can log in with these accounts. All passwords are: **password123**

### Job Seeker Accounts
- Email: `seeker1@jobconnect.com` → Sarah Namatovu
- Email: `seeker2@jobconnect.com` → Brian Okello
- Email: `seeker3@jobconnect.com` → Grace Atim
- Email: `seeker4@jobconnect.com` → Peter Kato
- Email: `seeker5@jobconnect.com` → Joan Akello

### Employer Accounts
- Email: `employer1@jobconnect.com` → Amina Tech
- Email: `employer2@jobconnect.com` → Daniel Works

### Admin Account
- Email: `admin@jobconnect.com` (Admin user)

---

## Troubleshooting

### Problem: "Access denied for user 'root'@'localhost'"

**Solution 1: Set MySQL Password**
```powershell
mysql -u root
# In MySQL prompt:
ALTER USER 'root'@'localhost' IDENTIFIED BY 'root';
FLUSH PRIVILEGES;
EXIT;
```

**Solution 2: Check .env File**
```
# File: jobconnect-backend-main\jobconnect-backend-main\.env
DB_USER=root
DB_PASSWORD=root
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=jobconnect
```

---

### Problem: "Cannot GET /api/health" or Connection Refused

The backend server is not running. Start it:
```powershell
cd "C:\Users\FYDO\Desktop\GigConnect\jobconnect-backend-main\jobconnect-backend-main"
npm run dev
```

Backend should respond at: http://localhost:5000/api/health

---

### Problem: Frontend Can't Connect to Backend

1. **Check Frontend .env**
   ```
   # File: jobconnect-frontend-main\jobconnect-frontend-main\.env
   VITE_API_URL=http://localhost:5000/api
   ```

2. **Check CORS Settings**
   - Backend allows: `http://localhost:5173` (verified in server.js)
   - Make sure you're accessing from that exact URL

3. **Clear Browser Cache**
   ```
   Ctrl+Shift+Delete → Clear all browsing data
   ```

4. **Check Browser Console**
   - Press F12 in browser
   - Look for CORS errors or network failures
   - Network tab shows actual API requests

---

### Problem: Can't Login or Register

1. **Verify Database Has Tables**
   ```powershell
   mysql -u root -proot
   USE jobconnect;
   SHOW TABLES;
   ```

2. **Check for Errors in Backend**
   - Look at backend terminal for error messages
   - Check `/api/health` endpoint

3. **Verify Auth Routes**
   ```
   POST /api/auth/register  → Creates new account
   POST /api/auth/login     → Logs in existing account
   GET  /api/auth/me        → Gets current user
   ```

---

### Problem: "Port 5000 Already in Use"

```powershell
# Find process using port 5000
Get-NetTCPConnection -LocalPort 5000

# Kill the process (replace PID with actual value)
Stop-Process -Id <PID> -Force
```

---

## API Endpoints Reference

### Authentication
- `POST /api/auth/register` → Create account
- `POST /api/auth/login` → Log in
- `GET /api/auth/me` → Get current user (requires token)

### Jobs
- `GET /api/jobs` → List all jobs
- `GET /api/jobs/:id` → Get job details
- `POST /api/jobs` → Create job (employer only)

### Applications
- `GET /api/applications` → Get user's applications
- `POST /api/applications` → Apply to job

### Profiles
- `GET /api/profile` → Get user profile
- `PUT /api/profile` → Update user profile

---

## File Structure

```
GigConnect/
├── jobconnect-backend-main/
│   └── jobconnect-backend-main/
│       ├── .env                    ← Database credentials
│       ├── server.js               ← Express server
│       ├── package.json
│       ├── config/
│       │   └── db.js               ← MySQL connection
│       ├── controllers/            ← Business logic
│       ├── routes/                 ← API endpoints
│       ├── middleware/             ← Auth, validation
│       ├── database/
│       │   ├── schema.sql          ← Table definitions
│       │   └── seed.sql            ← Sample data
│       └── uploads/                ← Uploaded CVs
│
├── jobconnect-frontend-main/
│   └── jobconnect-frontend-main/
│       ├── .env                    ← API URL
│       ├── package.json
│       ├── vite.config.js
│       └── src/
│           ├── App.jsx
│           ├── main.jsx
│           ├── services/
│           │   └── api.js          ← Axios config
│           ├── context/
│           │   └── AuthContext.jsx ← Auth state
│           ├── pages/              ← Login, Register, etc.
│           └── components/
│
├── START-ALL.bat                   ← Run this!
└── setup-database.ps1              ← Database setup
```

---

## Environment Configuration

### Backend (.env)
```
PORT=5000                                    # Express server port
DB_HOST=127.0.0.1                           # MySQL host
DB_PORT=3306                                # MySQL port
DB_USER=root                                # MySQL user
DB_PASSWORD=root                            # MySQL password
DB_NAME=jobconnect                          # Database name
FRONTEND_URL=http://localhost:5173          # For CORS
JWT_SECRET=your_jwt_secret_key_change_this  # For tokens
NODE_ENV=development
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api     # Backend API endpoint
```

---

## How It Works

1. **User Registration/Login**
   - React form → Axios POST → Express API → MySQL database
   - Backend returns JWT token
   - Frontend stores token in localStorage
   - Token automatically sent with every API request

2. **Authentication Flow**
   - Login credentials validated against database
   - Password compared with bcrypt hash (never stored in plain text)
   - JWT token issued with user ID and role
   - Frontend uses token to access protected endpoints

3. **Data Flow**
   - Frontend uses Axios with `baseURL: http://localhost:5000/api`
   - JWT token injected in Authorization header
   - Backend middleware verifies token
   - Request reaches controller, queries database
   - Response sent back to frontend

---

## Next Steps

1. Run `.\START-ALL.bat` from GigConnect folder
2. Wait for browser to open at http://localhost:5173
3. Test with seed accounts or create new account
4. Check that registration and login work
5. Browse jobs and apply to test the system

Good luck! 🚀
