#!/bin/bash
# 🦅 ALARAB 777 - MASTER RESTORE SCRIPT
# This script fixes EVERYTHING.

cd "$(dirname "$0")"
echo "🦅 STARTING MASTER RESTORATION..."

# 1. Kill Zombies
echo "💀 Killing old processes..."
lsof -ti:7777 | xargs kill -9 2>/dev/null

# 2. Go to Source
cd "/Users/macos/AlArab777/AlArab777_Unified_Voice_System/seven website/news/updated/AlArabClub777.com-main"

# 3. Install missing brains
echo "🧠 Installing Dependencies (This might take a moment)..."
npm install --silent

# 4. Build the Portal
echo "🏗️ Building Portal with New Keys..."
npm run build

# 5. Move to Production
echo "🚀 Deploying to Production Folder..."
mkdir -p "/Users/macos/AlArab777/AlArabClub777.com"
cp -R dist/* "/Users/macos/AlArab777/AlArabClub777.com/"

# 6. Launch
cd "/Users/macos/AlArab777/AlArabClub777.com"
echo "✅ SYSTEM LIVE @ http://localhost:7777"
echo "Press Ctrl+C to stop."

# Open Browser
open "http://localhost:7777"

# Start Server
python3 -m http.server 7777
