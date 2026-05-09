from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, UploadFile, File
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
import os
import logging
import bcrypt
import jwt
import uuid
import secrets
from datetime import datetime, timezone, timedelta
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT config
JWT_SECRET = os.environ.get('JWT_SECRET', secrets.token_hex(32))
JWT_ALGORITHM = "HS256"

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# --- Password Helpers ---
def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))

# --- JWT Helpers ---
def create_access_token(user_id: str, email: str) -> str:
    payload = {"sub": user_id, "email": email, "exp": datetime.now(timezone.utc) + timedelta(minutes=60), "type": "access"}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def create_refresh_token(user_id: str) -> str:
    payload = {"sub": user_id, "exp": datetime.now(timezone.utc) + timedelta(days=7), "type": "refresh"}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

# --- Auth Helper ---
async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        user["_id"] = str(user["_id"])
        user.pop("password_hash", None)
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# --- Pydantic Models ---
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

class GalleryItemCreate(BaseModel):
    title: str
    image_url: str
    description: Optional[str] = ""
    category: Optional[str] = ""

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

# --- Auth Endpoints ---
@api_router.post("/auth/login")
async def login(request: Request, response: Response, body: LoginRequest):
    email = body.email.lower().strip()
    user = await db.users.find_one({"email": email})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if not verify_password(body.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    user_id = str(user["_id"])
    access_token = create_access_token(user_id, email)
    refresh_token = create_refresh_token(user_id)
    response.set_cookie(key="access_token", value=access_token, httponly=True, secure=False, samesite="lax", max_age=3600, path="/")
    response.set_cookie(key="refresh_token", value=refresh_token, httponly=True, secure=False, samesite="lax", max_age=604800, path="/")
    return {"id": user_id, "email": user["email"], "name": user.get("name", ""), "role": user.get("role", "user"), "token": access_token}

@api_router.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    response.delete_cookie("refresh_token", path="/")
    return {"message": "Logged out"}

@api_router.get("/auth/me")
async def get_me(request: Request):
    user = await get_current_user(request)
    return user

# --- Events Endpoints ---
@api_router.get("/events")
async def get_events():
    events = await db.events.find({}, {"_id": 0}).sort("date", -1).to_list(100)
    return events

@api_router.get("/events/upcoming")
async def get_upcoming_events():
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    events = await db.events.find({"date": {"$gte": today}}, {"_id": 0}).sort("date", 1).to_list(10)
    return events

@api_router.post("/events")
async def create_event(request: Request, body: EventCreate):
    user = await get_current_user(request)
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    event_id = str(uuid.uuid4())
    doc = {
        "id": event_id,
        "title": body.title,
        "description": body.description,
        "date": body.date,
        "time": body.time or "",
        "location": body.location or "",
        "price": body.price or "",
        "image_url": body.image_url or "",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.events.insert_one(doc)
    doc.pop("_id", None)
    return doc

@api_router.put("/events/{event_id}")
async def update_event(event_id: str, request: Request, body: EventUpdate):
    user = await get_current_user(request)
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    update_data = {k: v for k, v in body.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    result = await db.events.update_one({"id": event_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Event not found")
    updated = await db.events.find_one({"id": event_id}, {"_id": 0})
    return updated

@api_router.delete("/events/{event_id}")
async def delete_event(event_id: str, request: Request):
    user = await get_current_user(request)
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    result = await db.events.delete_one({"id": event_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Event not found")
    return {"message": "Event deleted"}

# --- Gallery Endpoints ---
@api_router.get("/gallery")
async def get_gallery():
    items = await db.gallery.find({}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return items

@api_router.post("/gallery")
async def add_gallery_item(request: Request, body: GalleryItemCreate):
    user = await get_current_user(request)
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    item_id = str(uuid.uuid4())
    doc = {
        "id": item_id,
        "title": body.title,
        "image_url": body.image_url,
        "description": body.description or "",
        "category": body.category or "",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.gallery.insert_one(doc)
    doc.pop("_id", None)
    return doc

@api_router.delete("/gallery/{item_id}")
async def delete_gallery_item(item_id: str, request: Request):
    user = await get_current_user(request)
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    result = await db.gallery.delete_one({"id": item_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Gallery item not found")
    return {"message": "Gallery item deleted"}

# --- Member Registration ---
@api_router.post("/members")
async def register_member(body: MemberRegister):
    existing = await db.members.find_one({"email": body.email.lower().strip()})
    if existing:
        raise HTTPException(status_code=400, detail="Este email já está registado")
    member_id = str(uuid.uuid4())
    doc = {
        "id": member_id,
        "full_name": body.full_name,
        "email": body.email.lower().strip(),
        "phone": body.phone,
        "address": body.address or "",
        "birth_date": body.birth_date or "",
        "message": body.message or "",
        "status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.members.insert_one(doc)
    doc.pop("_id", None)
    return {"message": "Inscrição enviada com sucesso!", "member": doc}

@api_router.get("/members")
async def get_members(request: Request):
    user = await get_current_user(request)
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    members = await db.members.find({}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return members

# --- Contact ---
@api_router.post("/contact")
async def send_contact(body: ContactMessage):
    msg_id = str(uuid.uuid4())
    doc = {
        "id": msg_id,
        "name": body.name,
        "email": body.email,
        "subject": body.subject or "",
        "message": body.message,
        "read": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.contacts.insert_one(doc)
    doc.pop("_id", None)
    return {"message": "Mensagem enviada com sucesso!"}

@api_router.get("/contacts")
async def get_contacts(request: Request):
    user = await get_current_user(request)
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    contacts = await db.contacts.find({}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return contacts

# --- Health ---
@api_router.get("/")
async def root():
    return {"message": "SRDFSIL API is running"}

# Include router
app.include_router(api_router)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup - seed admin + indexes
@app.on_event("startup")
async def startup():
    # Create indexes
    await db.users.create_index("email", unique=True)
    await db.events.create_index("date")
    await db.members.create_index("email", unique=True)

    # Seed admin
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@srdfsil.pt")
    admin_password = os.environ.get("ADMIN_PASSWORD", "admin123")
    existing = await db.users.find_one({"email": admin_email})
    if existing is None:
        hashed = hash_password(admin_password)
        await db.users.insert_one({
            "email": admin_email,
            "password_hash": hashed,
            "name": "Administrador",
            "role": "admin",
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        logger.info(f"Admin user seeded: {admin_email}")
    elif not verify_password(admin_password, existing["password_hash"]):
        await db.users.update_one(
            {"email": admin_email},
            {"$set": {"password_hash": hash_password(admin_password)}}
        )
        logger.info(f"Admin password updated: {admin_email}")

    # Seed sample events
    event_count = await db.events.count_documents({})
    if event_count == 0:
        sample_events = [
            {
                "id": str(uuid.uuid4()),
                "title": "Festa de São João",
                "description": "Celebração tradicional da nossa freguesia com música ao vivo, arraial e fogo de artifício.",
                "date": "2026-06-24",
                "time": "19:00",
                "location": "Sede da SRDFSIL",
                "price": "Entrada livre",
                "image_url": "",
                "created_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "id": str(uuid.uuid4()),
                "title": "Peça de Teatro - Que Grande Mixórdia",
                "description": "O grupo de teatro apresenta 'Que Grande Mixórdia' - uma revista à portuguesa... mas saloia!",
                "date": "2026-07-15",
                "time": "21:30",
                "location": "Salão da SRDFSIL",
                "price": "12€",
                "image_url": "",
                "created_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "id": str(uuid.uuid4()),
                "title": "Torneio de Futebol de Salão",
                "description": "Torneio aberto a todos os sócios e amigos. Inscrições até dia 10 de Agosto.",
                "date": "2026-08-20",
                "time": "10:00",
                "location": "Campo da SRDFSIL",
                "price": "5€ por equipa",
                "image_url": "",
                "created_at": datetime.now(timezone.utc).isoformat()
            }
        ]
        await db.events.insert_many(sample_events)
        logger.info("Sample events seeded")

    # Seed sample gallery
    gallery_count = await db.gallery.count_documents({})
    if gallery_count == 0:
        sample_gallery = [
            {
                "id": str(uuid.uuid4()),
                "title": "Festa de Aniversário 2024",
                "image_url": "https://images.unsplash.com/photo-1743704952974-b4f411f5ceef?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2Mzl8MHwxfHNlYXJjaHwxfHxQb3J0dWd1ZXNlJTIwdmlsbGFnZSUyMGNvbW11bml0eSUyMGdhdGhlcmluZ3xlbnwwfHx8fDE3NzgzNTM0NjF8MA&ixlib=rb-4.1.0&q=85",
                "description": "Festa de comemoração do aniversário da Sociedade",
                "category": "Eventos",
                "created_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "id": str(uuid.uuid4()),
                "title": "Espetáculo de Teatro",
                "image_url": "https://images.pexels.com/photos/19658083/pexels-photo-19658083.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
                "description": "Espetáculo do grupo de teatro da SRDFSIL",
                "category": "Teatro",
                "created_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "id": str(uuid.uuid4()),
                "title": "Torneio Desportivo",
                "image_url": "https://images.unsplash.com/photo-1771909719482-4f95e62f41a7?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA3MDB8MHwxfHNlYXJjaHwyfHxpbmRvb3IlMjBzcG9ydHMlMjBoYWxsfGVufDB8fHx8MTc3ODM1MzM5Mnww&ixlib=rb-4.1.0&q=85",
                "description": "Torneio desportivo anual da Sociedade",
                "category": "Desporto",
                "created_at": datetime.now(timezone.utc).isoformat()
            }
        ]
        await db.gallery.insert_many(sample_gallery)
        logger.info("Sample gallery seeded")

    logger.info("SRDFSIL API started successfully")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
