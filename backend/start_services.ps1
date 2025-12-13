$ErrorActionPreference = "Stop"

Write-Host "Checking Docker status..." -ForegroundColor Cyan
try {
    docker ps | Out-Null
    Write-Host "Docker is running." -ForegroundColor Green
} catch {
    Write-Host "ERROR: Docker is not running or not accessible." -ForegroundColor Red
    Write-Host "Please start Docker Desktop and wait for it to initialize." -ForegroundColor Yellow
    exit 1
}

$services = @(
    @{ Name = "Auth Service"; Path = "auth-service"; Port = 3001 },
    @{ Name = "Booking Service"; Path = "booking-service"; Port = 3002 },
    @{ Name = "Event Service"; Path = "event-service"; Port = 3003 },
    @{ Name = "Payment Service"; Path = "payment-service"; Port = 3004 }
)

foreach ($service in $services) {
    $path = Join-Path $PSScriptRoot $service.Path
    if (Test-Path $path) {
        Write-Host "Starting $($service.Name) in background..." -ForegroundColor Cyan
        # Kill existing process on port if needed (optional, but good for cleanup)
        $port = $service.Port
        $pid_to_kill = (Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue).OwningProcess
        if ($pid_to_kill) {
            Stop-Process -Id $pid_to_kill -Force -ErrorAction SilentlyContinue
        }

        # Start new process
        Start-Process -FilePath "go" -ArgumentList "run cmd/main.go" -WorkingDirectory $path -WindowStyle Minimized
    } else {
        Write-Host "Warning: Could not find $($service.Name) at $path" -ForegroundColor Yellow
    }
}

Write-Host "All services started! (Check minimized windows for logs)" -ForegroundColor Green
