#!/bin/bash

# Piston Setup Helper Script (Improved)

echo "🛑 Cleaning up existing Piston containers to avoid conflicts..."
docker-compose down 2>/dev/null || true
docker rm -f piston_api 2>/dev/null || true

echo "🚀 Starting Piston API container..."
docker-compose up -d

echo "⏳ Waiting for API to be ready..."
until curl -s http://localhost:2000/api/v2/piston/runtimes > /dev/null; do
  echo -n "."
  sleep 1
done
echo "✅ Piston API is up!"

echo "📦 Setting up Piston Package Manager (ppman)..."
TEMP_DIR=$(mktemp -d)
echo "Cloning Piston CLI to $TEMP_DIR..."
git clone --depth 1 https://github.com/engineer-man/piston.git "$TEMP_DIR/piston"

echo "Installing CLI dependencies..."
cd "$TEMP_DIR/piston/cli"
npm install --silent

# List of languages to install
LANGUAGES=(
  "javascript=18.15.0"
  "typescript=5.0.3"
  "python=3.10.0"
  "java=15.0.2"
  "gcc=10.2.0"
  "cpp=10.2.0"
  "go=1.16.2"
  "rust=1.68.2"
)

echo "📦 Installing common language runtimes..."
for lang_ver in "${LANGUAGES[@]}"; do
  echo "Installing $lang_ver..."
  node index.js -u http://localhost:2000 ppman install "$lang_ver"
done

echo "🧹 Cleaning up temporary files..."
rm -rf "$TEMP_DIR"

echo "🎉 Piston is ready to use at http://localhost:2000/api/v2/piston"
echo "You can test it with: curl http://localhost:2000/api/v2/piston/runtimes"
