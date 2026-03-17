#!/bin/bash
echo "🔱 ALARAB CLUB 777 - EGYPT PORTAL DEPLOYMENT"
echo "============================================"

# Step 1: Check Git
if [ ! -d ".git" ]; then
    echo "🔄 Initializing Secure Git Repository..."
    git init
fi
git remote remove origin 2>/dev/null
git remote add origin https://github.com/Thebigboss1978/AlArab777.git

# Step 2: Prepare for Vercel
echo "🔄 Syncing Environment with Sovereign ID..."
# The index.html already contains the ID:ALR777 identity.

# Step 3: Push to Production (Dedicated Egypt Branch)
echo "🚀 Pushing to GitHub (egypt-portal) & Vercel..."
git add .
git commit -m "deploy: Sovereign Voice Interface - Egypt Portal (Keyless & Secured)"
git branch -M egypt-portal
git push -u origin egypt-portal --force

echo "============================================"
echo "🎯 DEPLOYMENT TRIGGERED!"
echo "Master Said, open your Vercel Dashboard and ensure:"
echo "1. OPENAI_API_KEY is set in Vercel Env."
echo "2. GEMINI_API_KEY is set in Vercel Env."
echo "3. The subdomains are linked to egypt.alarabclub777.com, cp.alarabclub777.com, and api.alarabclub777.com."
echo "============================================"
