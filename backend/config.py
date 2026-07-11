"""
Centralised configuration loader.

Precedence for each variable (highest → lowest):
  1. Value from Azure Key Vault (if AZURE_KEY_VAULT_URL is defined)
  2. Value from OS environment (populated by .env locally, or by ACA env vars)

In production (Azure Container Apps) we authenticate with a User-Assigned
Managed Identity via DefaultAzureCredential — no secrets in the container.

In development the loader silently skips Key Vault when AZURE_KEY_VAULT_URL
is not set, and reads from the local .env file.
"""

from __future__ import annotations

import logging
import os
from pathlib import Path
from typing import Optional

from dotenv import load_dotenv

logger = logging.getLogger("config")

# Load .env FIRST so AZURE_KEY_VAULT_URL and any local overrides are available.
_ROOT_DIR = Path(__file__).parent
load_dotenv(_ROOT_DIR / ".env")

KEY_VAULT_URL: Optional[str] = os.environ.get("AZURE_KEY_VAULT_URL") or None

# Secret names that live in Key Vault. Names cannot contain "_", so we map
# underscore-based env var names to hyphenated Key Vault secret names.
_SECRET_NAME_MAP = {
    "MONGO_URL": "MONGO-URL",
    "DB_NAME": "DB-NAME",
    "JWT_SECRET": "JWT-SECRET",
    "ADMIN_EMAIL": "ADMIN-EMAIL",
    "ADMIN_PASSWORD": "ADMIN-PASSWORD",
    "AZURE_TENANT_ID": "AZURE-TENANT-ID",
    "AZURE_CLIENT_ID": "AZURE-CLIENT-ID",
    "AZURE_CLIENT_SECRET": "AZURE-CLIENT-SECRET",
    "AZURE_REQUIRED_GROUP_ID": "AZURE-REQUIRED-GROUP-ID",
    "DATAVERSE_URL": "DATAVERSE-URL",
    "DATAVERSE_TABLE_NAME": "DATAVERSE-TABLE-NAME",
    "CORS_ORIGINS": "CORS-ORIGINS",
    "EMERGENT_LLM_KEY": "EMERGENT-LLM-KEY",
}

_cached_secrets: dict[str, str] = {}
_kv_loaded = False


def _load_from_key_vault() -> None:
    """Populate _cached_secrets from Azure Key Vault (best-effort)."""
    global _kv_loaded
    if _kv_loaded or not KEY_VAULT_URL:
        return
    try:
        # Import lazily so dev environments without azure libs still boot.
        from azure.identity import DefaultAzureCredential
        from azure.keyvault.secrets import SecretClient

        credential = DefaultAzureCredential(exclude_interactive_browser_credential=True)
        client = SecretClient(vault_url=KEY_VAULT_URL, credential=credential)
        for env_name, secret_name in _SECRET_NAME_MAP.items():
            try:
                secret = client.get_secret(secret_name)
                if secret.value is not None:
                    _cached_secrets[env_name] = secret.value
            except Exception as exc:  # noqa: BLE001
                # Missing secret is not fatal — env var fallback will apply.
                logger.debug("Key Vault miss for %s (%s): %s", env_name, secret_name, exc)
        logger.info(
            "Key Vault loaded: %d/%d secrets from %s",
            len(_cached_secrets),
            len(_SECRET_NAME_MAP),
            KEY_VAULT_URL,
        )
    except Exception as exc:  # noqa: BLE001
        # Do not crash the app if Key Vault is unreachable; fall back to env.
        logger.error("Key Vault load failed, using env vars only: %s", exc)
    finally:
        _kv_loaded = True


def get(name: str, default: Optional[str] = None) -> Optional[str]:
    """Fetch a configuration value. Key Vault wins over env, env over default."""
    if KEY_VAULT_URL and not _kv_loaded:
        _load_from_key_vault()
    if name in _cached_secrets:
        return _cached_secrets[name]
    return os.environ.get(name, default)


def require(name: str) -> str:
    """Same as get() but raises if the value is missing/empty."""
    value = get(name)
    if not value:
        raise RuntimeError(f"Required configuration '{name}' is not set")
    return value
