#!/bin/bash
echo "🔱 ALARAB 777 - EMERGENCY ACTIVATION SCRIPT"
echo "=========================================="
echo "Master Said, this script will link your project to Vercel"
echo "and force the link to go LIVE immediately."
echo ""

# Navigate to project
cd "$(dirname "$0")"

# 1. Login to Vercel (Safe check)
echo "🔑 Step 1: Vercel Authentication..."
npx vercel login

# 2. Link Project
echo "🔗 Step 2: Linking to egypt-alarabclub777..."
npx vercel link --yes

# 3. Pull Env & Force Production
echo "🚀 Step 3: Pushing Bone-Spine to Production..."
npx vercel --prod --yes

echo "=========================================="
echo "✅ MISSION ACCOMPLISHED"
echo "Your link should now be LIVE at:"
echo "https://egypt-alarabclub777.vercel.app"
echo "=========================================="
