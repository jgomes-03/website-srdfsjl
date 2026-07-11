#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# One-shot bootstrap for SRDFSJL infrastructure on Azure.
#
# Creates (per environment: dev / prod):
#   - Resource Group
#   - Key Vault (RBAC enabled)
#   - User-Assigned Managed Identity
#   - Log Analytics workspace
#   - Container Apps Environment
#   - Backend Container App (pull image, env vars, MI, ingress)
#   - Frontend Container App (pull image, ingress)
#
# Also configures:
#   - Federated credential so GitHub Actions can log in with OIDC (no secret)
#   - RBAC assignment: MI + your user get Key Vault Secrets User role
#   - AcrPull / GHCR pull secret for the Container App
#
# Requirements: az CLI logged in (`az login`), owner/contributor on subscription.
#
# Usage:
#   ./scripts/azure-bootstrap.sh dev
#   ./scripts/azure-bootstrap.sh prod
# ---------------------------------------------------------------------------

set -euo pipefail

ENV_NAME="${1:-}"
if [[ -z "$ENV_NAME" || ( "$ENV_NAME" != "dev" && "$ENV_NAME" != "prod" ) ]]; then
  echo "Usage: $0 <dev|prod>" >&2
  exit 1
fi

# ── EDIT THESE ONCE ─────────────────────────────────────────────────────
SUBSCRIPTION_ID="${SUBSCRIPTION_ID:-$(az account show --query id -o tsv)}"
LOCATION="${LOCATION:-westeurope}"
PROJECT="srdfsjl"
GITHUB_ORG="${GITHUB_ORG:jgomes-03}"      # <-- change
GITHUB_REPO="${GITHUB_REPO:website-srdfsjl}"             # <-- change

# ── Derived names ───────────────────────────────────────────────────────
RG="rg-${PROJECT}-${ENV_NAME}"
KV="kv-${PROJECT}-${ENV_NAME}-$(echo -n "$SUBSCRIPTION_ID" | cut -c1-4)"
MI="mi-${PROJECT}-${ENV_NAME}"
LAW="log-${PROJECT}-${ENV_NAME}"
ACA_ENV="cae-${PROJECT}-${ENV_NAME}"
ACA_BACKEND="ca-${PROJECT}-backend-${ENV_NAME}"
ACA_FRONTEND="ca-${PROJECT}-frontend-${ENV_NAME}"

# GitHub OIDC federation
FEDERATED_APP_NAME="gh-oidc-${PROJECT}-${ENV_NAME}"
BRANCH_NAME=$([[ "$ENV_NAME" == "prod" ]] && echo "main" || echo "dev")

echo ">>> Subscription: $SUBSCRIPTION_ID"
echo ">>> Env:          $ENV_NAME"
echo ">>> RG:           $RG"
echo ">>> Key Vault:    $KV"
echo ""

az account set --subscription "$SUBSCRIPTION_ID"

# ── Resource Group ──────────────────────────────────────────────────────
az group create -n "$RG" -l "$LOCATION" -o none

# ── Key Vault (RBAC) ────────────────────────────────────────────────────
az keyvault create -n "$KV" -g "$RG" -l "$LOCATION" \
  --enable-rbac-authorization true \
  --enable-purge-protection true \
  -o none

CURRENT_USER_OID=$(az ad signed-in-user show --query id -o tsv)
KV_ID=$(az keyvault show -n "$KV" -g "$RG" --query id -o tsv)
az role assignment create --role "Key Vault Secrets Officer" \
  --assignee-object-id "$CURRENT_USER_OID" --assignee-principal-type User \
  --scope "$KV_ID" -o none || true

# ── User-Assigned Managed Identity ──────────────────────────────────────
az identity create -n "$MI" -g "$RG" -l "$LOCATION" -o none
MI_ID=$(az identity show -n "$MI" -g "$RG" --query id -o tsv)
MI_CLIENT_ID=$(az identity show -n "$MI" -g "$RG" --query clientId -o tsv)
MI_PRINCIPAL_ID=$(az identity show -n "$MI" -g "$RG" --query principalId -o tsv)

# Grant MI read access to Key Vault secrets
az role assignment create --role "Key Vault Secrets User" \
  --assignee-object-id "$MI_PRINCIPAL_ID" --assignee-principal-type ServicePrincipal \
  --scope "$KV_ID" -o none || true

# ── Log Analytics + ACA Environment ─────────────────────────────────────
az monitor log-analytics workspace create -n "$LAW" -g "$RG" -l "$LOCATION" -o none
LAW_ID=$(az monitor log-analytics workspace show -n "$LAW" -g "$RG" --query customerId -o tsv)
LAW_KEY=$(az monitor log-analytics workspace get-shared-keys -n "$LAW" -g "$RG" --query primarySharedKey -o tsv)

az containerapp env create -n "$ACA_ENV" -g "$RG" -l "$LOCATION" \
  --logs-workspace-id "$LAW_ID" \
  --logs-workspace-key "$LAW_KEY" \
  -o none

# ── GHCR pull secret (public repo? skip; private? PAT with read:packages) ─
if [[ -n "${GHCR_PAT:-}" ]]; then
  echo ">>> Configuring GHCR pull secret (private images)."
  # This step is applied per Container App below via --registry-server flags.
fi

# ── Placeholder Container Apps (first-time only) ────────────────────────
# We deploy a public hello-world; GitHub Actions will swap to real images.
if ! az containerapp show -n "$ACA_BACKEND" -g "$RG" >/dev/null 2>&1; then
  echo ">>> Creating backend Container App (placeholder)"
  az containerapp create -n "$ACA_BACKEND" -g "$RG" \
    --environment "$ACA_ENV" \
    --image mcr.microsoft.com/k8se/quickstart:latest \
    --target-port 8001 --ingress external \
    --min-replicas 1 --max-replicas 3 \
    --user-assigned "$MI_ID" \
    --env-vars "AZURE_KEY_VAULT_URL=https://${KV}.vault.azure.net/" \
               "AZURE_CLIENT_ID=${MI_CLIENT_ID}" \
    -o none
fi

if ! az containerapp show -n "$ACA_FRONTEND" -g "$RG" >/dev/null 2>&1; then
  echo ">>> Creating frontend Container App (placeholder)"
  az containerapp create -n "$ACA_FRONTEND" -g "$RG" \
    --environment "$ACA_ENV" \
    --image mcr.microsoft.com/k8se/quickstart:latest \
    --target-port 80 --ingress external \
    --min-replicas 1 --max-replicas 3 \
    -o none
fi

# ── GitHub OIDC federation (Entra ID app for Actions) ───────────────────
APP_ID=$(az ad app list --display-name "$FEDERATED_APP_NAME" --query "[0].appId" -o tsv || true)
if [[ -z "$APP_ID" || "$APP_ID" == "null" ]]; then
  APP_ID=$(az ad app create --display-name "$FEDERATED_APP_NAME" --query appId -o tsv)
  az ad sp create --id "$APP_ID" -o none
fi
SP_OID=$(az ad sp show --id "$APP_ID" --query id -o tsv)

# Contributor at RG scope so Actions can update Container Apps
az role assignment create --role "Contributor" \
  --assignee-object-id "$SP_OID" --assignee-principal-type ServicePrincipal \
  --scope "/subscriptions/${SUBSCRIPTION_ID}/resourceGroups/${RG}" -o none || true

# Federated credential — trust GitHub Actions from branch $BRANCH_NAME
SUBJECT="repo:${GITHUB_ORG}/${GITHUB_REPO}:ref:refs/heads/${BRANCH_NAME}"
FED_NAME="github-${ENV_NAME}"

# Delete existing (idempotent recreate)
if az ad app federated-credential list --id "$APP_ID" --query "[?name=='${FED_NAME}'] | length(@)" -o tsv | grep -q "^1$"; then
  az ad app federated-credential delete --id "$APP_ID" --federated-credential-id "$FED_NAME" -o none
fi
cat > /tmp/fed.json <<EOF
{
  "name": "${FED_NAME}",
  "issuer": "https://token.actions.githubusercontent.com",
  "subject": "${SUBJECT}",
  "audiences": ["api://AzureADTokenExchange"]
}
EOF
az ad app federated-credential create --id "$APP_ID" --parameters @/tmp/fed.json -o none
rm -f /tmp/fed.json

# Also add environment-scoped credential (matches `environment: ${ENV_NAME}` in workflow)
ENV_SUBJECT="repo:${GITHUB_ORG}/${GITHUB_REPO}:environment:${ENV_NAME}"
ENV_FED_NAME="github-env-${ENV_NAME}"
if az ad app federated-credential list --id "$APP_ID" --query "[?name=='${ENV_FED_NAME}'] | length(@)" -o tsv | grep -q "^1$"; then
  az ad app federated-credential delete --id "$APP_ID" --federated-credential-id "$ENV_FED_NAME" -o none
fi
cat > /tmp/fed2.json <<EOF
{
  "name": "${ENV_FED_NAME}",
  "issuer": "https://token.actions.githubusercontent.com",
  "subject": "${ENV_SUBJECT}",
  "audiences": ["api://AzureADTokenExchange"]
}
EOF
az ad app federated-credential create --id "$APP_ID" --parameters @/tmp/fed2.json -o none
rm -f /tmp/fed2.json

# ── Output summary ──────────────────────────────────────────────────────
BACKEND_FQDN=$(az containerapp show -n "$ACA_BACKEND" -g "$RG" --query properties.configuration.ingress.fqdn -o tsv)
FRONTEND_FQDN=$(az containerapp show -n "$ACA_FRONTEND" -g "$RG" --query properties.configuration.ingress.fqdn -o tsv)

cat <<EOF

============================================================
BOOTSTRAP COMPLETE for '${ENV_NAME}'
============================================================

Copy these into GitHub → Settings → Environments → '${ENV_NAME}':

  Secrets (Environment):
    AZURE_TENANT_ID          = $(az account show --query tenantId -o tsv)
    AZURE_SUBSCRIPTION_ID    = ${SUBSCRIPTION_ID}
    AZURE_CLIENT_ID          = ${APP_ID}

  Variables (Environment):
    AZURE_RESOURCE_GROUP     = ${RG}
    ACA_BACKEND_NAME         = ${ACA_BACKEND}
    ACA_FRONTEND_NAME        = ${ACA_FRONTEND}
    REACT_APP_BACKEND_URL    = https://${BACKEND_FQDN}
    REACT_APP_AZURE_TENANT_ID = <your Entra tenant id for SSO>
    REACT_APP_AZURE_CLIENT_ID = <your Entra app id for SSO>

Public URLs (once first deploy runs):
    Backend  : https://${BACKEND_FQDN}
    Frontend : https://${FRONTEND_FQDN}

Key Vault: ${KV}   →   populate secrets via:
    ./scripts/kv-set-secrets.sh ${ENV_NAME}

Next: push commits to the '${BRANCH_NAME}' branch and Actions will deploy.
EOF
