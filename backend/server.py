from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

from fastapi import FastAPI, APIRouter, HTTPException, Request, Response
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
import os
import logging
import bcrypt
import jwt as pyjwt
import uuid
import secrets
import httpx
from datetime import datetime, timezone, timedelta
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

JWT_SECRET = os.environ.get('JWT_SECRET', secrets.token_hex(32))
JWT_ALGORITHM = "HS256"

app = FastAPI()
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ── Helpers ──────────────────────────────────────────────────────────────
def hash_password(pw: str) -> str:
    return bcrypt.hashpw(pw.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))

def create_access_token(uid: str, email: str, provider: str = "local") -> str:
    return pyjwt.encode({"sub": uid, "email": email, "exp": datetime.now(timezone.utc) + timedelta(minutes=60), "type": "access", "provider": provider}, JWT_SECRET, algorithm=JWT_ALGORITHM)

def create_refresh_token(uid: str) -> str:
    return pyjwt.encode({"sub": uid, "exp": datetime.now(timezone.utc) + timedelta(days=7), "type": "refresh"}, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth = request.headers.get("Authorization", "")
        if auth.startswith("Bearer "):
            token = auth[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = pyjwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        user["_id"] = str(user["_id"])
        user.pop("password_hash", None)
        return user
    except pyjwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except pyjwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def require_admin(request: Request) -> dict:
    user = await get_current_user(request)
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    return user

# ── Models ───────────────────────────────────────────────────────────────
class LoginRequest(BaseModel):
    email: str
    password: str

class EventCreate(BaseModel):
    title: str
    description: str
    date: str
    time: Optional[str] = ""
    location: Optional[str] = ""
    price: Optional[str] = ""
    image_url: Optional[str] = ""

class EventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    date: Optional[str] = None
    time: Optional[str] = None
    location: Optional[str] = None
    price: Optional[str] = None
    image_url: Optional[str] = None

class ServiceCreate(BaseModel):
    title: str
    tag: str
    description: str
    image_url: Optional[str] = ""
    note: Optional[str] = ""
    order: Optional[int] = 0

class ServiceUpdate(BaseModel):
    title: Optional[str] = None
    tag: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    note: Optional[str] = None
    order: Optional[int] = None

class TimelineCreate(BaseModel):
    year: str
    title: str
    description: str
    order: Optional[int] = 0

class TimelineUpdate(BaseModel):
    year: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    order: Optional[int] = None

class SiteSettingsUpdate(BaseModel):
    society_name: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    founding_year: Optional[int] = None
    facebook_url: Optional[str] = None
    instagram_url: Optional[str] = None

class HomepageContentUpdate(BaseModel):
    hero_title: Optional[str] = None
    hero_subtitle: Optional[str] = None
    hero_badge: Optional[str] = None
    about_label: Optional[str] = None
    about_title: Optional[str] = None
    about_text: Optional[str] = None
    stats: Optional[List[Dict[str, Any]]] = None

class MemberRegister(BaseModel):
    full_name: str
    email: str
    phone: str
    address: Optional[str] = ""
    birth_date: Optional[str] = ""
    message: Optional[str] = ""

class ContactMessage(BaseModel):
    name: str
    email: str
    subject: Optional[str] = ""
    message: str

class MicrosoftLoginRequest(BaseModel):
    access_token: str

# ── Azure AD / Dataverse Config ──────────────────────────────────────────
AZURE_TENANT_ID = os.environ.get("AZURE_TENANT_ID", "")
AZURE_CLIENT_ID = os.environ.get("AZURE_CLIENT_ID", "")
AZURE_CLIENT_SECRET = os.environ.get("AZURE_CLIENT_SECRET", "")
DATAVERSE_URL = os.environ.get("DATAVERSE_URL", "")
DATAVERSE_TABLE = os.environ.get("DATAVERSE_TABLE_NAME", "cr_socios")

_dataverse_token_cache = {"token": None, "expires": None}

async def get_dataverse_token() -> str:
    """Get Dataverse access token via client credentials flow."""
    now = datetime.now(timezone.utc)
    if _dataverse_token_cache["token"] and _dataverse_token_cache["expires"] and _dataverse_token_cache["expires"] > now:
        return _dataverse_token_cache["token"]
    if not AZURE_TENANT_ID or not AZURE_CLIENT_ID or not AZURE_CLIENT_SECRET or not DATAVERSE_URL:
        raise HTTPException(status_code=503, detail="Azure/Dataverse not configured")
    async with httpx.AsyncClient() as client:
        r = await client.post(
            f"https://login.microsoftonline.com/{AZURE_TENANT_ID}/oauth2/v2.0/token",
            data={"grant_type": "client_credentials", "client_id": AZURE_CLIENT_ID, "client_secret": AZURE_CLIENT_SECRET, "scope": f"{DATAVERSE_URL}/.default"},
            timeout=15,
        )
        if r.status_code != 200:
            logger.error(f"Dataverse token error: {r.text}")
            raise HTTPException(status_code=502, detail="Failed to get Dataverse token")
        data = r.json()
        _dataverse_token_cache["token"] = data["access_token"]
        _dataverse_token_cache["expires"] = now + timedelta(seconds=data.get("expires_in", 3600) - 300)
        return data["access_token"]

async def dataverse_request(method: str, endpoint: str, json_data=None) -> dict:
    """Make authenticated request to Dataverse Web API."""
    token = await get_dataverse_token()
    url = f"{DATAVERSE_URL}/api/data/v9.2/{endpoint}"
    headers = {"Authorization": f"Bearer {token}", "OData-MaxVersion": "4.0", "OData-Version": "4.0", "Content-Type": "application/json", "Prefer": "return=representation"}
    async with httpx.AsyncClient() as client:
        r = await client.request(method, url, headers=headers, json=json_data, timeout=30)
        if r.status_code >= 400:
            logger.error(f"Dataverse {method} {endpoint}: {r.status_code} {r.text[:500]}")
            raise HTTPException(status_code=r.status_code, detail=f"Dataverse error: {r.text[:200]}")
        if r.status_code == 204:
            location = r.headers.get("OData-EntityId", "")
            return {"_created_id": location.split("(")[-1].rstrip(")") if "(" in location else ""}
        return r.json() if r.text else {}

# ── Auth ─────────────────────────────────────────────────────────────────
@api_router.post("/auth/microsoft")
async def microsoft_login(request: Request, response: Response, body: MicrosoftLoginRequest):
    """Validate Microsoft token, restrict to allowed domain, create/find user, issue JWT."""
    try:
        # Decode the Microsoft ID token (we trust Azure AD's signature for now)
        claims = pyjwt.decode(body.access_token, options={"verify_signature": False, "verify_aud": False})
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid Microsoft token")

    email = (claims.get("preferred_username") or claims.get("upn") or claims.get("email") or "").lower().strip()
    name = claims.get("name", "")
    tid = claims.get("tid", "")

    # Validate tenant if configured
    if AZURE_TENANT_ID and tid != AZURE_TENANT_ID:
        raise HTTPException(status_code=403, detail="Tenant nao autorizado")

    # Validate domain
    allowed_domain = "sociedadesaojoaodaslampas.pt"
    if not email.endswith(f"@{allowed_domain}"):
        raise HTTPException(status_code=403, detail=f"Apenas contas @{allowed_domain} sao permitidas")

    # Find or create user in MongoDB
    user = await db.users.find_one({"email": email})
    if not user:
        insert_result = await db.users.insert_one({
            "email": email, "name": name, "role": "admin", "provider": "microsoft",
            "password_hash": "", "created_at": datetime.now(timezone.utc).isoformat(),
        })
        user = await db.users.find_one({"_id": insert_result.inserted_id})

    uid = str(user["_id"])
    at = create_access_token(uid, email, provider="microsoft")
    rt = create_refresh_token(uid)
    response.set_cookie(key="access_token", value=at, httponly=True, secure=False, samesite="lax", max_age=3600, path="/")
    response.set_cookie(key="refresh_token", value=rt, httponly=True, secure=False, samesite="lax", max_age=604800, path="/")
    return {"id": uid, "email": email, "name": name, "role": user.get("role", "admin"), "provider": "microsoft", "token": at}

@api_router.post("/auth/login")
async def login(request: Request, response: Response, body: LoginRequest):
    email = body.email.lower().strip()
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(body.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    uid = str(user["_id"])
    at = create_access_token(uid, email)
    rt = create_refresh_token(uid)
    response.set_cookie(key="access_token", value=at, httponly=True, secure=False, samesite="lax", max_age=3600, path="/")
    response.set_cookie(key="refresh_token", value=rt, httponly=True, secure=False, samesite="lax", max_age=604800, path="/")
    return {"id": uid, "email": user["email"], "name": user.get("name", ""), "role": user.get("role", "user"), "token": at}

@api_router.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    response.delete_cookie("refresh_token", path="/")
    return {"message": "Logged out"}

@api_router.get("/auth/me")
async def get_me(request: Request):
    return await get_current_user(request)

# ── Dashboard Stats ──────────────────────────────────────────────────────
@api_router.get("/admin/stats")
async def get_admin_stats(request: Request):
    await require_admin(request)
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    events_total = await db.events.count_documents({})
    events_upcoming = await db.events.count_documents({"date": {"$gte": today}})
    members_total = await db.members.count_documents({})
    members_pending = await db.members.count_documents({"status": "pending"})
    messages_total = await db.contacts.count_documents({})
    messages_unread = await db.contacts.count_documents({"read": False})
    services_total = await db.services.count_documents({})
    return {
        "events": {"total": events_total, "upcoming": events_upcoming},
        "members": {"total": members_total, "pending": members_pending},
        "messages": {"total": messages_total, "unread": messages_unread},
        "services": {"total": services_total},
    }

# ── Events ───────────────────────────────────────────────────────────────
@api_router.get("/events")
async def get_events():
    return await db.events.find({}, {"_id": 0}).sort("date", -1).to_list(100)

@api_router.get("/events/upcoming")
async def get_upcoming_events():
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    return await db.events.find({"date": {"$gte": today}}, {"_id": 0}).sort("date", 1).to_list(10)

@api_router.post("/events")
async def create_event(request: Request, body: EventCreate):
    await require_admin(request)
    doc = {"id": str(uuid.uuid4()), **body.model_dump(), "created_at": datetime.now(timezone.utc).isoformat()}
    await db.events.insert_one(doc)
    doc.pop("_id", None)
    return doc

@api_router.put("/events/{event_id}")
async def update_event(event_id: str, request: Request, body: EventUpdate):
    await require_admin(request)
    data = {k: v for k, v in body.model_dump().items() if v is not None}
    if not data:
        raise HTTPException(status_code=400, detail="No fields to update")
    result = await db.events.update_one({"id": event_id}, {"$set": data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Event not found")
    return await db.events.find_one({"id": event_id}, {"_id": 0})

@api_router.delete("/events/{event_id}")
async def delete_event(event_id: str, request: Request):
    await require_admin(request)
    result = await db.events.delete_one({"id": event_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Event not found")
    return {"message": "Deleted"}

# ── Services ─────────────────────────────────────────────────────────────
@api_router.get("/services")
async def get_services():
    return await db.services.find({}, {"_id": 0}).sort("order", 1).to_list(50)

@api_router.post("/services")
async def create_service(request: Request, body: ServiceCreate):
    await require_admin(request)
    doc = {"id": str(uuid.uuid4()), **body.model_dump(), "created_at": datetime.now(timezone.utc).isoformat()}
    await db.services.insert_one(doc)
    doc.pop("_id", None)
    return doc

@api_router.put("/services/{service_id}")
async def update_service(service_id: str, request: Request, body: ServiceUpdate):
    await require_admin(request)
    data = {k: v for k, v in body.model_dump().items() if v is not None}
    if not data:
        raise HTTPException(status_code=400, detail="No fields")
    result = await db.services.update_one({"id": service_id}, {"$set": data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Not found")
    return await db.services.find_one({"id": service_id}, {"_id": 0})

@api_router.delete("/services/{service_id}")
async def delete_service(service_id: str, request: Request):
    await require_admin(request)
    result = await db.services.delete_one({"id": service_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Not found")
    return {"message": "Deleted"}

# ── Timeline ─────────────────────────────────────────────────────────────
@api_router.get("/timeline")
async def get_timeline():
    return await db.timeline.find({}, {"_id": 0}).sort("order", 1).to_list(50)

@api_router.post("/timeline")
async def create_timeline(request: Request, body: TimelineCreate):
    await require_admin(request)
    doc = {"id": str(uuid.uuid4()), **body.model_dump(), "created_at": datetime.now(timezone.utc).isoformat()}
    await db.timeline.insert_one(doc)
    doc.pop("_id", None)
    return doc

@api_router.put("/timeline/{item_id}")
async def update_timeline(item_id: str, request: Request, body: TimelineUpdate):
    await require_admin(request)
    data = {k: v for k, v in body.model_dump().items() if v is not None}
    if not data:
        raise HTTPException(status_code=400, detail="No fields")
    result = await db.timeline.update_one({"id": item_id}, {"$set": data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Not found")
    return await db.timeline.find_one({"id": item_id}, {"_id": 0})

@api_router.delete("/timeline/{item_id}")
async def delete_timeline(item_id: str, request: Request):
    await require_admin(request)
    result = await db.timeline.delete_one({"id": item_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Not found")
    return {"message": "Deleted"}

# ── Site Settings ────────────────────────────────────────────────────────
@api_router.get("/settings")
async def get_settings():
    doc = await db.settings.find_one({"_key": "site"}, {"_id": 0, "_key": 0})
    return doc or {}

@api_router.put("/settings")
async def update_settings(request: Request, body: SiteSettingsUpdate):
    await require_admin(request)
    data = {k: v for k, v in body.model_dump().items() if v is not None}
    if not data:
        raise HTTPException(status_code=400, detail="No fields")
    await db.settings.update_one({"_key": "site"}, {"$set": data}, upsert=True)
    doc = await db.settings.find_one({"_key": "site"}, {"_id": 0, "_key": 0})
    return doc

# ── Homepage Content ─────────────────────────────────────────────────────
@api_router.get("/content/homepage")
async def get_homepage_content():
    doc = await db.content.find_one({"_key": "homepage"}, {"_id": 0, "_key": 0})
    return doc or {}

@api_router.put("/content/homepage")
async def update_homepage_content(request: Request, body: HomepageContentUpdate):
    await require_admin(request)
    data = {k: v for k, v in body.model_dump().items() if v is not None}
    if not data:
        raise HTTPException(status_code=400, detail="No fields")
    await db.content.update_one({"_key": "homepage"}, {"$set": data}, upsert=True)
    doc = await db.content.find_one({"_key": "homepage"}, {"_id": 0, "_key": 0})
    return doc

# ── Members ──────────────────────────────────────────────────────────────
@api_router.post("/members")
async def register_member(body: MemberRegister):
    existing = await db.members.find_one({"email": body.email.lower().strip()})
    if existing:
        raise HTTPException(status_code=400, detail="Este email ja esta registado")
    doc = {"id": str(uuid.uuid4()), **body.model_dump(), "email": body.email.lower().strip(), "status": "pending", "created_at": datetime.now(timezone.utc).isoformat()}
    await db.members.insert_one(doc)
    doc.pop("_id", None)
    return {"message": "Inscricao enviada com sucesso!", "member": doc}

@api_router.get("/members")
async def get_members(request: Request):
    await require_admin(request)
    return await db.members.find({}, {"_id": 0}).sort("created_at", -1).to_list(200)

@api_router.put("/members/{member_id}/status")
async def update_member_status(member_id: str, request: Request):
    await require_admin(request)
    body = await request.json()
    status = body.get("status")
    if status not in ("pending", "approved", "rejected"):
        raise HTTPException(status_code=400, detail="Invalid status")
    result = await db.members.update_one({"id": member_id}, {"$set": {"status": status}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Not found")
    return {"message": "Updated"}

# ── Contact ──────────────────────────────────────────────────────────────
@api_router.post("/contact")
async def send_contact(body: ContactMessage):
    doc = {"id": str(uuid.uuid4()), **body.model_dump(), "read": False, "replied": False, "created_at": datetime.now(timezone.utc).isoformat()}
    await db.contacts.insert_one(doc)
    doc.pop("_id", None)
    return {"message": "Mensagem enviada com sucesso!"}

@api_router.get("/contacts")
async def get_contacts(request: Request):
    await require_admin(request)
    return await db.contacts.find({}, {"_id": 0}).sort("created_at", -1).to_list(200)

@api_router.put("/contacts/{msg_id}")
async def update_contact(msg_id: str, request: Request):
    await require_admin(request)
    body = await request.json()
    data = {}
    if "read" in body:
        data["read"] = bool(body["read"])
    if "replied" in body:
        data["replied"] = bool(body["replied"])
    if not data:
        raise HTTPException(status_code=400, detail="No fields")
    result = await db.contacts.update_one({"id": msg_id}, {"$set": data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Not found")
    return {"message": "Updated"}

@api_router.delete("/contacts/{msg_id}")
async def delete_contact(msg_id: str, request: Request):
    await require_admin(request)
    result = await db.contacts.delete_one({"id": msg_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Not found")
    return {"message": "Deleted"}

# ── Dataverse Socios ─────────────────────────────────────────────────────
@api_router.get("/dataverse/socios")
async def get_dataverse_socios(request: Request):
    await require_admin(request)
    result = await dataverse_request("GET", f"{DATAVERSE_TABLE}?$top=500&$orderby=createdon desc")
    return result.get("value", [])

@api_router.post("/dataverse/socios")
async def create_dataverse_socio(request: Request):
    await require_admin(request)
    body = await request.json()
    result = await dataverse_request("POST", DATAVERSE_TABLE, json_data=body)
    return result

@api_router.put("/dataverse/socios/{record_id}")
async def update_dataverse_socio(record_id: str, request: Request):
    await require_admin(request)
    body = await request.json()
    result = await dataverse_request("PATCH", f"{DATAVERSE_TABLE}({record_id})", json_data=body)
    return result

@api_router.get("/dataverse/status")
async def dataverse_status(request: Request):
    """Check if Dataverse is configured and reachable."""
    await require_admin(request)
    if not DATAVERSE_URL or not AZURE_CLIENT_ID or not AZURE_CLIENT_SECRET:
        return {"configured": False, "message": "Dataverse nao configurado. Defina AZURE_CLIENT_ID, AZURE_CLIENT_SECRET e DATAVERSE_URL no .env"}
    try:
        await get_dataverse_token()
        return {"configured": True, "message": "Dataverse conectado"}
    except Exception as e:
        return {"configured": False, "message": f"Erro de conexao: {str(e)}"}

# ── Dataverse Payments ───────────────────────────────────────────────────
@api_router.get("/dataverse/payments")
async def get_dataverse_payments(request: Request, membershipid: str = ""):
    await require_admin(request)
    if membershipid:
        result = await dataverse_request("GET", f"cr56f_paymentsrecords?$filter=cr56f_membershipid eq '{membershipid}'&$orderby=cr56f_membershipyear desc")
    else:
        result = await dataverse_request("GET", "cr56f_paymentsrecords?$top=500&$orderby=cr56f_membershipyear desc")
    return result.get("value", [])

@api_router.post("/dataverse/payments")
async def create_dataverse_payment(request: Request):
    await require_admin(request)
    body = await request.json()
    result = await dataverse_request("POST", "cr56f_paymentsrecords", json_data=body)
    return result

@api_router.put("/dataverse/payments/{record_id}")
async def update_dataverse_payment(record_id: str, request: Request):
    await require_admin(request)
    body = await request.json()
    result = await dataverse_request("PATCH", f"cr56f_paymentsrecords({record_id})", json_data=body)
    return result

@api_router.delete("/dataverse/payments/{record_id}")
async def delete_dataverse_payment(record_id: str, request: Request):
    await require_admin(request)
    result = await dataverse_request("DELETE", f"cr56f_paymentsrecords({record_id})")
    return {"message": "Deleted"}

# ── Health ───────────────────────────────────────────────────────────────
@api_router.get("/")
async def root():
    return {"message": "SRDFSJL API is running"}

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Startup ──────────────────────────────────────────────────────────────
@app.on_event("startup")
async def startup():
    await db.users.create_index("email", unique=True)
    await db.events.create_index("date")
    await db.members.create_index("email", unique=True)

    # Seed admin
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@srdfsjl.pt")
    admin_password = os.environ.get("ADMIN_PASSWORD", "admin123")
    existing = await db.users.find_one({"email": admin_email})
    if existing is None:
        await db.users.insert_one({"email": admin_email, "password_hash": hash_password(admin_password), "name": "Administrador", "role": "admin", "created_at": datetime.now(timezone.utc).isoformat()})
        logger.info(f"Admin seeded: {admin_email}")
    elif not verify_password(admin_password, existing["password_hash"]):
        await db.users.update_one({"email": admin_email}, {"$set": {"password_hash": hash_password(admin_password)}})

    # Seed default settings
    if not await db.settings.find_one({"_key": "site"}):
        await db.settings.insert_one({"_key": "site", "society_name": "Sociedade Recreativa Desportiva e Familiar de Sao Joao das Lampas", "address": "Avenida Central 24", "city": "S. Joao das Lampas, Sintra", "email": "geral@sociedadesaojoaodaslampas.pt", "phone": "", "founding_year": 1911, "facebook_url": "", "instagram_url": ""})

    # Seed default homepage content
    if not await db.content.find_one({"_key": "homepage"}):
        await db.content.insert_one({"_key": "homepage", "hero_title": "Sociedade Recreativa Desportiva e Familiar de Sao Joao das Lampas", "hero_subtitle": "Cultura, desporto, teatro e convivio. Mais de 114 anos ao servico da nossa comunidade.", "hero_badge": "Desde 1911 — S. Joao das Lampas", "about_label": "Quem somos", "about_title": "O coracao de Sao Joao das Lampas", "about_text": "Ha mais de um seculo, a SRDFSJL e o ponto de encontro da nossa comunidade. Um espaco onde se vive o desporto, a cultura e a tradicao.", "stats": [{"val": 1911, "label": "Fundacao", "suffix": ""}, {"val": 114, "label": "Anos", "suffix": ""}, {"val": 500, "label": "Socios", "suffix": "+"}, {"val": 50, "label": "Eventos/Ano", "suffix": "+"}]})

    # Seed services
    if await db.services.count_documents({}) == 0:
        await db.services.insert_many([
            {"id": str(uuid.uuid4()), "title": "Grupo de Teatro", "tag": "Cultura", "description": "O nosso grupo de teatro amador e uma das atividades mais emblematicas. Com pecas originais, os nossos atores levam ao palco historias que fazem rir e emocionar.", "image_url": "https://images.pexels.com/photos/19658083/pexels-photo-19658083.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940", "note": "Proxima peca: Que Grande Mixordia", "order": 0, "created_at": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "title": "Atividades Desportivas", "tag": "Desporto", "description": "Torneios de futebol de salao, caminhadas, ginastica e muito mais. O desporto e parte fundamental da nossa missao comunitaria.", "image_url": "https://images.unsplash.com/photo-1771909719482-4f95e62f41a7?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA3MDB8MHwxfHNlYXJjaHwyfHxpbmRvb3IlMjBzcG9ydHMlMjBoYWxsfGVufDB8fHx8MTc3ODM1MzM5Mnww&ixlib=rb-4.1.0&q=85", "note": "Torneios anuais abertos a todos", "order": 1, "created_at": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "title": "Aluguer de Salao", "tag": "Eventos", "description": "O nosso salao esta disponivel para festas, casamentos, batizados e outros eventos. Um espaco versatil no coracao de S. Joao das Lampas.", "image_url": "https://images.unsplash.com/photo-1778086170602-f40da010e5fb?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMjV8MHwxfHNlYXJjaHwyfHxjb21tdW5pdHklMjBnYXRoZXJpbmclMjBoYWxsfGVufDB8fHx8MTc3ODM1MzM5Nnww&ixlib=rb-4.1.0&q=85", "note": "Contacte-nos para reservas", "order": 2, "created_at": datetime.now(timezone.utc).isoformat()},
        ])

    # Seed timeline
    if await db.timeline.count_documents({}) == 0:
        items = [
            {"year": "1911", "title": "Fundacao", "description": "A Sociedade Recreativa Desportiva e Familiar de S. Joao das Lampas e fundada a 29 de Julho de 1911.", "order": 0},
            {"year": "1920s", "title": "Primeiras Atividades", "description": "Inicio das atividades desportivas e culturais, tornando-se o centro de convivio da comunidade.", "order": 1},
            {"year": "1950s", "title": "Expansao", "description": "Construcao do salao de festas e novas instalacoes para a pratica desportiva.", "order": 2},
            {"year": "1970s", "title": "Grupo de Teatro", "description": "Criacao do grupo de teatro amador, uma das atividades mais emblematicas da sociedade.", "order": 3},
            {"year": "1990s", "title": "Modernizacao", "description": "Obras de renovacao e diversificacao das atividades oferecidas.", "order": 4},
            {"year": "2011", "title": "Centenario", "description": "Celebracao dos 100 anos com eventos especiais e homenagens aos fundadores.", "order": 5},
            {"year": "Hoje", "title": "Ao Servico da Comunidade", "description": "Continuamos a servir S. Joao das Lampas com cultura, desporto e recreacao.", "order": 6},
        ]
        for it in items:
            it["id"] = str(uuid.uuid4())
            it["created_at"] = datetime.now(timezone.utc).isoformat()
        await db.timeline.insert_many(items)

    # Seed events if empty
    if await db.events.count_documents({}) == 0:
        await db.events.insert_many([
            {"id": str(uuid.uuid4()), "title": "Festa de Sao Joao", "description": "Celebracao tradicional com musica ao vivo, arraial e fogo de artificio.", "date": "2026-06-24", "time": "19:00", "location": "Sede da SRDFSJL", "price": "Entrada livre", "image_url": "", "created_at": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "title": "Peca de Teatro - Que Grande Mixordia", "description": "O grupo de teatro apresenta 'Que Grande Mixordia' - uma revista a portuguesa... mas saloia!", "date": "2026-07-15", "time": "21:30", "location": "Salao da SRDFSJL", "price": "12 euros", "image_url": "", "created_at": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "title": "Torneio de Futebol de Salao", "description": "Torneio aberto a todos os socios e amigos.", "date": "2026-08-20", "time": "10:00", "location": "Campo da SRDFSJL", "price": "5 euros por equipa", "image_url": "", "created_at": datetime.now(timezone.utc).isoformat()},
        ])

    logger.info("SRDFSJL API started successfully")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
