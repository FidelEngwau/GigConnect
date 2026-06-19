# QUICK START - Manual Database Setup

## ⚠️ IMPORTANT: MySQL Setup Required

MySQL was not found in your PATH. You need to set up the database before starting the servers.

## Option 1: Using MySQL Workbench (Recommended if Installed)

### Steps:
1. Open MySQL Workbench
2. Connect to your MySQL instance (usually `localhost:3306` with user `root`)
3. Open file: `C:\Users\FYDO\Desktop\GigConnect\MANUAL_DATABASE_SETUP.sql`
4. Click **Execute** (⚡ icon) to run all commands
5. You should see "Database setup complete!" message

## Option 2: Using MySQL Command Line

### Steps:
1. Open PowerShell or Command Prompt
2. Run: `mysql -u root -proot`  (or just `mysql -u root` if no password)
3. You should see: `mysql>`
4. Copy and paste the entire content of: `MANUAL_DATABASE_SETUP.sql`
5. Press Enter - wait for all commands to complete
6. Type: `exit` to close

### If Connection Fails:
```powershell
# Check if MySQL is running
Get-Service | Where-Object {$_.Name -like "*MySQL*" -or $_.Name -like "*MariaDB*"}

# Start MySQL (if installed as service)
Start-Service MySQL80
```

## Option 3: Without MySQL (Local SQLite for Testing)

If you don't have MySQL installed, I can create an SQLite version instead. Let me know!

---

## After Database Setup

### Step 1: Start Backend
```powershell
cd "C:\Users\FYDO\Desktop\GigConnect\jobconnect-backend-main\jobconnect-backend-main"
npm run dev
```

Backend should start on http://localhost:5000
Test it: http://localhost:5000/api/health

### Step 2: Start Frontend (New PowerShell Window)
```powershell
cd "C:\Users\FYDO\Desktop\GigConnect\jobconnect-frontend-main\jobconnect-frontend-main"
npm run dev
```

Frontend should start on http://localhost:5173
Open it in browser: http://localhost:5173

### Step 3: Test Login

Use these test credentials:
- **Email**: seeker@test.com
- **Password**: password123
- **Role**: Job Seeker

Or create a new account via Register page

---

## Verification Checklist

After setup, verify everything works:

- [ ] Database exists: `mysql -u root -proot -e "SHOW DATABASES;"`
- [ ] Tables created: `mysql -u root -proot -e "USE jobconnect; SHOW TABLES;"`
- [ ] Backend running: http://localhost:5000/api/health
- [ ] Frontend running: http://localhost:5173
- [ ] Can view home page
- [ ] Can register new account
- [ ] Can login with test account
- [ ] Can logout

---

## Troubleshooting

### "Access denied for user 'root'"
- MySQL password is wrong
- Update backend `.env` file with correct password
- Or set MySQL root password to "root":
  ```sql
  ALTER USER 'root'@'localhost' IDENTIFIED BY 'root';
  FLUSH PRIVILEGES;
  ```

### "Cannot connect to localhost:5000"
- Backend server is not running
- Check for errors in backend terminal
- Try: `Get-NetTCPConnection -LocalPort 5000`

### "Cannot GET /" on http://localhost:5173
- Frontend server is not running
- Check for errors in frontend terminal
- Try: `Get-NetTCPConnection -LocalPort 5173`

### "CORS error" in browser console
- Backend and frontend might not be communicating
- Check both are running on correct ports
- Check `.env` files match

---

## Environment Files Reference

### Backend: `.env`
```
PORT=5000
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=root
DB_NAME=jobconnect
FRONTEND_URL=http://localhost:5173
JWT_SECRET=your_jwt_secret_key_change_this_in_production
NODE_ENV=development
```

### Frontend: `.env`
```
VITE_API_URL=http://localhost:5000/api
```

---

## Next Steps After Verification

Once everything is working:

1. Test all pages: Home, Login, Register
2. Try creating a job (as employer)
3. Try applying to a job (as job seeker)
4. Check file uploads work (CV upload)
5. Test navigation between pages

Good luck! Let me know if you hit any issues.
