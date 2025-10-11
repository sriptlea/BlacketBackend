#!/bin/bash

set -e

SUB_DIRS=(
  "frontend"
  "backend"
  "discord-bot"
  "packages/common"
  "packages/core"
  "packages/types"
)

if [ -z "$1" ]; then
  echo "❌ Error: No branch name supplied."
  echo "Usage: ./create-branch-all.sh <branch-name>"
  exit 1
fi

BRANCH_NAME="$1"

echo "🌿 Creating branch '$BRANCH_NAME' in root directory..."
git checkout -b "$BRANCH_NAME"
echo "✅ Done."
echo "----------------------------------------"

for dir in "${SUB_DIRS[@]}"; do
  if [ -d "$dir" ]; then
    echo "- Entering '$dir'..."
    cd "$dir"
    echo "  🌿 Creating branch '$BRANCH_NAME'..."
    git checkout -b "$BRANCH_NAME"
    cd - > /dev/null # Go back to the previous directory quietly.
    echo "  ✅ Done in '$dir'."
    echo "----------------------------------------"
  else
    echo "⚠️ Warning: Directory '$dir' not found. Skipping."
    echo "----------------------------------------"
  fi
done

echo "🎉 Successfully created the '$BRANCH_NAME' branch in all specified locations."
