#!/bin/bash
# ─────────────────────────────────────────────────────────
# shade-setup.sh
# Local dev setup script for Shade Agent projects
# Usage:
#   ./shade-setup.sh              → full run (build + deploy)
#   ./shade-setup.sh --skip-build → skip cargo build
#   ./shade-setup.sh --skip-deploy → build only, no shade deploy
# ─────────────────────────────────────────────────────────

set -e

# ── Colors ──────────────────────────────────────────────
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log()  { echo -e "${GREEN}✅ $1${NC}"; }
warn() { echo -e "${YELLOW}⚠️  $1${NC}"; }
err()  { echo -e "${RED}❌ $1${NC}"; exit 1; }
step() { echo -e "\n${YELLOW}──── $1 ────${NC}"; }

# ── Flags ────────────────────────────────────────────────
SKIP_BUILD=false
SKIP_DEPLOY=false

for arg in "$@"; do
  case $arg in
    --skip-build)  SKIP_BUILD=true ;;
    --skip-deploy) SKIP_DEPLOY=true ;;
  esac
done

# ─────────────────────────────────────────────────────────
# 1. Check required tools
# ─────────────────────────────────────────────────────────
step "Checking required tools"

command -v rustup &>/dev/null || err "rustup not found. Install from https://rustup.rs"
command -v cargo  &>/dev/null || err "cargo not found. Install Rust first."
command -v docker &>/dev/null || err "docker not found. Install Docker first."
command -v node   &>/dev/null || err "node not found. Install Node.js first."
command -v npm    &>/dev/null || err "npm not found."

log "All required tools found"

# ─────────────────────────────────────────────────────────
# 2. Ensure wasm32 target is installed
# ─────────────────────────────────────────────────────────
step "Checking wasm32-unknown-unknown target"

if ! rustup target list --installed | grep -q "wasm32-unknown-unknown"; then
  warn "wasm32-unknown-unknown not installed, adding it..."
  rustup target add wasm32-unknown-unknown
  log "wasm32-unknown-unknown installed"
else
  log "wasm32-unknown-unknown already installed"
fi

# ─────────────────────────────────────────────────────────
# 3. Fix target/ permissions if owned by root
# ─────────────────────────────────────────────────────────
step "Checking target/ directory permissions"

if [ -d "agent-contract/target" ]; then
  OWNER=$(stat -c '%U' agent-contract/target)
  if [ "$OWNER" != "$USER" ]; then
    warn "target/ owned by '$OWNER', fixing to '$USER'..."
    sudo chown -R $USER:$USER agent-contract/target
    log "Permissions fixed"
  else
    log "Permissions already correct"
  fi
else
  log "No target/ directory yet, skipping"
fi

# ─────────────────────────────────────────────────────────
# 4. Install npm dependencies
# ─────────────────────────────────────────────────────────
step "Installing npm dependencies"
npm install
log "npm dependencies installed"

# ─────────────────────────────────────────────────────────
# 5. Install Shade CLI if missing
# ─────────────────────────────────────────────────────────
step "Checking Shade Agent CLI"

if ! command -v shade &>/dev/null; then
  warn "Shade CLI not found, installing..."
  npm i -g @neardefi/shade-agent-cli
  log "Shade CLI installed"
else
  log "Shade CLI already installed"
fi

# ─────────────────────────────────────────────────────────
# 6. Build the contract
# ─────────────────────────────────────────────────────────
if [ "$SKIP_BUILD" = false ]; then
  step "Building agent contract (WASM)"

  cd agent-contract
  cargo build --target wasm32-unknown-unknown --release
  cd ..

  # Fix permissions after build (shade may have left root-owned files)
  sudo chown -R $USER:$USER agent-contract/target 2>/dev/null || true

  WASM_PATH="./agent-contract/target/near/shade_contract_template.wasm"
  [ -f "$WASM_PATH" ] || err "WASM not found at $WASM_PATH — build may have failed"

  log "Contract built: $WASM_PATH"

  # Patch deployment.yaml to use pre-built WASM
  step "Patching deployment.yaml to deploy_from_wasm"

  python3 - <<'EOF'
import re

with open("deployment.yaml", "r") as f:
    content = f.read()

content = re.sub(
    r'(deploy_from_source:\s*\n\s*enabled:\s*)true',
    r'\1false',
    content
)
content = re.sub(
    r'(deploy_from_wasm:\s*\n\s*enabled:\s*)false',
    r'\1true',
    content
)

with open("deployment.yaml", "w") as f:
    f.write(content)

print("deployment.yaml patched")
EOF

  log "deployment.yaml updated to deploy_from_wasm"
else
  warn "Skipping build (--skip-build)"
fi

# ─────────────────────────────────────────────────────────
# 7. Ensure Docker is running
# ─────────────────────────────────────────────────────────
step "Checking Docker"

if ! docker info &>/dev/null; then
  warn "Docker not running, starting..."
  sudo systemctl start docker
  sleep 3
fi

docker info &>/dev/null || err "Docker still not running. Start it manually."
log "Docker is running"

# ─────────────────────────────────────────────────────────
# 8. Run shade deploy
# ─────────────────────────────────────────────────────────
if [ "$SKIP_DEPLOY" = false ]; then
  step "Running shade deploy"
  shade deploy
  log "shade deploy complete"
else
  warn "Skipping shade deploy (--skip-deploy)"
fi

# ─────────────────────────────────────────────────────────
# Done
# ─────────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  Setup complete! Next steps:${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "  Terminal 2 → ${YELLOW}npm run dev${NC}  (or docker compose up)"
echo -e "  Terminal 3 → ${YELLOW}shade whitelist${NC}"
echo ""