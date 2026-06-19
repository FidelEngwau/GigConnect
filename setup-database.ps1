# PowerShell script to set up the MySQL database for JobConnect

Write-Host "JobConnect Database Setup" -ForegroundColor Cyan
Write-Host "========================" -ForegroundColor Cyan

# Check if mysql is available
$mysqlPath = Get-Command mysql -ErrorAction SilentlyContinue
if (-not $mysqlPath) {
    Write-Host "ERROR: MySQL is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install MySQL and add it to your PATH" -ForegroundColor Yellow
    exit 1
}

Write-Host "`nConnecting to MySQL as root..." -ForegroundColor Yellow

# Navigate to backend folder
$backendPath = "C:\Users\FYDO\Desktop\GigConnect\jobconnect-backend-main\jobconnect-backend-main"
$schemaPath = "$backendPath\database\schema.sql"
$seedPath = "$backendPath\database\seed.sql"

if (-not (Test-Path $schemaPath)) {
    Write-Host "ERROR: schema.sql not found at $schemaPath" -ForegroundColor Red
    exit 1
}

# Run schema.sql
Write-Host "`nExecuting schema.sql..." -ForegroundColor Yellow
& mysql -u root -proot -e "SOURCE $schemaPath" 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Database schema created successfully" -ForegroundColor Green
} else {
    Write-Host "✗ Error creating database schema" -ForegroundColor Red
    exit 1
}

# Optionally run seed.sql if it exists
if (Test-Path $seedPath) {
    Write-Host "`nExecuting seed.sql..." -ForegroundColor Yellow
    & mysql -u root -proot -e "SOURCE $seedPath" 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Seed data inserted successfully" -ForegroundColor Green
    } else {
        Write-Host "⚠ Warning: Seed data insertion had issues (this may be OK)" -ForegroundColor Yellow
    }
}

Write-Host "`nVerifying database..." -ForegroundColor Yellow
$dbCheck = & mysql -u root -proot -e "USE jobconnect; SHOW TABLES;" 2>&1

Write-Host "`nDatabase setup complete!" -ForegroundColor Green
Write-Host "Tables in jobconnect database:" -ForegroundColor Cyan
Write-Host $dbCheck
