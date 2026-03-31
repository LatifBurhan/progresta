# Script untuk setup environment variables di Vercel
# Pastikan Anda sudah install Vercel CLI: npm i -g vercel
# Dan sudah login: vercel login

Write-Host "🚀 Setup Vercel Environment Variables" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Check if vercel CLI is installed
$vercelExists = Get-Command vercel -ErrorAction SilentlyContinue
if (-not $vercelExists) {
    Write-Host "❌ Vercel CLI tidak ditemukan!" -ForegroundColor Red
    Write-Host "Install dengan: npm i -g vercel" -ForegroundColor Yellow
    exit 1
}

Write-Host "📝 Masukkan environment variables Anda:" -ForegroundColor Yellow
Write-Host ""

# Supabase Configuration
$SUPABASE_URL = Read-Host "NEXT_PUBLIC_SUPABASE_URL"
$SUPABASE_ANON_KEY = Read-Host "NEXT_PUBLIC_SUPABASE_ANON_KEY"
$SUPABASE_SERVICE_ROLE_KEY = Read-Host "SUPABASE_SERVICE_ROLE_KEY" -AsSecureString
$SUPABASE_SERVICE_ROLE_KEY_Plain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($SUPABASE_SERVICE_ROLE_KEY))

# Session & Security
$SESSION_SECRET_Input = Read-Host "SESSION_SECRET (atau tekan Enter untuk generate)"
if ([string]::IsNullOrWhiteSpace($SESSION_SECRET_Input)) {
    $SESSION_SECRET = [Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
    Write-Host "✅ SESSION_SECRET generated: $SESSION_SECRET" -ForegroundColor Green
} else {
    $SESSION_SECRET = $SESSION_SECRET_Input
}

$REGISTRATION_TOKEN = Read-Host "REGISTRATION_TOKEN"

$CRON_SECRET_Input = Read-Host "CRON_SECRET (atau tekan Enter untuk generate)"
if ([string]::IsNullOrWhiteSpace($CRON_SECRET_Input)) {
    $CRON_SECRET = [Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
    Write-Host "✅ CRON_SECRET generated: $CRON_SECRET" -ForegroundColor Green
} else {
    $CRON_SECRET = $CRON_SECRET_Input
}

# Optional
$GROQ_API_KEY = Read-Host "GROQ_API_KEY (optional, tekan Enter untuk skip)"

Write-Host ""
Write-Host "🔄 Menambahkan environment variables ke Vercel..." -ForegroundColor Yellow
Write-Host ""

# Add environment variables to Vercel
$SUPABASE_URL | vercel env add NEXT_PUBLIC_SUPABASE_URL production
$SUPABASE_ANON_KEY | vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
$SUPABASE_SERVICE_ROLE_KEY_Plain | vercel env add SUPABASE_SERVICE_ROLE_KEY production
$SESSION_SECRET | vercel env add SESSION_SECRET production
$REGISTRATION_TOKEN | vercel env add REGISTRATION_TOKEN production
$CRON_SECRET | vercel env add CRON_SECRET production

if (-not [string]::IsNullOrWhiteSpace($GROQ_API_KEY)) {
    $GROQ_API_KEY | vercel env add GROQ_API_KEY production
}

Write-Host ""
Write-Host "✅ Environment variables berhasil ditambahkan!" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Sekarang Anda bisa deploy dengan: vercel --prod" -ForegroundColor Cyan
