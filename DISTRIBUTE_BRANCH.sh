#!/bin/bash
# 🔱 ALARAB 777 - BRANCH DISTILLER (TEMPLATE DISTRIBUTOR)
# ======================================================
# This script creates a new branch of the Sovereign OS
# from the Master Template.

echo "🔱 Sovereign Distribution: Initializing..."

# 1. Input Verification
NEW_BRANCH=$1
SOVEREIGN_ID=$2

if [ -z "$NEW_BRANCH" ] || [ -z "$SOVEREIGN_ID" ]; then
    echo "❌ Usage: ./DISTRIBUTE_BRANCH.sh <branch_name> '<sovereign_id_string>'"
    echo "Example: ./DISTRIBUTE_BRANCH.sh jordan-portal 'ID:ALR777|OWNER:SHARIF|...|PERSONA:judy'"
    exit 1
fi

echo "📦 Distilling branch: $NEW_BRANCH"

# 2. Safety Check (Git)
if ! git rev-parse --is-inside-work-tree > /dev/null 2>&1; then
    echo "❌ Error: Not a git repository."
    exit 1
fi

# 3. Create Fresh Branch from Main
git checkout -b "$NEW_BRANCH"

# 4. Inject the Sovereign ID into Vertebra 0 (index.html)
echo "🧬 Injecting Sovereign Identity..."
sed -i '' "s/data-identity=\".*\"/data-identity=\"$SOVEREIGN_ID\"/" index.html

# 5. Commit the New Identity
git add .
git commit -m "distribution: Distilled $NEW_BRANCH Sovereign OS"

echo "======================================================"
echo "✅ DISTRIBUTION COMPLETE"
echo "Joints Connected. Spine Verified."
echo "Now run: git push origin $NEW_BRANCH"
echo "======================================================"
