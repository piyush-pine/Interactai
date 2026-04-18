#!/bin/bash

# InteractAI - One-Click Development Startup Script
# --------------------------------------------------
# Runs the Client, Server, and Piston API simultaneously.
# Each service runs in its own terminal tab/pane via a tmux session (if available)
# OR falls back to background processes with a unified log.

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

print_banner() {
  echo -e "${BLUE}"
  echo "  ___       _                      _     _    ___ "
  echo " |_ _|_ __ | |_ ___ _ __ __ _  ___| |_  / \  |_ _|"
  echo "  | || '_ \| __/ _ \ '__/ _\` |/ __| __| / _ |  | | "
  echo "  | || | | | ||  __/ | | (_| | (__| |_ / ___ \ | | "
  echo " |___|_| |_|\__\___|_|  \__,_|\___|\__/_/   \_\___|"
  echo -e "${NC}"
  echo -e "${CYAN}  🚀 One-Click Dev Startup  |  Team INVINCIBLES${NC}"
  echo -e "  ------------------------------------------------"
}

print_banner

# --- Dependency Check ---
echo -e "\n${YELLOW}[1/4] Checking dependencies...${NC}"
MISSING=0
for cmd in node npm docker; do
  if ! command -v "$cmd" &>/dev/null; then
    echo -e "  ${RED}❌ $cmd not found. Please install it.${NC}"
    MISSING=1
  else
    echo -e "  ${GREEN}✓ $cmd found${NC}"
  fi
done
[ "$MISSING" -eq 1 ] && exit 1

# --- Install dependencies if needed ---
echo -e "\n${YELLOW}[2/4] Installing dependencies (if needed)...${NC}"

install_deps() {
  local dir=$1
  local name=$2
  if [ -d "$SCRIPT_DIR/$dir/node_modules" ]; then
    echo -e "  ${GREEN}✓ $name node_modules already installed${NC}"
  else
    echo -e "  ${CYAN}⏳ Running npm install in $dir...${NC}"
    (cd "$SCRIPT_DIR/$dir" && npm install --silent)
    echo -e "  ${GREEN}✓ $name dependencies installed${NC}"
  fi
}

install_deps "client" "Client"
install_deps "server" "Server"

# --- Environment Setup ---
echo -e "\n${YELLOW}[3/4] Setting up environment files...${NC}"
setup_env() {
  local dir=$1 file=$2 example=$3
  if [ ! -f "$SCRIPT_DIR/$dir/$file" ]; then
    if [ -f "$SCRIPT_DIR/$dir/$example" ]; then
      cp "$SCRIPT_DIR/$dir/$example" "$SCRIPT_DIR/$dir/$file"
      echo -e "  ${GREEN}✓ Created $dir/$file from $example${NC}"
    else
      echo -e "  ${YELLOW}⚠  No $example found in $dir  — skipping${NC}"
    fi
  else
    echo -e "  ${GREEN}✓ $dir/$file already exists${NC}"
  fi
}
setup_env "server" ".env" ".env.example"
setup_env "client" ".env.local" ".env.example"

# --- Start Services ---
echo -e "\n${YELLOW}[4/4] Starting all services...${NC}"

LOG_DIR="$SCRIPT_DIR/.logs"
mkdir -p "$LOG_DIR"

# --- Try tmux for pretty split-pane experience ---
if command -v tmux &>/dev/null; then
  echo -e "  ${CYAN}✓ tmux detected — opening split-pane session${NC}"
  tmux new-session -d -s interactai -n "InteractAI" 2>/dev/null || true

  # Pane 1: Client
  tmux send-keys -t interactai "cd '$SCRIPT_DIR/client' && echo '🖥  CLIENT starting...' && npm run dev" C-m

  # Pane 2: Server
  tmux split-window -h -t interactai
  tmux send-keys -t interactai "cd '$SCRIPT_DIR/server' && echo '🔌 SERVER starting...' && npm run dev" C-m

  # Pane 3: Piston (if docker is running)
  tmux split-window -v -t interactai
  if docker info &>/dev/null 2>&1; then
    tmux send-keys -t interactai "cd '$SCRIPT_DIR/piston' && echo '📟 PISTON starting...' && docker-compose up" C-m
  else
    tmux send-keys -t interactai "echo '⚠  Docker not running — Piston skipped. Start Docker and re-run.'" C-m
  fi

  echo -e "\n${GREEN}=====================================================${NC}"
  echo -e "${GREEN}✅ All services starting in tmux!${NC}"
  echo -e ""
  echo -e "  Run:  ${CYAN}tmux attach -t interactai${NC}  to view the session"
  echo -e ""
  echo -e "  🖥️  Frontend: ${CYAN}http://localhost:3000${NC}"
  echo -e "  🔌 Backend:  ${CYAN}http://localhost:5000${NC}"
  echo -e "  📟 Piston:   ${CYAN}http://localhost:2000${NC}"
  echo -e "${GREEN}=====================================================${NC}"

  tmux attach -t interactai

else
  # --- Fallback: background processes with log files ---
  echo -e "  ${YELLOW}tmux not found — starting services in background${NC}"

  # Start Client
  echo -e "  ${CYAN}⏳ Starting Client (Next.js)...${NC}"
  (cd "$SCRIPT_DIR/client" && npm run dev > "$LOG_DIR/client.log" 2>&1) &
  CLIENT_PID=$!

  # Start Server
  echo -e "  ${CYAN}⏳ Starting Server (Node.js)...${NC}"
  (cd "$SCRIPT_DIR/server" && npm run dev > "$LOG_DIR/server.log" 2>&1) &
  SERVER_PID=$!

  # Start Piston (if docker available)
  if docker info &>/dev/null 2>&1; then
    echo -e "  ${CYAN}⏳ Starting Piston (Docker)...${NC}"
    (cd "$SCRIPT_DIR/piston" && docker-compose up > "$LOG_DIR/piston.log" 2>&1) &
    PISTON_PID=$!
  else
    echo -e "  ${YELLOW}⚠  Docker not running — Piston skipped${NC}"
    PISTON_PID=""
  fi

  # Wait for client to be ready
  echo -e "\n  ${YELLOW}⏳ Waiting for services to come online...${NC}"
  sleep 4

  echo -e "\n${GREEN}=====================================================${NC}"
  echo -e "${GREEN}✅ All services are running!${NC}"
  echo -e ""
  echo -e "  🖥️  Frontend:  ${CYAN}http://localhost:3000${NC}  (PID: $CLIENT_PID)"
  echo -e "  🔌 Backend:   ${CYAN}http://localhost:5000${NC}  (PID: $SERVER_PID)"
  [ -n "$PISTON_PID" ] && echo -e "  📟 Piston:    ${CYAN}http://localhost:2000${NC}  (PID: $PISTON_PID)"
  echo -e ""
  echo -e "  📄 Logs:  ${YELLOW}$LOG_DIR/${NC}"
  echo -e ""
  echo -e "  Press ${RED}Ctrl+C${NC} to stop all services."
  echo -e "${GREEN}=====================================================${NC}"

  # Keep script running — cleanup on exit
  cleanup() {
    echo -e "\n${YELLOW}🛑 Shutting down all services...${NC}"
    kill "$CLIENT_PID" "$SERVER_PID" 2>/dev/null || true
    [ -n "$PISTON_PID" ] && kill "$PISTON_PID" 2>/dev/null || true
    echo -e "${GREEN}✅ All services stopped.${NC}"
    exit 0
  }
  trap cleanup SIGINT SIGTERM

  wait
fi
