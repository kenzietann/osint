#!/bin/bash
# Install dev prerequisites: git, Python 3, Node.js, Docker (+ compose).
# Postgres, Redis and MinIO run via `docker compose`, not installed natively.
set -euo pipefail

cd "$(dirname "$0")/.."

if command -v dnf >/dev/null; then
  sudo dnf install -y git python3 python3-pip nodejs npm moby-engine docker-compose
elif command -v apt-get >/dev/null; then
  sudo apt-get update
  sudo apt-get install -y git python3 python3-venv python3-pip nodejs npm docker.io
  sudo apt-get install -y docker-compose-v2 || sudo apt-get install -y docker-compose  # Debian lacks -v2
elif command -v pacman >/dev/null; then
  sudo pacman -S --needed --noconfirm git python python-pip nodejs npm docker docker-compose
else
  echo "Unsupported distro: install git, python3, nodejs, npm, docker and docker compose manually." >&2
  exit 1
fi

sudo systemctl enable --now docker
if ! id -nG "$USER" | grep -qw docker; then
  sudo usermod -aG docker "$USER"
  echo "Added $USER to the docker group. Log out and back in to use docker without sudo."
fi

# Commit tooling: `npm run commit` (czg) + commitlint hook via husky (`prepare` script).
npm install

[ -f .env.example ] && [ ! -f .env ] && cp .env.example .env && echo "Created .env from .env.example. Fill in the secrets."

echo
git --version
python3 --version
node --version
docker --version
docker compose version || echo "docker compose not found"
echo "Setup done."
