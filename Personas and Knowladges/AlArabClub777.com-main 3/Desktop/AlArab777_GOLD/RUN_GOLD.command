#!/bin/bash
cd "$(dirname "$0")"

echo "🦅 ALARAB 777 - GOLD EDITION"
echo "============================="

# Kill old ports
lsof -ti:7777 | xargs kill -9 2>/dev/null

echo "🔧 Checking setup..."
if [ ! -d "node_modules" ]; then
    echo "📦 Installing libraries (First Run Only)..."
    npm install --silent
fi

echo "🏗️ Building System..."
npm run build

echo "🚀 Launching Port 7777..."
python3 -m http.server 7777 --directory dist > /dev/null 2>&1 &
SERVER_PID=$!

sleep 2
open "http://localhost:7777"

echo "✅ SYSTEM IS LIVE!"
echo "📍 Location: $(pwd)"
echo "-----------------------------"
echo "Press Ctrl+C to close."
wait $SERVER_PID
