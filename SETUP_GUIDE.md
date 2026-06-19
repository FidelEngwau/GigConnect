# GigConnect - Setup & Run Guide

## Prerequisites
- Node.js installed
- MySQL/MariaDB running locally
- Both backend and frontend dependencies installed

## Backend Setup

### 1. Database Setup
Before running the backend, you need to create the database and tables:

```bash
# Open MySQL/MariaDB CLI:
mysql -u root

# Then run these SQL commands:
CREATE DATABASE IF NOT EXISTS jobconnect;
USE jobconnect;

# Then execute the schema from:
SOURCE database/schema.sql;

# Optionally seed test data:
SOURCE database/seed.sql;
```

### 2. Environment Variables (.env)
A `.env` file has been created in the backend folder with:
```
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=jobconnect
FRONTEND_URL=http://localhost:5173
JWT_SECRET=your_jwt_secret_key_change_this_in_production
NODE_ENV=development
```

**Modify this file if your database credentials are different.**

### 3. Install Dependencies
```bash
cd jobconnect-backend-main/jobconnect-backend-main
npm install
```

### 4. Run Backend
```bash
# Development mode with auto-reload
npm run dev

# Or production mode
npm start
```

Backend will run on **http://localhost:5000**

---

## Frontend Setup

### 1. Environment Variables (.env)
A `.env` file has been created in the frontend folder with:
```
VITE_API_URL=http://localhost:5000/api
```

### 2. Install Dependencies
```bash
cd jobconnect-frontend-main/jobconnect-frontend-main
npm install
```

### 3. Run Frontend
```bash
npm run dev
```

Frontend will run on **http://localhost:5173**

---

## Running Both Simultaneously

### Option 1: Two Terminal Windows
1. **Terminal 1 - Backend:**
   ```bash
   cd jobconnect-backend-main/jobconnect-backend-main
   npm run dev
   ```

2. **Terminal 2 - Frontend:**
   ```bash
   cd jobconnect-frontend-main/jobconnect-frontend-main
   npm run dev
   ```

### Option 2: Using VS Code Tasks
Use the VS Code terminal to run both with separate panes.

---

## API Endpoints

The frontend will automatically connect to the backend at `http://localhost:5000/api`

Common endpoints:
- `GET /api/health` - Health check
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/jobs` - List all jobs
- `POST /api/applications` - Submit job application

---

## Troubleshooting

### Backend won't start
- [ ] Check MySQL is running
- [ ] Verify database exists: `SHOW DATABASES;`
- [ ] Check .env credentials
- [ ] Run `npm install` to ensure dependencies are installed

### Frontend won't connect to backend
- [ ] Ensure backend is running on port 5000
- [ ] Check browser console for CORS errors
- [ ] Verify VITE_API_URL in frontend .env

### CORS Issues
The backend is configured to accept requests from `http://localhost:5173`

### Database connection errors
- [ ] Verify DB_HOST, DB_USER, DB_PASSWORD in .env
- [ ] Ensure MySQL/MariaDB is running
- [ ] Check database user has proper permissions

---

## Next Steps
1. Set up database tables (run schema.sql)
2. Install backend dependencies
3. Install frontend dependencies
4. Run both servers
5. Open http://localhost:5173 in your browser
