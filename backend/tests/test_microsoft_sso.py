"""
Backend tests for the Microsoft SSO login endpoint /api/auth/microsoft.

The backend decodes the idToken WITHOUT verifying signature (verify_signature=False),
so we can forge any JWT with HS256 and any random secret. The backend only reads
claims (preferred_username, name, tid, groups).

Also includes a quick regression check for /api/dataverse/socios (which depends on
AZURE_CLIENT_SECRET being valid).
"""
import os
import uuid

import jwt as pyjwt
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")

# Values expected by the backend
TENANT_ID = "14f905ae-d65a-49d7-8cff-54892cba6e7f"
REQUIRED_GROUP_ID = "442fb52b-5d77-4553-9f8e-3a99bf688403"
ALLOWED_DOMAIN = "sociedadesaojoaodaslampas.pt"

# Local bypass admin
ADMIN_EMAIL = "admin@srdfsjl.pt"
ADMIN_PASSWORD = "admin123"

# A unique QA email used across tests - cleaned up at the end
QA_TEST_EMAIL = f"qa.teste.{uuid.uuid4().hex[:6]}@{ALLOWED_DOMAIN}"


def _forge_id_token(email: str, tid: str = TENANT_ID, groups=None, name: str = "QA Teste") -> str:
    """Forge an idToken. Backend does NOT verify signature/aud/exp."""
    payload = {
        "preferred_username": email,
        "name": name,
        "tid": tid,
        "aud": "any-audience",
        "iss": f"https://login.microsoftonline.com/{tid}/v2.0",
    }
    if groups is not None:
        payload["groups"] = groups
    # Any secret works because signature is not verified
    return pyjwt.encode(payload, "any-secret", algorithm="HS256")


# ── Auth: Microsoft SSO ─────────────────────────────────────────────────

class TestMicrosoftSSO:
    """POST /api/auth/microsoft with forged idTokens"""

    def test_success_valid_domain_tenant_and_group(self):
        """Valid domain + tenant + group claim => 200, user created, cookies set."""
        token = _forge_id_token(QA_TEST_EMAIL, TENANT_ID, groups=[REQUIRED_GROUP_ID])
        session = requests.Session()
        r = session.post(
            f"{BASE_URL}/api/auth/microsoft",
            json={"id_token": token, "access_token": ""},
        )
        assert r.status_code == 200, f"Expected 200, got {r.status_code}: {r.text}"
        data = r.json()
        assert data["email"] == QA_TEST_EMAIL
        assert data["role"] == "admin"
        assert data["provider"] == "microsoft"
        assert "id" in data and isinstance(data["id"], str)
        assert "token" in data and len(data["token"]) > 20

        # Cookies must be set
        cookies = session.cookies.get_dict()
        assert "access_token" in cookies, f"access_token cookie missing. Cookies={cookies}"
        assert "refresh_token" in cookies, f"refresh_token cookie missing. Cookies={cookies}"

        # /auth/me should work with the cookie session
        me = session.get(f"{BASE_URL}/api/auth/me")
        assert me.status_code == 200
        me_data = me.json()
        assert me_data["email"] == QA_TEST_EMAIL

    def test_wrong_domain_rejected(self):
        """Non @sociedadesaojoaodaslampas.pt email => 403 with domain message."""
        token = _forge_id_token(
            f"someone.{uuid.uuid4().hex[:6]}@gmail.com",
            TENANT_ID,
            groups=[REQUIRED_GROUP_ID],
        )
        r = requests.post(
            f"{BASE_URL}/api/auth/microsoft",
            json={"id_token": token, "access_token": ""},
        )
        assert r.status_code == 403, f"Expected 403, got {r.status_code}: {r.text}"
        detail = r.json().get("detail", "").lower()
        assert ALLOWED_DOMAIN in detail or "apenas contas" in detail, f"Expected domain error, got: {detail}"

    def test_correct_domain_no_group_claim_rejected(self):
        """Valid domain but no groups claim => 403 (Graph fallback returns 403 by design)."""
        forged_email = f"nogroup.{uuid.uuid4().hex[:6]}@{ALLOWED_DOMAIN}"
        token = _forge_id_token(forged_email, TENANT_ID, groups=[])
        r = requests.post(
            f"{BASE_URL}/api/auth/microsoft",
            json={"id_token": token, "access_token": ""},
        )
        assert r.status_code == 403, f"Expected 403, got {r.status_code}: {r.text}"
        detail = r.json().get("detail", "").lower()
        assert "grupo" in detail or "group" in detail, f"Expected group error, got: {detail}"

    def test_correct_domain_wrong_group_id_rejected(self):
        """Valid domain but groups claim contains a different id => 403."""
        forged_email = f"othergroup.{uuid.uuid4().hex[:6]}@{ALLOWED_DOMAIN}"
        random_group = str(uuid.uuid4())
        token = _forge_id_token(forged_email, TENANT_ID, groups=[random_group])
        r = requests.post(
            f"{BASE_URL}/api/auth/microsoft",
            json={"id_token": token, "access_token": ""},
        )
        assert r.status_code == 403, f"Expected 403, got {r.status_code}: {r.text}"
        detail = r.json().get("detail", "").lower()
        assert "grupo" in detail or "group" in detail, f"Expected group error, got: {detail}"

    def test_wrong_tenant_rejected(self):
        """Wrong tid claim => 403 Tenant nao autorizado."""
        forged_email = f"wrongtid.{uuid.uuid4().hex[:6]}@{ALLOWED_DOMAIN}"
        bad_tid = "00000000-0000-0000-0000-000000000000"
        token = _forge_id_token(forged_email, bad_tid, groups=[REQUIRED_GROUP_ID])
        r = requests.post(
            f"{BASE_URL}/api/auth/microsoft",
            json={"id_token": token, "access_token": ""},
        )
        assert r.status_code == 403, f"Expected 403, got {r.status_code}: {r.text}"
        detail = r.json().get("detail", "").lower()
        assert "tenant" in detail, f"Expected tenant error, got: {detail}"

    def test_no_email_in_token_rejected(self):
        """idToken without any email claim => 401."""
        payload = {"tid": TENANT_ID, "name": "no email"}
        token = pyjwt.encode(payload, "any", algorithm="HS256")
        r = requests.post(
            f"{BASE_URL}/api/auth/microsoft",
            json={"id_token": token, "access_token": ""},
        )
        assert r.status_code == 401, f"Expected 401, got {r.status_code}: {r.text}"


# ── Bypass login regression ─────────────────────────────────────────────

class TestBypassLoginRegression:
    def test_bypass_login_and_me(self):
        session = requests.Session()
        r = session.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
        )
        assert r.status_code == 200
        assert session.cookies.get("access_token"), "access_token cookie not set on bypass login"
        me = session.get(f"{BASE_URL}/api/auth/me")
        assert me.status_code == 200
        assert me.json()["email"] == ADMIN_EMAIL


# ── Dataverse regression ────────────────────────────────────────────────

class TestDataverseRegression:
    """Confirm the new Azure client secret works: /api/dataverse/socios returns list."""

    @pytest.fixture
    def auth_headers(self):
        r = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
        )
        assert r.status_code == 200, "Bypass login failed - cannot test dataverse"
        return {"Authorization": f"Bearer {r.json()['token']}"}

    def test_get_dataverse_socios(self, auth_headers):
        r = requests.get(f"{BASE_URL}/api/dataverse/socios", headers=auth_headers, timeout=30)
        assert r.status_code == 200, f"Dataverse socios failed: {r.status_code} {r.text[:300]}"
        data = r.json()
        assert isinstance(data, list), f"Expected list, got {type(data)}"
        # Expected around 327 rows
        assert len(data) > 100, f"Expected > 100 socios, got {len(data)}"
        # Sanity: entries look like socios
        first = data[0]
        assert any(k.startswith("cr56f_") for k in first.keys()), (
            f"Row does not look like a socio: keys={list(first.keys())[:10]}"
        )
        print(f"Dataverse returned {len(data)} socios")

    def test_dataverse_status(self, auth_headers):
        r = requests.get(f"{BASE_URL}/api/dataverse/status", headers=auth_headers, timeout=30)
        assert r.status_code == 200
        data = r.json()
        assert data.get("configured") is True, f"Dataverse status: {data}"


# ── Cleanup fixture ─────────────────────────────────────────────────────

@pytest.fixture(scope="module", autouse=True)
def cleanup_qa_user():
    """After the module runs, delete the QA test user from MongoDB directly."""
    yield
    try:
        from pymongo import MongoClient
        mongo_url = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
        db_name = os.environ.get("DB_NAME", "test_database")
        cli = MongoClient(mongo_url)
        cli[db_name].users.delete_many({"email": {"$regex": r"^(qa\.teste|nogroup|othergroup|wrongtid)\."}})
        cli.close()
    except Exception as e:
        print(f"Cleanup warning: {e}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
