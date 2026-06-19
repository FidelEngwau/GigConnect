# ✅ GIGCONNECT SETUP CHECKLIST

## Status: 2/3 Complete

- [x] **Step 1: Install Dependencies** ✅
  - Backend npm install: 137 packages
  - Frontend npm install: 53 packages

- [x] **Step 2: Start Servers** ✅
  - Backend running on http://localhost:5000
  - Frontend running on http://localhost:5174
  
- [ ] **Step 3: Initialize Database** ⏳ YOU ARE HERE

---

## IMMEDIATE ACTION NEEDED

### Choose ONE Method Below:

---

## METHOD 1: MySQL Workbench (Easiest)

- [ ] Open MySQL Workbench
- [ ] Connect to MySQL Server (localhost:3306)
- [ ] File → Open SQL Script
- [ ] Select: `C:\Users\FYDO\Desktop\GigConnect\MANUAL_DATABASE_SETUP.sql`
- [ ] Click Execute (⚡ button)
- [ ] Wait for completion (should see "Database setup complete!")

**Status**: ✅ Complete when you see "Database setup complete!"

---

## METHOD 2: MySQL Command Line

- [ ] Open PowerShell or Command Prompt
- [ ] Run: `mysql -u root -proot`
- [ ] You should see: `mysql>`
- [ ] Copy entire SQL from: `MANUAL_DATABASE_SETUP.sql`
- [ ] Paste into the mysql prompt
- [ ] Press Enter
- [ ] Type: `EXIT;`

**Status**: ✅ Complete when you see no errors

---

## METHOD 3: Don't Have MySQL?

- [ ] Download from: https://dev.mysql.com/downloads/mysql/
- [ ] OR download MariaDB from: https://mariadb.org/download/
- [ ] Install with default settings
- [ ] Set root password to: `root`
- [ ] Then use Method 1 or 2 above

---

## VERIFY SETUP WORKS

After choosing a method above, verify everything:

### Verification 1: Test Database
```powershell
mysql -u root -proot -e "SHOW DATABASES; USE jobconnect; SHOW TABLES;"
```
Should show 5 tables: users, employers_profiles, job_seeker_profiles, jobs, applications

### Verification 2: Test Backend Connection
```powershell
Invoke-WebRequest -Uri "http://localhost:5000/api/health" -UseBasicParsing
```
Should show: `"status":"ok","database":"connected"`

### Verification 3: Open Frontend
- [ ] Visit http://localhost:5174 in your browser
- [ ] You should see the JobConnect home page
- [ ] Navigation menu should be visible

### Verification 4: Test Login
- [ ] Click "Login" button
- [ ] Enter email: `seeker@test.com`
- [ ] Enter password: `password123`
- [ ] Click "Login"
- [ ] You should see the Job Seeker Dashboard

### Verification 5: Test Register
- [ ] Click "Register" button
- [ ] Fill in form with test data:
  - Name: Your Name
  - Email: yourname@test.com
  - Password: password123
  - Account Type: Job Seeker
- [ ] Click "Register"
- [ ] You should be logged in automatically

---

## NEXT FEATURES TO TEST

After all verifications pass:

- [ ] Browse Jobs page
- [ ] View Job Details
- [ ] Apply for a Job
- [ ] View My Applications
- [ ] Edit Profile
- [ ] Upload CV

---

## QUICK REFERENCE

| Component | URL | Status |
|-----------|-----|--------|
| Frontend Website | http://localhost:5174 | ✅ Running |
| Backend API | http://localhost:5000/api | ✅ Running |
| Database | localhost:3306 | ⏳ Needs Setup |
| Health Check | http://localhost:5000/api/health | ⏳ Will work after DB setup |

---

## TROUBLESHOOTING

### "Cannot Connect to localhost:5000"
- [ ] Backend not running
- [ ] Check if it crashed in the terminal
- [ ] Try restarting backend: Ctrl+C, then `npm run dev`

### "Cannot Connect to localhost:5174"
- [ ] Frontend not running
- [ ] Try restarting frontend: Ctrl+C, then `npm run dev`

### "Login fails with 'Invalid email or password'"
- [ ] Database not set up properly
- [ ] Run MANUAL_DATABASE_SETUP.sql again
- [ ] Make sure you see "Database setup complete!"

### "CORS error in browser console"
- [ ] Both servers must be running
- [ ] Check backend and frontend are on correct ports
- [ ] Restart both servers

### MySQL Won't Start
```powershell
# Check if service exists
Get-Service MySQL*

# Start MySQL
Start-Service MySQL80

# Or try MariaDB
Start-Service MariaDB
```

---

## SUPPORT FILES IN FOLDER

```
C:\Users\FYDO\Desktop\GigConnect\
├── QUICK_START.md                    ← Quick reference
├── COMPLETE_SETUP_GUIDE.md           ← Full detailed guide
├── DATABASE_SETUP_COMPLETE.md        ← Database troubleshooting
├── MANUAL_DATABASE_SETUP.sql         ← SQL commands to run
├── setup-database-interactive.ps1    ← Interactive setup script
└── START-ALL.bat                     ← One-click startup (when DB is ready)
```

---

## SUMMARY

**You are 2/3 done!** 🎉

✅ Servers are running  
⏳ **Database needs initialization** (pick one method above)  
🎯 Once DB is set up, login/register will work!

**Estimated Time to Completion**: 5-10 minutes

Good luck! 🚀

---

**Need Help?**
- Check the guides in the GigConnect folder
- Review error messages in the terminal
- Verify MySQL is running and accessible
