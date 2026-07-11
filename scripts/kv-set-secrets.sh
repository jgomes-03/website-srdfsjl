#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# Interactive helper to populate Key Vault secrets for a given environment.
#
# Reads a values file that you keep locally (never commit) and pushes each
# entry to Azure Key Vault. The value file format is a plain .env-style file:
#
#   MONGO_URL=mongodb+srv://...
#   DB_NAME=srdfsjl_dev
#   JWT_SECRET=random-string
#   ...
#
# Usage:
#   ./scripts/kv-set-secrets.sh dev  ./secrets.dev.env
#   ./scripts/kv-set-secrets.sh prod ./secrets.prod.env
# ---------------------------------------------------------------------------

set -euo pipefail

ENV_NAME="${1:-}"
VALUES_FILE="${2:-}"

if [[ -z "$ENV_NAME" || -z "$VALUES_FILE" ]]; then
  echo "Usage: $0 <dev|prod> <path-to-values.env>" >&2
  exit 1
fi
if [[ ! -f "$VALUES_FILE" ]]; then
  echo "Values file not found: $VALUES_FILE" >&2
  exit 1
fi

SUBSCRIPTION_ID="${SUBSCRIPTION_ID:-$(az account show --query id -o tsv)}"
PROJECT="srdfsjl"
KV="kv-${PROJECT}-${ENV_NAME}-$(echo -n "$SUBSCRIPTION_ID" | cut -c1-4)"

echo ">>> Target Key Vault: $KV"
echo ""

while IFS= read -r line || [[ -n "$line" ]]; do
  # Skip empty lines and comments
  [[ -z "$line" || "$line" =~ ^[[:space:]]*# ]] && continue

  # Split KEY=VALUE (only the first '=')
  key="${line%%=*}"
  value="${line#*=}"
  key="$(echo -n "$key" | tr -d '[:space:]')"

  # Key Vault forbids underscores; convert to hyphens.
  kv_name="$(echo -n "$key" | tr '_' '-')"

  echo "  → $key   ($kv_name)"
  az keyvault secret set --vault-name "$KV" --name "$kv_name" --value "$value" -o none
done < "$VALUES_FILE"

echo ""
echo ">>> Done. Restart the Container App to pick up new values:"
echo "    az containerapp revision restart -n ca-${PROJECT}-backend-${ENV_NAME} -g rg-${PROJECT}-${ENV_NAME}"
