# Initialize Apex Sandbox Database Schema
# This script runs all the SQL scripts in the correct order

Write-Host "Initializing Apex Sandbox database schema..." -ForegroundColor Cyan

# Check if Docker container is running
$containerRunning = docker ps --filter "name=apex-sandbox-db" --format "{{.Names}}" | Select-String "apex-sandbox-db"

if (-not $containerRunning) {
    Write-Host "Error: PostgreSQL container 'apex-sandbox-db' is not running." -ForegroundColor Red
    Write-Host "Please start it first with: docker-compose up -d" -ForegroundColor Yellow
    exit 1
}

# Wait for PostgreSQL to be ready
Write-Host "Waiting for PostgreSQL to be ready..." -ForegroundColor Yellow
$ready = $false
$attempts = 0
$maxAttempts = 30

while (-not $ready -and $attempts -lt $maxAttempts) {
    $result = docker exec apex-sandbox-db pg_isready -U apex_user -d apex_sandbox 2>&1
    if ($LASTEXITCODE -eq 0) {
        $ready = $true
    } else {
        Start-Sleep -Seconds 1
        $attempts++
    }
}

if (-not $ready) {
    Write-Host "Error: PostgreSQL did not become ready in time." -ForegroundColor Red
    exit 1
}

Write-Host "PostgreSQL is ready. Running SQL scripts..." -ForegroundColor Green

# Run SQL scripts in order
Write-Host "Creating users table..." -ForegroundColor Cyan
Get-Content dbscripts\users.sql | docker exec -i apex-sandbox-db psql -U apex_user -d apex_sandbox

Write-Host "Creating session table..." -ForegroundColor Cyan
Get-Content dbscripts\session.sql | docker exec -i apex-sandbox-db psql -U apex_user -d apex_sandbox

Write-Host "Creating problem_categories table..." -ForegroundColor Cyan
Get-Content dbscripts\problem_categories.sql | docker exec -i apex-sandbox-db psql -U apex_user -d apex_sandbox

Write-Host "Creating problems table..." -ForegroundColor Cyan
Get-Content dbscripts\problems.sql | docker exec -i apex-sandbox-db psql -U apex_user -d apex_sandbox

Write-Host "Creating problem_attempts table..." -ForegroundColor Cyan
Get-Content dbscripts\problem_attempts.sql | docker exec -i apex-sandbox-db psql -U apex_user -d apex_sandbox

Write-Host "Creating problem_user_success table..." -ForegroundColor Cyan
Get-Content dbscripts\problem_user_success.sql | docker exec -i apex-sandbox-db psql -U apex_user -d apex_sandbox

Write-Host ""
Write-Host "✓ Database schema initialized successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "You can now start the application with:" -ForegroundColor Cyan
Write-Host "  Backend:  node -r dotenv/config index.js" -ForegroundColor White
Write-Host "  Frontend: cd client; `$env:NODE_OPTIONS=`"--openssl-legacy-provider`"; npm start" -ForegroundColor White
