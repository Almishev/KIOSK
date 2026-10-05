#Requires -Version 5.1
<#
.SYNOPSIS
  Installs the kiosk from Docker Hub (Windows with Docker Desktop).

.EXAMPLE
  .\install.ps1 -ApiUrl "http://192.168.80.120:8081"
  .\install.ps1 -ApiUrl "http://192.168.80.120:8081" -InstallDir "C:\kiosk" -KioskPort "8080"
#>
param(
  [string]$InstallDir = (Join-Path (Get-Location) "kiosk"),
  [string]$ApiUrl = "http://192.168.80.120:8081",
  [string]$KioskPort = "8080",
  [string]$DockerImage = "antonalmishev/kiosk:latest"
)

$ErrorActionPreference = "Stop"

function Assert-Docker {
  if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    throw "Docker не е намерен. Инсталирай Docker Desktop и опитай отново."
  }
  docker compose version | Out-Null
  if ($LASTEXITCODE -ne 0) {
    throw "Docker Compose не е наличен. Обнови Docker Desktop."
  }
}

Assert-Docker

if ([string]::IsNullOrWhiteSpace($ApiUrl)) {
  throw "Подай адреса на Restaurant POS с -ApiUrl."
}

New-Item -ItemType Directory -Force -Path $InstallDir | Out-Null
Set-Location $InstallDir
Write-Host "Инсталационна папка: $InstallDir" -ForegroundColor Cyan

$compose = @"
services:
  kiosk:
    image: `${DOCKER_IMAGE:-antonalmishev/kiosk:latest}
    restart: unless-stopped
    ports:
      - "`${KIOSK_PORT:-8080}:80"
    environment:
      API_URL: `${API_URL:-http://192.168.80.120:8081}
"@

$envFile = @"
DOCKER_IMAGE=$DockerImage
KIOSK_PORT=$KioskPort
API_URL=$ApiUrl
"@

$utf8 = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText((Join-Path $InstallDir "docker-compose.yml"), (($compose -replace "`r`n", "`n").Trim() + "`n"), $utf8)
[System.IO.File]::WriteAllText((Join-Path $InstallDir ".env"), (($envFile -replace "`r`n", "`n").Trim() + "`n"), $utf8)

Write-Host "Pull image..." -ForegroundColor Cyan
docker compose pull
if ($LASTEXITCODE -ne 0) { throw "docker compose pull failed" }

Write-Host "Start container..." -ForegroundColor Cyan
docker compose up -d
if ($LASTEXITCODE -ne 0) { throw "docker compose up failed" }

Write-Host ""
Write-Host "Готово!" -ForegroundColor Green
Write-Host "Отвори: http://localhost:$KioskPort"
Write-Host "От таблет: http://<IP-НА-ТАЗИ-МАШИНА>:$KioskPort"
Write-Host "POS адрес: $ApiUrl"
Write-Host "Папка: $InstallDir"
