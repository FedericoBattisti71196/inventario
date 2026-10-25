#!/usr/bin/env bash
# Eseguito sul server Linux. Aggiorna codice, dipendenze e riavvia i servizi.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

BRANCH="${DEPLOY_BRANCH:-main}"
VITE_API_URL="${VITE_API_URL:-http://127.0.0.1:8000}"

echo "==> Repo: $ROOT"
echo "==> Branch: $BRANCH"

if [[ -d .git ]]; then
  git fetch origin
  git checkout "$BRANCH"
  git pull --ff-only origin "$BRANCH"
else
  echo "ERRORE: $ROOT non è un repository git." >&2
  exit 1
fi

echo "==> Backend: venv + requirements"
cd "$ROOT/backend"
if [[ ! -d .venv ]]; then
  python3 -m venv .venv
fi
# shellcheck disable=SC1091
source .venv/bin/activate
pip install -q --upgrade pip
pip install -q -r requirements.txt
deactivate
cd "$ROOT"

echo "==> Frontend: install + build"
cd "$ROOT/frontend"
if [[ ! -f .env ]]; then
  echo "VITE_API_URL=$VITE_API_URL" > .env
else
  if grep -q '^VITE_API_URL=' .env; then
    sed -i "s|^VITE_API_URL=.*|VITE_API_URL=$VITE_API_URL|" .env
  else
    echo "VITE_API_URL=$VITE_API_URL" >> .env
  fi
fi
npm ci
npm run build
cd "$ROOT"

restart_unit() {
  local unit="$1"
  if systemctl list-unit-files --type=service --no-legend 2>/dev/null | grep -q "^${unit}"; then
    echo "==> systemctl restart $unit"
    sudo systemctl restart "$unit"
    sudo systemctl --no-pager --full status "$unit" || true
    return 0
  fi
  return 1
}

echo "==> Riavvio servizi"
API_OK=0
WEB_OK=0
restart_unit "inventario-api.service" && API_OK=1 || true
restart_unit "inventario-web.service" && WEB_OK=1 || true

if [[ "$API_OK" -eq 0 ]]; then
  echo "AVVISO: inventario-api.service non trovato."
  echo "  Avvio manuale suggerito:"
  echo "  cd $ROOT/backend && source .venv/bin/activate && uvicorn main:app --host 0.0.0.0 --port 8000"
fi
if [[ "$WEB_OK" -eq 0 ]]; then
  echo "AVVISO: inventario-web.service non trovato."
  echo "  Per servire il frontend buildato (dist/) usa nginx oppure:"
  echo "  cd $ROOT/frontend && npx --yes serve -s dist -l 5173"
fi

echo "==> Deploy completato."
