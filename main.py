import os
import random
import time
import json
import smtplib
import requests
import sqlite3
import uuid
import httpx
import asyncio
from datetime import datetime
from typing import List, Optional
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from fastapi import FastAPI, HTTPException, Depends, status, Header, WebSocket, WebSocketDisconnect, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, HTMLResponse
from pydantic import BaseModel, Field
from dotenv import load_dotenv
from google import genai

from sqlalchemy import create_engine, Column, Integer, String, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session

load_dotenv()

# Environment Variables
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
ADMIN_SECRET_KEY = os.getenv("ADMIN_SECRET_KEY", "super_secret_admin_pass_123")
GMAIL_USER = os.getenv("GMAIL_USER")
GMAIL_APP_PASSWORD = os.getenv("GMAIL_APP_PASSWORD")
TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "YOUR_TELEGRAM_BOT_TOKEN_HERE")
TELEGRAM_CHAT_ID = os.getenv("TELEGRAM_CHAT_ID", "YOUR_TELEGRAM_CHAT_ID_HERE")
TELEGRAM_BOT_USERNAME = os.getenv("TELEGRAM_BOT_USERNAME", "YourBotUsername")

otp_session = {}
admin_sessions = {}  # Active admin session tokens: token -> expiry timestamp
telegram_auth_tokens = {}  # Temporary token store: token -> user profile info

# -------------------------------------------------------------
# 1. DATABASE SETUP (SQLAlchemy + SQLite)
# -------------------------------------------------------------
DATABASE_URL = "sqlite:///./portfolio.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class ProjectModel(Base):
    __tablename__ = "projects"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    category = Column(String, nullable=False, default="python")
    description = Column(Text, nullable=False)
    tech_stack = Column(String, nullable=False)
    github_link = Column(String, nullable=True)
    live_link = Column(String, nullable=True)
    image_url = Column(String, nullable=True)


class AchievementModel(Base):
    __tablename__ = "achievements"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    category = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    photo_url = Column(String, nullable=True)
    website_link = Column(String, nullable=True)


class SkillModel(Base):
    __tablename__ = "skills"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    percentage = Column(Integer, nullable=False)
    category = Column(String, nullable=False)


class ReviewModel(Base):
    __tablename__ = "reviews"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    username = Column(String, nullable=True)
    avatar_url = Column(String, nullable=True)
    avatar_initials = Column(String, nullable=False, default="CL")
    message = Column(Text, nullable=False)
    rating = Column(Integer, default=5)
    likes = Column(Integer, default=0)
    is_telegram_verified = Column(Integer, default=0)
    is_approved = Column(Integer, default=0)
    created_at = Column(String, default=lambda: datetime.now().strftime("%B %d, %Y"))


Base.metadata.create_all(bind=engine)


def auto_migrate_db():
    conn = engine.raw_connection()
    cursor = conn.cursor()
    columns = [
        ("username", "TEXT"),
        ("avatar_url", "TEXT"),
        ("rating", "INTEGER DEFAULT 5"),
        ("likes", "INTEGER DEFAULT 0"),
        ("is_telegram_verified", "INTEGER DEFAULT 0"),
        ("created_at", "TEXT")
    ]
    for col_name, col_type in columns:
        try:
            cursor.execute(f"ALTER TABLE reviews ADD COLUMN {col_name} {col_type}")
        except Exception:
            pass
    cursor.execute("UPDATE reviews SET likes = 0 WHERE likes IS NULL")
    cursor.execute("UPDATE reviews SET is_telegram_verified = 0 WHERE is_telegram_verified IS NULL")
    cursor.execute("UPDATE reviews SET rating = 5 WHERE rating IS NULL")
    conn.commit()
    conn.close()


auto_migrate_db()

app = FastAPI(title="Developer Portfolio API")

client = genai.Client(api_key=GEMINI_API_KEY) if GEMINI_API_KEY else None

if os.path.exists("static"):
    app.mount("/static", StaticFiles(directory="static"), name="static")


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# -------------------------------------------------------------
# 2. WEBSOCKET BROADCAST MANAGER
# -------------------------------------------------------------
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except Exception:
                pass


ws_manager = ConnectionManager()


# -------------------------------------------------------------
# 3. HELPER FUNCTIONS & SCHEMAS
# -------------------------------------------------------------
def send_email_otp(to_email: str, otp_code: str):
    if not GMAIL_USER or not GMAIL_APP_PASSWORD:
        return False

    msg = MIMEMultipart()
    msg['From'] = f"Portfolio Security <{GMAIL_USER}>"
    msg['To'] = to_email
    msg['Subject'] = f"🔒 Admin 2FA Code: {otp_code}"

    html_body = f"""
    <div style="font-family: Arial, sans-serif; background-color: #0b0f19; color: #ffffff; padding: 25px; border-radius: 10px;">
        <h2 style="color: #38bdf8;">Admin 2FA Code</h2>
        <p>Your one-time verification code is:</p>
        <div style="font-size: 36px; font-weight: bold; letter-spacing: 6px; color: #38bdf8; background: #151c2e; padding: 15px; text-align: center; border-radius: 8px; border: 1px solid #38bdf8; margin: 20px 0;">
            {otp_code}
        </div>
        <p style="color: #94a3b8; font-size: 12px;">Valid for 5 minutes.</p>
    </div>
    """
    msg.attach(MIMEText(html_body, 'html'))

    try:
        server = smtplib.SMTP("smtp.gmail.com", 587)
        server.starttls()
        server.login(GMAIL_USER, GMAIL_APP_PASSWORD)
        server.sendmail(GMAIL_USER, to_email, msg.as_string())
        server.quit()
        return True
    except Exception as e:
        print("❌ SMTP Error:", str(e))
        return False


def send_telegram_review_approval_ping(review_id: int, name: str, username: str, message: str, rating: int):
    if not TELEGRAM_BOT_TOKEN or TELEGRAM_BOT_TOKEN == "YOUR_TELEGRAM_BOT_TOKEN_HERE":
        return

    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
    text = (
        f"💬 <b>New Review Pending Approval!</b>\n\n"
        f"👤 <b>Client:</b> {name} ({username or 'Unverified'})\n"
        f"⭐ <b>Rating:</b> {'⭐' * rating}\n"
        f"📝 <b>Feedback:</b> {message}\n\n"
        f"<i>Tap below to approve or reject for your live website:</i>"
    )

    reply_markup = {
        "inline_keyboard": [
            [
                {"text": "Approve 🟢", "callback_data": f"approve_{review_id}"},
                {"text": "Reject 🔴", "callback_data": f"reject_{review_id}"}
            ]
        ]
    }

    payload = {
        "chat_id": TELEGRAM_CHAT_ID,
        "text": text,
        "parse_mode": "HTML",
        "reply_markup": reply_markup
    }

    try:
        requests.post(url, json=payload, timeout=5)
    except Exception as e:
        print(f"Error sending Telegram approval ping: {e}")


def fetch_telegram_avatar_url(user_id: int) -> Optional[str]:
    """Fetches real Telegram profile photo via Telegram Bot API."""
    if not TELEGRAM_BOT_TOKEN or TELEGRAM_BOT_TOKEN == "YOUR_TELEGRAM_BOT_TOKEN_HERE":
        return None
    try:
        photos_url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/getUserProfilePhotos?user_id={user_id}&limit=1"
        res = requests.get(photos_url, timeout=5).json()
        if res.get("ok") and res["result"]["total_count"] > 0:
            file_id = res["result"]["photos"][0][0]["file_id"]
            file_url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/getFile?file_id={file_id}"
            file_res = requests.get(file_url, timeout=5).json()
            if file_res.get("ok"):
                file_path = file_res["result"]["file_path"]
                return f"https://api.telegram.org/file/bot{TELEGRAM_BOT_TOKEN}/{file_path}"
    except Exception as e:
        print("Error fetching Telegram user photo:", e)
    return None


def verify_admin_key(x_admin_key: Optional[str] = Header(None)):
    """Validates Admin Session Token (or raw secret fallback) safely."""
    if not x_admin_key:
        raise HTTPException(status_code=401, detail="Unauthorized: Missing Admin Token!")

    if x_admin_key == ADMIN_SECRET_KEY:
        return

    if x_admin_key in admin_sessions:
        if time.time() < admin_sessions[x_admin_key]:
            return
        else:
            del admin_sessions[x_admin_key]

    raise HTTPException(status_code=401, detail="Unauthorized: Invalid or Expired Session Token!")


# PYDANTIC SCHEMAS
class RequestOTP(BaseModel):
    password: str


class VerifyOTP(BaseModel):
    otp_code: str


class ProjectSchema(BaseModel):
    title: str
    category: str = "python"
    description: str
    tech_stack: str
    github_link: Optional[str] = None
    live_link: Optional[str] = None
    image_url: Optional[str] = None


class AchievementSchema(BaseModel):
    title: str
    category: str
    description: str
    photo_url: Optional[str] = None
    website_link: Optional[str] = None


class SkillSchema(BaseModel):
    name: str
    percentage: int
    category: str


class ReviewSchema(BaseModel):
    name: str
    username: Optional[str] = None
    avatar_url: Optional[str] = None
    message: str
    rating: Optional[int] = 5
    auth_token: Optional[str] = None


class AIPrompt(BaseModel):
    prompt: str


class ChatRequest(BaseModel):
    message: str


class ContactMessage(BaseModel):
    name: str
    contact_info: Optional[str] = None
    email: Optional[str] = None
    message: str

    def get_contact_field(self) -> str:
        return self.contact_info or self.email or "Not provided"


# -------------------------------------------------------------
# 4. BACKGROUND TELEGRAM POLLER
# -------------------------------------------------------------
async def telegram_polling_loop():
    """Polls Telegram for button clicks and /start verification commands."""
    if not TELEGRAM_BOT_TOKEN or TELEGRAM_BOT_TOKEN == "YOUR_TELEGRAM_BOT_TOKEN_HERE":
        print("⚠️ Telegram Bot Token not set. Polling loop skipped.")
        return

    offset = 0
    print("🚀 Telegram Bot Poller active. Ready for local /start commands & button approvals!")

    async with httpx.AsyncClient(timeout=10.0) as client:
        while True:
            try:
                url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/getUpdates?offset={offset}&timeout=5"
                response = await client.get(url)
                if response.status_code == 200:
                    data = response.json()
                    if data.get("ok"):
                        for update in data.get("result", []):
                            offset = update["update_id"] + 1

                            if "message" in update and "text" in update["message"]:
                                msg_text = update["message"]["text"]
                                user_from = update["message"]["from"]
                                user_id = user_from.get("id")

                                if msg_text.startswith("/start "):
                                    token = msg_text.split(" ")[1].strip()
                                    if token in telegram_auth_tokens:
                                        real_photo = fetch_telegram_avatar_url(user_id) if user_id else None

                                        telegram_auth_tokens[token] = {
                                            "status": "verified",
                                            "user": {
                                                "first_name": user_from.get("first_name", ""),
                                                "last_name": user_from.get("last_name", ""),
                                                "username": user_from.get("username", ""),
                                                "photo_url": real_photo
                                            }
                                        }

                                        await client.post(
                                            f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage", json={
                                                "chat_id": update["message"]["chat"]["id"],
                                                "text": "✓ Verification successful! Return to Muxammadrizo's portfolio page to submit your review."
                                            })

                            if "callback_query" in update:
                                callback = update["callback_query"]
                                callback_id = callback["id"]
                                callback_data = callback["data"]
                                message = callback["message"]
                                message_id = message["message_id"]
                                chat_id = message["chat"]["id"]

                                db = SessionLocal()
                                try:
                                    if callback_data.startswith("approve_"):
                                        review_id = int(callback_data.split("_")[1])
                                        review = db.query(ReviewModel).filter(ReviewModel.id == review_id).first()
                                        if review:
                                            review.is_approved = 1
                                            db.commit()
                                            await ws_manager.broadcast("update_reviews")
                                        updated_text = message[
                                                           "text"] + "\n\n✅ <b>VERIFIED & APPROVED FOR LIVE WEBSITE!</b>"
                                    elif callback_data.startswith("reject_"):
                                        review_id = int(callback_data.split("_")[1])
                                        review = db.query(ReviewModel).filter(ReviewModel.id == review_id).first()
                                        if review:
                                            db.delete(review)
                                            db.commit()
                                            await ws_manager.broadcast("update_reviews")
                                        updated_text = message["text"] + "\n\n❌ <b>REJECTED & DELETED.</b>"
                                    else:
                                        updated_text = message["text"]
                                finally:
                                    db.close()

                                await client.post(f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/editMessageText",
                                                  json={
                                                      "chat_id": chat_id,
                                                      "message_id": message_id,
                                                      "text": updated_text,
                                                      "parse_mode": "HTML"
                                                  })
                                await client.post(
                                    f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/answerCallbackQuery", json={
                                        "callback_query_id": callback_id,
                                        "text": "Status updated!"
                                    })
            except Exception as e:
                pass
            await asyncio.sleep(2)


@app.on_event("startup")
async def startup_event():
    asyncio.create_task(telegram_polling_loop())


# -------------------------------------------------------------
# 5. WEBSOCKET & CORE ROUTING
# -------------------------------------------------------------
@app.websocket("/ws")
@app.websocket("/ws/status")
async def websocket_endpoint(websocket: WebSocket):
    await ws_manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
            await websocket.send_text("12ms")
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)


@app.get("/")
def read_root():
    if os.path.exists("index.html"):
        return FileResponse("index.html")
    elif os.path.exists("static/index.html"):
        return FileResponse("static/index.html")
    return {"status": "Frontend index.html not found"}


@app.get("/detail")
def serve_detail_page():
    if os.path.exists("detail.html"):
        return FileResponse("detail.html")
    elif os.path.exists("static/detail.html"):
        return FileResponse("static/detail.html")
    return {"status": "detail.html not found"}


@app.get("/admin")
def read_admin():
    if os.path.exists("admin.html"):
        return FileResponse("admin.html")
    elif os.path.exists("static/admin.html"):
        return FileResponse("static/admin.html")
    return {"status": "Admin panel HTML not found"}


@app.get("/api/health")
def health_check():
    return {"status": "online", "server": "FastAPI", "timestamp": time.time()}


# -------------------------------------------------------------
# 6. REAL TELEGRAM BOT AUTHENTICATION ENDPOINTS
# -------------------------------------------------------------
@app.post("/api/reviews/gen-token")
def generate_telegram_auth_token():
    token = str(uuid.uuid4())[:8]
    telegram_auth_tokens[token] = {"status": "pending", "expires_at": time.time() + 600}
    clean_bot_name = TELEGRAM_BOT_USERNAME.replace("@", "")
    bot_link = f"https://t.me/{clean_bot_name}?start={token}"
    return {"status": "success", "token": token, "bot_link": bot_link}


@app.get("/api/reviews/check-token/{token}")
def check_telegram_auth_token(token: str):
    if token in telegram_auth_tokens:
        data = telegram_auth_tokens[token]
        if data.get("status") == "verified":
            return {"verified": True, "user": data.get("user")}
    return {"verified": False}


# -------------------------------------------------------------
# 7. AUTHENTICATION (GMAIL 2FA & RATE-LIMITED SESSION TOKEN)
# -------------------------------------------------------------
@app.post("/api/admin/request-otp")
def request_otp(req: RequestOTP):
    if req.password != ADMIN_SECRET_KEY:
        raise HTTPException(status_code=401, detail="Incorrect Password!")

    otp = str(random.randint(100000, 999999))
    otp_session["code"] = otp
    otp_session["expires_at"] = time.time() + 300
    otp_session["attempts"] = 0

    if send_email_otp(GMAIL_USER, otp):
        return {"status": "success", "message": "2FA Code sent to Gmail!"}
    else:
        print(f"🔑 [LOCAL DEV MODE] Your 2FA Code is: {otp}")
        return {"status": "success", "message": "2FA Code logged to console (Dev Mode)"}


@app.post("/api/admin/verify-otp")
def verify_otp(req: VerifyOTP):
    if "code" not in otp_session:
        raise HTTPException(status_code=400, detail="No active 2FA session.")

    if time.time() > otp_session["expires_at"]:
        otp_session.clear()
        raise HTTPException(status_code=400, detail="2FA Code expired.")

    otp_session["attempts"] = otp_session.get("attempts", 0) + 1
    if otp_session["attempts"] > 5:
        otp_session.clear()
        raise HTTPException(status_code=429, detail="Too many failed attempts. OTP session invalidated.")

    if req.otp_code != otp_session["code"]:
        attempts_left = 5 - otp_session["attempts"]
        raise HTTPException(status_code=401, detail=f"Invalid 2FA Code. {attempts_left} attempts remaining.")

    session_token = str(uuid.uuid4())
    admin_sessions[session_token] = time.time() + 7200
    otp_session.clear()

    return {"status": "verified", "admin_token": session_token}


# -------------------------------------------------------------
# 8. AI FORM PARSER (GEMINI INTEGRATION)
# -------------------------------------------------------------
@app.post("/api/admin/ai-parse", dependencies=[Depends(verify_admin_key)])
def ai_parse_project(data: AIPrompt):
    if not client:
        raise HTTPException(status_code=500, detail="Gemini API Key missing")
    try:
        system_instruction = (
            "Extract structured project details from the user description. "
            "Return strictly valid JSON format with keys: "
            '"title", "description", "tech_stack". Do not include markdown or codeblocks.'
        )
        response = client.models.generate_content(
            model='gemini-3.6-flash',
            contents=f"{system_instruction}\n\nDescription: {data.prompt}"
        )

        raw_text = response.text.replace("```json", "").replace("```", "").strip()
        parsed = json.loads(raw_text)
        return parsed
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Parsing Error: {str(e)}")


# -------------------------------------------------------------
# 9. DYNAMIC CRUD API ROUTES (PROJECTS, ACHIEVEMENTS, SKILLS, REVIEWS)
# -------------------------------------------------------------
# PROJECTS
@app.get("/api/projects")
def get_projects(db: Session = Depends(get_db)):
    return db.query(ProjectModel).all()


@app.post("/api/projects", dependencies=[Depends(verify_admin_key)])
async def create_project(data: ProjectSchema, db: Session = Depends(get_db)):
    new_item = ProjectModel(**data.model_dump())
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    await ws_manager.broadcast("update_projects")
    return {"status": "success", "item": new_item}


@app.delete("/api/projects/{item_id}", dependencies=[Depends(verify_admin_key)])
async def delete_project(item_id: int, db: Session = Depends(get_db)):
    item = db.query(ProjectModel).filter(ProjectModel.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Not found")
    db.delete(item)
    db.commit()
    await ws_manager.broadcast("update_projects")
    return {"status": "deleted"}


# ACHIEVEMENTS
@app.get("/api/achievements")
def get_achievements(db: Session = Depends(get_db)):
    return db.query(AchievementModel).all()


@app.post("/api/achievements", dependencies=[Depends(verify_admin_key)])
async def create_achievement(data: AchievementSchema, db: Session = Depends(get_db)):
    new_item = AchievementModel(**data.model_dump())
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    await ws_manager.broadcast("update_achievements")
    return {"status": "success", "item": new_item}


@app.delete("/api/achievements/{item_id}", dependencies=[Depends(verify_admin_key)])
async def delete_achievement(item_id: int, db: Session = Depends(get_db)):
    item = db.query(AchievementModel).filter(AchievementModel.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Not found")
    db.delete(item)
    db.commit()
    await ws_manager.broadcast("update_achievements")
    return {"status": "deleted"}


# SKILLS
@app.get("/api/skills")
def get_skills(db: Session = Depends(get_db)):
    return db.query(SkillModel).all()


@app.post("/api/skills", dependencies=[Depends(verify_admin_key)])
async def create_skill(data: SkillSchema, db: Session = Depends(get_db)):
    new_item = SkillModel(**data.model_dump())
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    await ws_manager.broadcast("update_skills")
    return {"status": "success", "item": new_item}


@app.delete("/api/skills/{item_id}", dependencies=[Depends(verify_admin_key)])
async def delete_skill(item_id: int, db: Session = Depends(get_db)):
    item = db.query(SkillModel).filter(SkillModel.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Not found")
    db.delete(item)
    db.commit()
    await ws_manager.broadcast("update_skills")
    return {"status": "deleted"}


# REVIEWS (SORTED BY VERIFIED FIRST, LIKES DESC, ID DESC)
@app.get("/api/reviews")
def get_reviews(db: Session = Depends(get_db)):
    reviews = db.query(ReviewModel) \
        .filter(ReviewModel.is_approved == 1) \
        .order_by(ReviewModel.is_telegram_verified.desc(), ReviewModel.likes.desc(), ReviewModel.id.desc()) \
        .all()
    return {"reviews": reviews}


@app.post("/api/reviews")
async def submit_review(data: ReviewSchema, db: Session = Depends(get_db)):
    initials = "".join([part[0].upper() for part in data.name.split()[:2]]) if data.name else "CL"

    clean_username = data.username.strip() if data.username else None
    if clean_username and not clean_username.startswith("@"):
        clean_username = f"@{clean_username}"

    is_verified = 0
    avatar_url = data.avatar_url

    if data.auth_token and data.auth_token in telegram_auth_tokens:
        token_data = telegram_auth_tokens[data.auth_token]
        if token_data.get("status") == "verified":
            is_verified = 1
            user_info = token_data.get("user", {})
            if user_info.get("username"):
                clean_username = f"@{user_info.get('username')}"
            avatar_url = user_info.get("photo_url", avatar_url)

    new_review = ReviewModel(
        name=data.name,
        username=clean_username,
        avatar_url=avatar_url,
        avatar_initials=initials,
        message=data.message,
        rating=data.rating or 5,
        likes=0,
        is_telegram_verified=is_verified,
        is_approved=0,
        created_at=datetime.now().strftime("%B %d, %Y")
    )
    db.add(new_review)
    db.commit()
    db.refresh(new_review)

    send_telegram_review_approval_ping(
        review_id=new_review.id,
        name=new_review.name,
        username=clean_username,
        message=new_review.message,
        rating=new_review.rating
    )

    return {"status": "pending_approval",
            "message": "Review submitted! It will appear on the website after admin verification."}


@app.post("/api/reviews/{review_id}/like")
async def like_review(review_id: int, db: Session = Depends(get_db)):
    review = db.query(ReviewModel).filter(ReviewModel.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")

    if review.likes is None:
        review.likes = 0

    review.likes += 1
    db.commit()
    db.refresh(review)

    await ws_manager.broadcast("update_reviews")
    return {"status": "success", "likes": review.likes}


# CLEAR ALL TEST REVIEWS ROUTE
@app.delete("/api/admin/reviews/clear-all", dependencies=[Depends(verify_admin_key)])
async def clear_all_reviews(db: Session = Depends(get_db)):
    db.query(ReviewModel).delete()
    db.commit()
    await ws_manager.broadcast("update_reviews")
    return {"status": "success", "message": "All reviews cleared from database."}


# -------------------------------------------------------------
# 10. CONTACT FORM & TELEGRAM DISPATCHER
# -------------------------------------------------------------
@app.post("/api/contact")
def send_contact_message(data: ContactMessage):
    contact = data.get_contact_field()

    if TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID and TELEGRAM_BOT_TOKEN != "YOUR_TELEGRAM_BOT_TOKEN_HERE":
        contact_link = f"https://t.me/{contact.replace('@', '')}" if contact.startswith("@") else f"mailto:{contact}"
        telegram_text = (
            f"📩 <b>New Portfolio Message!</b>\n\n"
            f"👤 <b>Name:</b> {data.name}\n"
            f"✉️ <b>Contact:</b> {contact}\n"
            f"💬 <b>Message:</b>\n{data.message}\n\n"
            f"👉 <a href='{contact_link}'><b>Tap Here to Reply Direct</b></a>"
        )
        url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
        payload = {"chat_id": TELEGRAM_CHAT_ID, "text": telegram_text, "parse_mode": "HTML"}
        try:
            requests.post(url, json=payload, timeout=5)
        except Exception as e:
            print(f"Failed to post to Telegram: {e}")

    return {"status": "success", "message": "Message received!"}


@app.post("/api/chat")
def chat_with_gemini(request: ChatRequest):
    if not client:
        raise HTTPException(status_code=500, detail="Gemini API Key missing")
    try:
        user_msg = request.message.strip().lower()

        # EXPANDED PORTFOLIO KEYWORDS INCLUDING FREELANCE, RATES, PRICING, AND SERVICES
        portfolio_keywords = [
            'muxammadrizo', 'portfolio', 'project', 'backend', 'fastapi',
            'unreal', 'ue5', 'nknd', 'cube island', 'hire', 'rate', 'rates', 'price',
            'prices', 'cost', 'costs', 'cheap', 'budget', 'free', 'contact', 'skill',
            'blog', 'review', 'fergana', 'school', 'game', 'dev', 'python', 'who',
            'about', 'work', 'service', 'services', 'help', 'question', 'tell',
            'explain', 'describe', 'hi', 'hello', 'hey', 'salom', 'привет'
        ]
        is_portfolio = any(kw in user_msg for kw in portfolio_keywords) or len(user_msg) <= 3

        system_instruction = (
            "You are an executive, polite, intelligent, and highly professional AI assistant for Muxammadrizo A'zamjonov's developer portfolio.\n"
            "Strict Response Guidelines:\n"
            "1. When greeted with simple phrases like 'hi', 'hello', or 'hey', respond concisely and executive-like (e.g., 'Hello! How can I assist you today?'). Do NOT dump personal or technical specs immediately.\n"
            "2. Maintain a sleek, executive, and helpful tone.\n"
            "3. Answer technical questions accurately and concisely.\n"
            "4. PRICING & QUOTES: Muxammadrizo offers highly competitive, budget-friendly rates for students and clients. If asked for exact prices or custom project quotes, inform the user that rates depend on project scope and invite them to reach out directly via Telegram (@muxammadrizo0125) or the Contact Form for a tailored estimate.\n"
            "5. Only provide specific background information about Muxammadrizo (age, school, rates, location, specific projects) when the user explicitly asks about him or his work.\n"
            "6. About Muxammadrizo: He is 16 y/o studying at Hackathon IT School in Fergana, Uzbekistan."
        )

        response = client.models.generate_content(
            model='gemini-3.6-flash',
            contents=f"{system_instruction}\n\nUser Message: {request.message}"
        )
        return {"response": response.text, "is_portfolio": is_portfolio}
    except Exception as e:
        # Fallback response that still includes portfolio classification state
        return {
            "response": "I am currently experiencing network latency. Feel free to reach Muxammadrizo directly on Telegram @muxammadrizo0125!",
            "is_portfolio": any(
                kw in user_msg for kw in ['muxammadrizo', 'portfolio', 'project', 'backend', 'hi', 'hello'])
        }