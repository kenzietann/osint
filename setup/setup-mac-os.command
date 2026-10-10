#!/bin/zsh
# Install dev prerequisites: git, Python 3, Node.js, Docker Desktop (includes compose).
# Postgres, Redis and MinIO run via `docker compose`, not installed natively.
set -euo pipefail

cd "$(dirname "$0")/.."

if ! command -v brew >/dev/null; then
  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
  eval "$(/opt/homebrew/bin/brew shellenv 2>/dev/null || /usr/local/bin/brew shellenv)"
fi

brew install git python node pipx
brew install --cask docker
open -a Docker

# Commitizen: `cz commit` for guided messages, hook rejects non-conventional ones.
pipx install commitizen
pipx ensurepath
git config core.hooksPath .githooks

[ -f .env.example ] && [ ! -f .env ] && cp .env.example .env && echo "Created .env from .env.example. Fill in the secrets."

echo
git --version
python3 --version
node --version
echo "Setup done. Wait for Docker Desktop to finish starting, then run: docker compose version"
