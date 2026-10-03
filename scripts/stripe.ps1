$ErrorActionPreference = "Stop"
$pkg = Get-ChildItem -Path "$env:LOCALAPPDATA\Microsoft\WinGet\Packages" -Directory -Filter "Stripe.StripeCli_*" -ErrorAction SilentlyContinue | Select-Object -First 1
if (-not $pkg) {
  Write-Error "Stripe CLI introuvable. Installe : winget install Stripe.StripeCli"
  exit 1
}
$exe = Join-Path $pkg.FullName "stripe.exe"
if (-not (Test-Path -LiteralPath $exe)) {
  Write-Error "stripe.exe introuvable : $exe"
  exit 1
}
& $exe @args
exit $LASTEXITCODE
