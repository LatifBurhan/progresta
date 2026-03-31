#!/bin/bash

# Script untuk setup environment variables di Vercel
# Pastikan Anda sudah install Vercel CLI: npm i -g vercel
# Dan sudah login: vercel login

echo "🚀 Setup Vercel Environment Variables"
echo "======================================"
echo ""

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI tidak ditemukan!"
    echo "Install dengan: npm i -g vercel"
    exit 1
fi

echo "📝 Masukkan environment variables Anda:"
echo ""

# Supabase Configuration
read -p "NEXT_PUBLIC_SUPABASE_URL: " SUPABASE_URL
read -p "NEXT_PUBLIC_SUPABASE_ANON_KEY: " SUPABASE_ANON_KEY
read -sp "SUPABASE_SERVICE_ROLE_KEY: " SUPABASE_SERVICE_ROLE_KEY
echo ""

# Session & Security
read -sp "SESSION_SECRET (atau tekan Enter untuk generate): " SESSION_SECRET
echo ""
if [ -z "$SESSION_SECRET" ]; then
    SESSION_SECRET=$(openssl rand -base64 32)
    echo "✅ SESSION_SECRET generated: $SESSION_SECRET"
fi

read -p "REGISTRATION_TOKEN: " REGISTRATION_TOKEN

read -sp "CRON_SECRET (atau tekan Enter untuk generate): " CRON_SECRET
echo ""
if [ -z "$CRON_SECRET" ]; then
    CRON_SECRET=$(openssl rand -base64 32)
    echo "✅ CRON_SECRET generated: $CRON_SECRET"
fi

# Optional
read -p "GROQ_API_KEY (optional, tekan Enter untuk skip): " GROQ_API_KEY

echo ""
echo "🔄 Menambahkan environment variables ke Vercel..."
echo ""

# Add environment variables to Vercel
echo "$SUPABASE_URL" | vercel env add NEXT_PUBLIC_SUPABASE_URL production
echo "$SUPABASE_ANON_KEY" | vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
echo "$SUPABASE_SERVICE_ROLE_KEY" | vercel env add SUPABASE_SERVICE_ROLE_KEY production
echo "$SESSION_SECRET" | vercel env add SESSION_SECRET production
echo "$REGISTRATION_TOKEN" | vercel env add REGISTRATION_TOKEN production
echo "$CRON_SECRET" | vercel env add CRON_SECRET production

if [ ! -z "$GROQ_API_KEY" ]; then
    echo "$GROQ_API_KEY" | vercel env add GROQ_API_KEY production
fi

echo ""
echo "✅ Environment variables berhasil ditambahkan!"
echo ""
echo "🚀 Sekarang Anda bisa deploy dengan: vercel --prod"
