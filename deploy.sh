#!/bin/bash

# InteractAI - Super Smart Deployment Script
# ----------------------------------------
# This script automates everything from environment setup to Docker deployment.

set -e # Exit on error

# Text Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting InteractAI Automated Deployment...${NC}"

# 1. Dependency Check
echo -e "${YELLOW}🔍 Checking system dependencies...${NC}"

check_cmd() {
    if ! command -v "$1" &> /dev/null; then
        echo -e "${RED}❌ $1 is not installed. Please install $1 and try again.${NC}"
        exit 1
    fi
}

check_cmd docker
check_cmd docker-compose
check_cmd npm
check_cmd node
echo -e "${GREEN}✅ Dependencies verified.${NC}"

# 2. Environment File Setup
echo -e "${YELLOW}📝 Setting up environment files...${NC}"

setup_env() {
    local dir=$1
    local file=$2
    local example=$3
    
    if [ ! -f "$dir/$file" ]; then
        if [ -f "$dir/$example" ]; then
            echo -e "Creating $file from $example in $dir..."
            cp "$dir/$example" "$dir/$file"
        else
            echo -e "${RED}⚠️  Warning: $example not found in $dir. Skipping auto-creation.${NC}"
        fi
    else
        echo -e "✅ $file already exists in $dir."
    fi
}

setup_env "server" ".env" ".env.example"
setup_env "client" ".env.local" ".env.example" # Assuming .env.example exists or fallback

# 3. Clean start
echo -e "${YELLOW}🧹 Cleaning up old containers...${NC}"
docker-compose down --remove-orphans

# 4. Starting Piston First (needed for the package setup)
echo -e "${YELLOW}📦 Initializing Piston Code Engine...${NC}"
docker-compose up -d piston

# Wait for Piston API to be ready
echo -e "⏳ Waiting for Piston API (localhost:2000) to go live..."
until curl -s http://localhost:2000/api/v2/piston/runtimes > /dev/null; do
  echo -n "."
  sleep 2
done
echo -e "\n${GREEN}✅ Piston API is live!${NC}"

# 5. Automated Language Installation
echo -e "${YELLOW}🛠️  Installing Language Runtimes (Python, Java, JS, etc.)...${NC}"

# We use a temporary container to run the ppman logic if node is available locally
# or we can run the existing script if it's reliable.
if [ -f "piston/setup_piston.sh" ]; then
    echo "Running existing Piston setup script..."
    bash piston/setup_piston.sh
else
    echo -e "${RED}❌ Piston setup script missing. Cannot auto-install languages.${NC}"
fi

# 6. Build and Start the Full Stack
echo -e "${BLUE}🐳 Building and starting InteractAI Client and Server...${NC}"
docker-compose up -d --build

echo -e "\n${GREEN}====================================================${NC}"
echo -e "${GREEN}🎉 DEPLOYMENT SUCCESSFUL!${NC}"
echo -e "----------------------------------------------------"
echo -e "🖥️  Frontend: http://localhost:3000"
echo -e "🔌 Backend:  http://localhost:5000"
echo -e "📟 Piston:   http://localhost:2000"
echo -e "----------------------------------------------------"
echo -e "${YELLOW}Note: If this is your first time, check your .env files${NC}"
echo -e "${YELLOW}and update your API keys for Firebase, Vapi, etc.${NC}"
echo -e "${GREEN}====================================================${NC}"
