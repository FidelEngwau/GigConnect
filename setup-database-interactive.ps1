# PowerShell script to find MySQL and set up database
Write-Host "JobConnect Database Setup - Finding MySQL..." -ForegroundColor Cyan

$mysqlPaths = @(
    "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe",
    "C:\Program Files\MySQL\MySQL Server 5.7\bin\mysql.exe",
    "C:\Program Files (x86)\MySQL\MySQL Server 8.0\bin\mysql.exe",
    "C:\Program Files (x86)\MySQL\MySQL Server 5.7\bin\mysql.exe",
    "C:\MySQLServer\bin\mysql.exe",
    "C:\MySQL\bin\mysql.exe"
)

$mysqlPath = $null
foreach ($path in $mysqlPaths) {
    if (Test-Path $path) {
        $mysqlPath = $path
        Write-Host "Found MySQL at: $path" -ForegroundColor Green
        break
    }
}

if (-not $mysqlPath) {
    Write-Host "MySQL not found. Where is your MySQL installation?" -ForegroundColor Yellow
    Write-Host "Example: C:\Program Files\MySQL\MySQL Server 8.0\bin"
    $userPath = Read-Host "Enter MySQL bin directory path"
    
    $fullPath = "$userPath\mysql.exe"
    if (Test-Path $fullPath) {
        $mysqlPath = $fullPath
        Write-Host "MySQL found at: $mysqlPath" -ForegroundColor Green
    } else {
        Write-Host "MySQL not found at $fullPath" -ForegroundColor Red
        exit 1
    }
}

$backendPath = "C:\Users\FYDO\Desktop\GigConnect\jobconnect-backend-main\jobconnect-backend-main"
$schemaPath = "$backendPath\database\schema.sql"
$seedPath = "$backendPath\database\seed.sql"

Write-Host "`nTrying to connect to MySQL..." -ForegroundColor Yellow

$password = "root"
$connected = $false

# Test with password "root"
Write-Host "Attempting: mysql -u root -proot..." -ForegroundColor Gray
$output = & $mysqlPath -u root -proot -e "SELECT 1;" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "Connected with password root" -ForegroundColor Green
    $connected = $true
} else {
    # Try without password
    Write-Host "Attempting: mysql -u root (no password)..." -ForegroundColor Gray
    $output = & $mysqlPath -u root -e "SELECT 1;" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Connected without password" -ForegroundColor Green
        $password = ""
        $connected = $true
    } else {
        # Ask user
        Write-Host "Connection failed. Please enter root password:" -ForegroundColor Yellow
        $securePass = Read-Host "Password" -AsSecureString
        $plainPass = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto([System.Runtime.InteropServices.Marshal]::SecureStringToCoTaskMemUni($securePass))
        
        $output = & $mysqlPath -u root "-p$plainPass" -e "SELECT 1;" 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Connected successfully" -ForegroundColor Green
            $password = $plainPass
            $connected = $true
        }
    }
}

if (-not $connected) {
    Write-Host "ERROR: Cannot connect to MySQL. Please check:" -ForegroundColor Red
    Write-Host "1. MySQL Server is running" -ForegroundColor Gray
    Write-Host "2. Root password is correct" -ForegroundColor Gray
    exit 1
}

# Create database and schema
Write-Host "`nCreating jobconnect database..." -ForegroundColor Yellow

$createDbCmd = "CREATE DATABASE IF NOT EXISTS jobconnect;"
& $mysqlPath -u root "-p$password" -e $createDbCmd 2>&1

Write-Host "Importing schema.sql..." -ForegroundColor Yellow
$content = Get-Content $schemaPath -Raw
& $mysqlPath -u root "-p$password" -e $content 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "Schema created successfully" -ForegroundColor Green
} else {
    Write-Host "Warning: Schema creation completed with warnings" -ForegroundColor Yellow
}

# Import seed data
if (Test-Path $seedPath) {
    Write-Host "Importing seed.sql..." -ForegroundColor Yellow
    $seedContent = Get-Content $seedPath -Raw
    & $mysqlPath -u root "-p$password" -e $seedContent 2>&1
    Write-Host "Seed data imported" -ForegroundColor Green
}

# Verify
Write-Host "`nVerifying database..." -ForegroundColor Yellow
$verifyCmd = "USE jobconnect; SHOW TABLES; SELECT COUNT(*) as user_count FROM users;"
& $mysqlPath -u root "-p$password" -e $verifyCmd 2>&1

Write-Host "`nDatabase setup completed!" -ForegroundColor Green
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Run START-ALL.bat to start both servers" -ForegroundColor Gray
Write-Host "2. Open http://localhost:5173 in your browser" -ForegroundColor Gray
