#!/usr/bin/env bash
set -euo pipefail

# Target directory inside your Codespace
TARGET_DIR="packages/mail-templates"

# Repo & commit for the BlacketPS mail-templates package
REPO_URL="https://github.com/BlacketPS/mail-templates.git"
COMMIT_HASH="82c61a40b497ce14354fcd51772673e6c0529816"

echo "🔁 Cloning BlacketPS mail-templates into '$TARGET_DIR'..."

# Remove existing folder if present
if [ -d "$TARGET_DIR" ]; then
  echo "⚠️  Folder '$TARGET_DIR' already exists — removing it..."
  rm -rf "$TARGET_DIR"
fi

# Create parent folders if needed
mkdir -p "$(dirname "$TARGET_DIR")"

# Clone the repo
git clone --depth 1 "$REPO_URL" "$TARGET_DIR"

cd "$TARGET_DIR"

# Fetch and checkout the specific commit
git fetch origin "$COMMIT_HASH" --depth=1 || true
git checkout "$COMMIT_HASH"

echo "✅ Done! Repository cloned into '$TARGET_DIR' at commit $COMMIT_HASH"

# Show folder structure
echo
echo "📁 Folder structure:"
ls -la
