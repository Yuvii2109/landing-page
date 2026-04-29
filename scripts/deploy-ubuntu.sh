#!/usr/bin/env bash
set -Eeuo pipefail
trap 'fail "Deployment failed at line $LINENO while running: $BASH_COMMAND"' ERR

REPO_URL="${REPO_URL:-https://github.com/muconnect/sparkolympiad.git}"

BRANCH="${BRANCH:-main}"
APP_DIR="${APP_DIR:-/var/www/html/sparkolympiad}"
APP_NAME="${APP_NAME:-spark-registration}"
PORT="${PORT:-5104}"
DOMAIN="${DOMAIN:-}"
SETUP_NGINX="${SETUP_NGINX:-0}"
INSTALL_NODE="${INSTALL_NODE:-1}"
FORCE_RESET="${FORCE_RESET:-0}"
export GIT_SSH_COMMAND="${GIT_SSH_COMMAND:-ssh -o BatchMode=yes -o StrictHostKeyChecking=accept-new}"
DEPLOY_NEEDED=1

log() {
  printf "\n\033[1;34m==>\033[0m %s\n" "$*"
}

fail() {
  printf "\n\033[1;31mERROR:\033[0m %s\n" "$*" >&2
  exit 1
}

need_cmd() {
  command -v "$1" >/dev/null 2>&1
}

require_ubuntu() {
  if ! need_cmd apt-get; then
    fail "This script is intended for Ubuntu/Debian servers with apt-get."
  fi
}

install_system_packages() {
  log "Installing required system packages"
  sudo apt-get update
  sudo apt-get install -y ca-certificates curl git nginx openssh-client
}

check_github_ssh_access() {
  if [[ "$REPO_URL" != git@github.com:* ]]; then
    return
  fi

  log "Checking GitHub SSH access"
  local ssh_output
  ssh_output="$(ssh -o BatchMode=yes -o StrictHostKeyChecking=accept-new -T git@github.com 2>&1 || true)"
  if printf "%s\n" "$ssh_output" | grep -Eq "successfully authenticated|Hi "; then
    return
  fi

  printf "\nGitHub SSH response:\n%s\n" "$ssh_output" >&2

  cat >&2 <<'SSH_HELP'

GitHub SSH access is not ready for this server.

Run these commands on the Ubuntu server:

  ssh-keygen -t ed25519 -C "sparkolympiad deploy"
  cat ~/.ssh/id_ed25519.pub

Then copy the full public key into:

  GitHub repo -> Settings -> Deploy keys -> Add deploy key

After adding the key, rerun this deploy script.
SSH_HELP
  exit 1
}

install_node_if_needed() {
  if need_cmd node; then
    local major
    major="$(node -p "process.versions.node.split('.')[0]")"
    if [ "$major" -ge 20 ]; then
      log "Node.js $(node -v) is already installed"
      return
    fi
  fi

  if [ "$INSTALL_NODE" != "1" ]; then
    fail "Node.js 20+ is required. Install it or rerun with INSTALL_NODE=1."
  fi

  log "Installing Node.js 20"
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs
}

install_pm2_if_needed() {
  if need_cmd pm2; then
    log "PM2 is already installed"
    return
  fi

  log "Installing PM2"
  sudo npm install -g pm2
}

checkout_or_update_repo() {
  log "Deploying repository $REPO_URL#$BRANCH to $APP_DIR"
  sudo mkdir -p "$APP_DIR"
  sudo chown -R "$USER":"$USER" "$APP_DIR"

  if [ -d "$APP_DIR/.git" ]; then
    cd "$APP_DIR"
    git remote set-url origin "$REPO_URL"
    if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
      fail "Directory is not a git repository: $APP_DIR"
    fi

    if [ "$FORCE_RESET" != "1" ] && { ! git diff --quiet || ! git diff --cached --quiet; }; then
      fail "Working tree has uncommitted changes. Commit or stash them before deploying."
    fi

    log "Fetching latest changes from origin/$BRANCH"
    git fetch origin "$BRANCH"

    if [ "$FORCE_RESET" = "1" ]; then
      if git show-ref --verify --quiet "refs/heads/$BRANCH"; then
        git checkout "$BRANCH"
      else
        git checkout -b "$BRANCH" "origin/$BRANCH"
      fi
      git reset --hard "origin/$BRANCH"
      return
    fi

    local current_branch
    current_branch="$(git branch --show-current)"

    if [[ "$current_branch" != "$BRANCH" ]]; then
      log "Switching from ${current_branch:-detached} to $BRANCH"
      if git show-ref --verify --quiet "refs/heads/$BRANCH"; then
        git checkout "$BRANCH"
      else
        git checkout -b "$BRANCH" "origin/$BRANCH"
      fi
    fi

    local local_head remote_head
    local_head="$(git rev-parse HEAD)"
    remote_head="$(git rev-parse "origin/$BRANCH")"

    if [[ "$local_head" == "$remote_head" ]]; then
      log "No new commits found. Nothing to pull."
      DEPLOY_NEEDED=0
      return
    fi

    log "New commit detected. Pulling latest code."
    git pull --ff-only origin "$BRANCH"
  else
    git clone --branch "$BRANCH" "$REPO_URL" "$APP_DIR"
    cd "$APP_DIR"
  fi
}

ensure_deploy_needed() {
  if [ "$DEPLOY_NEEDED" != "1" ]; then
    log "Code is already up to date. Skipping build and restart."
    print_summary
    exit 0
  fi
}

ensure_env_file() {
  cd "$APP_DIR"

  if [ ! -f .env ]; then
    log "Creating .env"
    if [ -f .env.example ]; then
      cp .env.example .env
    else
      cat > .env <<'ENV_FILE'
# NexG SMS gateway configuration for OTP flow
NEXG_USERNAME=
NEXG_PASSWORD=
NEXG_FROM=EDXSOL
NEXG_DLT_TEMPLATE_ID=
NEXG_DLT_PRINCIPAL_ENTITY_ID=
NEXG_DLT_TELEMARKETER_ID=
NEXG_OTP_TEXT_TEMPLATE=Your OTP for EDXSO workshop registration is {{OTP}}. Do not share it with anyone.

# Supabase configuration for backend persistence
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ENV_FILE
    fi
    chmod 600 .env
    printf "\nCreated %s/.env. Fill in Supabase and NexG values for live OTP/registration persistence.\n" "$APP_DIR"
  else
    log "Keeping existing .env"
  fi
}

install_and_build_app() {
  cd "$APP_DIR"

  log "Installing npm dependencies"
  npm ci

  log "Building production bundle"
  npm run build
}

write_pm2_config() {
  cd "$APP_DIR"

  log "Writing PM2 ecosystem config"
  cat > ecosystem.config.cjs <<PM2_CONFIG
module.exports = {
  apps: [
    {
      name: "${APP_NAME}",
      script: "server.js",
      cwd: "${APP_DIR}",
      env: {
        NODE_ENV: "production",
        PORT: "${PORT}"
      }
    }
  ]
};
PM2_CONFIG
}

start_pm2() {
  cd "$APP_DIR"

  log "Starting app with PM2"
  pm2 startOrReload ecosystem.config.cjs --update-env
  pm2 save

  log "Enabling PM2 startup"
  sudo env "PATH=$PATH" pm2 startup systemd -u "$USER" --hp "$HOME"
}

setup_nginx() {
  if [ "$SETUP_NGINX" != "1" ]; then
    return
  fi

  if [ -z "$DOMAIN" ]; then
    fail "SETUP_NGINX=1 requires DOMAIN=your-domain.com"
  fi

  log "Configuring Nginx for $DOMAIN"
  sudo tee "/etc/nginx/sites-available/${APP_NAME}" >/dev/null <<NGINX_CONFIG
server {
  listen 80;
  server_name ${DOMAIN};

  location / {
    proxy_pass http://127.0.0.1:${PORT};
    proxy_http_version 1.1;
    proxy_set_header Host \$host;
    proxy_set_header X-Real-IP \$remote_addr;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
  }
}
NGINX_CONFIG

  sudo ln -sfn "/etc/nginx/sites-available/${APP_NAME}" "/etc/nginx/sites-enabled/${APP_NAME}"
  sudo nginx -t
  sudo systemctl reload nginx
}

print_summary() {
  log "Deployment complete"
  printf "App directory: %s\n" "$APP_DIR"
  printf "PM2 app name:  %s\n" "$APP_NAME"
  printf "Local URL:     http://127.0.0.1:%s\n" "$PORT"

  if [ -n "$DOMAIN" ] && [ "$SETUP_NGINX" = "1" ]; then
    printf "Public URL:    http://%s\n" "$DOMAIN"
    printf "\nAfter DNS points to this server, enable HTTPS with:\n"
    printf "sudo certbot --nginx -d %s\n" "$DOMAIN"
  fi

  printf "\nUseful commands:\n"
  printf "pm2 status\n"
  printf "pm2 logs %s\n" "$APP_NAME"
  printf "cd %s && git pull --ff-only origin %s && npm ci && npm run build && pm2 reload %s\n" "$APP_DIR" "$BRANCH" "$APP_NAME"
}

main() {
  require_ubuntu
  install_system_packages
  install_node_if_needed
  install_pm2_if_needed
  check_github_ssh_access
  checkout_or_update_repo
  ensure_deploy_needed
  ensure_env_file
  install_and_build_app
  write_pm2_config
  start_pm2
  setup_nginx
  print_summary
}

main "$@"
