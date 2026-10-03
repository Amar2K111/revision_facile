# Synchronise les clés Stripe (test) depuis la CLI vers .env.local
$ErrorActionPreference = "Stop"

function Get-StripeExe {
  $pkg = Get-ChildItem -Path "$env:LOCALAPPDATA\Microsoft\WinGet\Packages" -Directory -Filter "Stripe.StripeCli_*" -ErrorAction SilentlyContinue | Select-Object -First 1
  if (-not $pkg) {
    Write-Error "Stripe CLI introuvable. Installe : winget install Stripe.StripeCli"
  }
  $exe = Join-Path $pkg.FullName "stripe.exe"
  if (-not (Test-Path -LiteralPath $exe)) {
    Write-Error "stripe.exe introuvable : $exe"
  }
  return $exe
}

function Read-StripeConfigValue {
  param([string]$ConfigText, [string]$Key)
  if ($ConfigText -match "(?m)^$Key\s*=\s*'([^']*)'") {
    return $Matches[1]
  }
  return $null
}

function Set-EnvLine {
  param(
    [string[]]$Lines,
    [string]$Key,
    [string]$Value
  )
  $pattern = "^\s*#?\s*$([regex]::Escape($Key))\s*="
  $newLine = "$Key=$Value"
  $found = $false
  $out = @()
  foreach ($line in $Lines) {
    if ($line -match $pattern) {
      $out += $newLine
      $found = $true
    } else {
      $out += $line
    }
  }
  if (-not $found) {
    $out += $newLine
  }
  return ,$out
}

$root = Split-Path -Parent $PSScriptRoot
$envFile = Join-Path $root ".env.local"
$stripe = Get-StripeExe

$configText = & $stripe config --list 2>&1 | Out-String
$secretKey = Read-StripeConfigValue $configText "test_mode_api_key"
$publishableKey = Read-StripeConfigValue $configText "test_mode_pub_key"

if (-not $secretKey -or -not $publishableKey) {
  Write-Host ""
  Write-Host "Stripe CLI : pas encore connecté." -ForegroundColor Yellow
  Write-Host "1. Lance : npm run stripe:login"
  Write-Host "2. Ouvre l'URL affichée dans ton navigateur et valide."
  Write-Host "3. Relance : npm run stripe:connect"
  Write-Host ""
  exit 1
}

if (-not (Test-Path -LiteralPath $envFile)) {
  Copy-Item (Join-Path $root ".env.example") $envFile
}

$lines = Get-Content -LiteralPath $envFile -Encoding UTF8
$lines = (Set-EnvLine $lines "STRIPE_SECRET_KEY" $secretKey)[0]
$lines = (Set-EnvLine $lines "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY" $publishableKey)[0]

if (-not ($lines -match "^\s*NEXT_PUBLIC_APP_URL=")) {
  $lines += "NEXT_PUBLIC_APP_URL=http://localhost:3000"
}

Set-Content -LiteralPath $envFile -Value $lines -Encoding UTF8

Write-Host ""
Write-Host "Clés Stripe test écrites dans .env.local" -ForegroundColor Green
Write-Host "  STRIPE_SECRET_KEY=sk_test_..."
Write-Host "  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_..."
Write-Host ""
Write-Host "Webhook local (dans un 2e terminal) :" -ForegroundColor Cyan
Write-Host "  npm run stripe:listen"
Write-Host "Copie le whsec_... affiché dans STRIPE_WEBHOOK_SECRET (.env.local)."
Write-Host ""
Write-Host "Prod Vercel : ajoute les mêmes variables + webhook"
Write-Host "  https://www.revisionfacile.com/api/stripe/webhook"
Write-Host ""
