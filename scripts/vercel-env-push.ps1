# Pousse les variables de tarification vers Vercel (compte Amar2K111 / amarprojet).
$ErrorActionPreference = "Stop"

$scope = "amars-projects-64caad37"
$project = "revision-facile"
$root = Split-Path -Parent $PSScriptRoot

$vars = @{
  STRIPE_PREMIUM_YEARLY_PRICE_ID  = "price_1UMV9nGaP4PPXyewBS2G9gjc"
  STRIPE_PREMIUM_MONTHLY_PRICE_ID = "price_1UMV9pGaP4PPXyewAFG0NfRs"
  STRIPE_PREMIUM_YEARLY_EUR       = "29.99"
  STRIPE_PREMIUM_MONTHLY_EUR      = "4.99"
  STRIPE_PREMIUM_TRIAL_DAYS       = "3"
  NEXT_PUBLIC_PREMIUM_YEARLY_EUR  = "29.99"
  NEXT_PUBLIC_PREMIUM_MONTHLY_EUR = "4.99"
  NEXT_PUBLIC_PREMIUM_TRIAL_DAYS  = "3"
}

# STRIPE_WEBHOOK_SECRET : ne jamais versionner — ajoute-le à la main dans Vercel
# (Stripe Dashboard → Webhooks → signing secret du endpoint prod).

Push-Location $root
try {
  foreach ($entry in $vars.GetEnumerator() | Sort-Object Name) {
    $name = $entry.Key
    $value = $entry.Value
    Write-Host "→ $name" -ForegroundColor Cyan
    foreach ($target in @("production", "preview")) {
      npx vercel env rm $name $target --scope $scope --project $project --yes 2>$null | Out-Null
      $value | npx vercel env add $name $target --scope $scope --project $project 2>&1 | Out-Null
      if ($LASTEXITCODE -ne 0) {
        Write-Warning "  échec $target pour $name"
      }
    }
  }
  Write-Host ""
  Write-Host "Variables tarification poussées sur amars-projects/revision-facile." -ForegroundColor Green
  Write-Host "Redéploie : npx vercel --prod --scope $scope --project $project"
} finally {
  Pop-Location
}
