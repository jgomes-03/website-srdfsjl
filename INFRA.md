# Infrastructure & Deployment — SRDFSJL

Setup: **Azure Container Apps** + **GitHub Container Registry** + **Azure Key Vault** + **MongoDB Atlas**, orchestrated by **GitHub Actions** with **OIDC** (no long-lived secrets in GitHub).

```
┌──────────────┐  push dev/main   ┌──────────────────┐   OIDC   ┌───────────────┐
│   GitHub     │ ───────────────► │ GitHub Actions   │ ───────► │   Azure AD    │
└──────────────┘                  └──────────────────┘          └───────────────┘
                                          │                             │
                          build & push    │                             │ trust
                                          ▼                             ▼
                                    ┌────────────┐            ┌──────────────────┐
                                    │  ghcr.io   │            │   Container Apps │
                                    └────────────┘  pull ────►│  (dev / prod)    │
                                                              └────────┬─────────┘
                                                                       │ Managed
                                                                       │ Identity
                                                                       ▼
                                                              ┌──────────────────┐
                                                              │  Azure Key Vault │
                                                              └──────────────────┘
```

Two identical stacks are provisioned: `dev` and `prod`.

---

## 1. Prerequisites (one-time)

- Azure subscription — Owner or Contributor + User Access Administrator
- Azure CLI (`az`) locally, logged in: `az login`
- MongoDB Atlas cluster with **two databases** (`srdfsjl_dev`, `srdfsjl_prod`)
- A GitHub repository (this one) with permission to create Environments
- Cloudflare account managing your DNS zone

---

## 2. Bootstrap Azure resources

Edit the top of [`scripts/azure-bootstrap.sh`](scripts/azure-bootstrap.sh) and set:

```bash
GITHUB_ORG=your-github-user-or-org
GITHUB_REPO=your-repo-name
# LOCATION defaults to westeurope — change if needed
```

Then run it **once per environment**:

```bash
./scripts/azure-bootstrap.sh dev
./scripts/azure-bootstrap.sh prod
```

Each run creates: RG, Key Vault (RBAC), User-Assigned Managed Identity, Log Analytics, Container Apps Environment, placeholder Backend + Frontend Container Apps, and a GitHub OIDC federated credential (branch `dev` → dev env, `main` → prod env).

At the end it prints the values to paste into GitHub Environments.

---

## 3. Populate secrets in Key Vault

Copy the template and fill real values (never commit):

```bash
cp secrets.example.env secrets.dev.env
cp secrets.example.env secrets.prod.env
# edit both files
```

Push to Azure:

```bash
./scripts/kv-set-secrets.sh dev  ./secrets.dev.env
./scripts/kv-set-secrets.sh prod ./secrets.prod.env
```

Underscores in var names are converted to hyphens (Key Vault constraint), e.g. `MONGO_URL` → `MONGO-URL`. The backend's `config.py` handles the mapping transparently.

---

## 4. Configure GitHub

**Settings → Environments** — create two: `dev` and `prod`.

For each environment set the following (from the bootstrap output):

**Secrets:**
| Name | Value |
|------|-------|
| `AZURE_TENANT_ID` | Azure tenant id |
| `AZURE_SUBSCRIPTION_ID` | Subscription id |
| `AZURE_CLIENT_ID` | App id printed by the bootstrap script |

**Variables:**
| Name | Value |
|------|-------|
| `AZURE_RESOURCE_GROUP` | e.g. `rg-srdfsjl-dev` |
| `ACA_BACKEND_NAME` | e.g. `ca-srdfsjl-backend-dev` |
| `ACA_FRONTEND_NAME` | e.g. `ca-srdfsjl-frontend-dev` |
| `REACT_APP_BACKEND_URL` | Public backend URL (see next section) |
| `REACT_APP_AZURE_TENANT_ID` | Entra tenant id for SSO |
| `REACT_APP_AZURE_CLIENT_ID` | Entra app id for SSO |

For **prod**, in *Deployment protection rules* add required reviewers so PROD deploys require manual approval.

---

## 5. Cloudflare DNS

Point your desired hostnames to the Container Apps FQDNs printed by the bootstrap script.

Example:

| Type  | Name         | Content                                                     | Proxy |
|-------|--------------|-------------------------------------------------------------|-------|
| CNAME | `dev`        | `ca-srdfsjl-frontend-dev.<region>.azurecontainerapps.io`    | ✔     |
| CNAME | `api.dev`    | `ca-srdfsjl-backend-dev.<region>.azurecontainerapps.io`     | ✔     |
| CNAME | `www`        | `ca-srdfsjl-frontend-prod.<region>.azurecontainerapps.io`   | ✔     |
| CNAME | `api`        | `ca-srdfsjl-backend-prod.<region>.azurecontainerapps.io`    | ✔     |

Then bind the custom domain to each Container App (Azure Portal → Container App → Custom domains → Add) and Azure will issue a managed certificate (Cloudflare should be in **DNS only / grey cloud** for the initial ACME validation).

Update the `REACT_APP_BACKEND_URL` environment variable in GitHub after DNS is live (e.g. `https://api.dev.sociedadesaojoaodaslampas.pt`).

---

## 6. First deploy

```bash
git checkout dev
git push origin dev            # triggers .github/workflows/deploy-dev.yml
```

For prod:

```bash
git checkout main
git merge dev
git push origin main           # triggers deploy-prod.yml (requires approval)
```

You can also trigger runs manually from the Actions tab (workflow_dispatch).

---

## 7. Local development

Two supported modes:

**a) Native (existing)** — `.env` files under `backend/` and `frontend/` continue to work. `config.py` falls back to env vars when `AZURE_KEY_VAULT_URL` is not set.

**b) Docker locally** — build and run the exact production images:

```bash
docker compose up --build
# frontend at http://localhost:3000, backend at http://localhost:8001
```

If you want the local container to read from Key Vault too:

```bash
az login    # DefaultAzureCredential will pick up your user token
export AZURE_KEY_VAULT_URL=https://kv-srdfsjl-dev-xxxx.vault.azure.net/
docker compose up --build
```

---

## 8. How secrets flow at runtime

1. Container App starts with env vars `AZURE_KEY_VAULT_URL` and `AZURE_CLIENT_ID` (Managed Identity client id) injected by the bootstrap script.
2. Python `backend/config.py` runs on startup, calls `DefaultAzureCredential` which uses the Managed Identity.
3. Each mapped secret is fetched from Key Vault and cached in memory.
4. Application code uses `cfg_get("MONGO_URL")` / `cfg_require(...)` — never reads `.env` directly for those variables.
5. If Key Vault is unreachable, the loader logs an error and falls back to any OS env vars (safe for local dev).

To add a new secret:
1. Add its name to the `_SECRET_NAME_MAP` in `backend/config.py`
2. Push its value with `kv-set-secrets.sh`
3. Restart the Container App revision (or push a new deployment)

---

## 9. Rotating a compromised secret

```bash
# Rotate JWT_SECRET in dev, for example
az keyvault secret set --vault-name kv-srdfsjl-dev-xxxx --name JWT-SECRET --value "$(openssl rand -hex 32)"
az containerapp revision restart -n ca-srdfsjl-backend-dev -g rg-srdfsjl-dev
```

Existing user sessions will be invalidated on next request (JWT signature mismatch).

---

## 10. Troubleshooting

- **`403` on Key Vault** — verify the Managed Identity has the *Key Vault Secrets User* role assigned on the vault (bootstrap does this; check RBAC assignments if reprovisioning).
- **`OIDC` login fails from Actions** — ensure the federated credential's `subject` matches. The bootstrap creates both `ref:refs/heads/dev` (or `main`) and `environment:dev` (or `prod`) subjects; either matches.
- **Frontend shows old backend URL** — React embeds env vars at build time. Bump the `REACT_APP_BACKEND_URL` GitHub Variable and re-run the workflow.
- **`503` from Container App** — first deploy still on placeholder image. Re-run the workflow; ACA needs 30–60 s to pull the new image.

