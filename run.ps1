Write-Host "Starting Hospital Management System (HMS) MERN Project..." -ForegroundColor Cyan

# Start Backend
Write-Host "Launching Backend server (Port 5000)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; npm run dev"

# Start Frontend
Write-Host "Launching Frontend Vite dev server (Port 5173)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"

Write-Host "HMS Core is active. Log in with demo buttons on the landing page." -ForegroundColor Yellow
