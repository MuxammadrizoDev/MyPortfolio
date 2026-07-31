import os
import random
import time
import json
import smtplib
import requests
from typing import List, Optional

from fastapi import FastAPI, HTTPException, Depends, status, Header, WebSocket, WebSocketDisconnect
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
TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
TELEGRAM_CHAT_ID = os.getenv("TELEGRAM_CHAT_ID")

otp_session = {}

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
    avatar_initials = Column(String, nullable=False, default="CL")
    message = Column(Text, nullable=False)
    is_approved = Column(Integer, default=0)


Base.metadata.create_all(bind=engine)

app = FastAPI(title="Developer Portfolio API")

# Initialize Gemini Client if Key Exists
client = genai.Client(api_key=GEMINI_API_KEY) if GEMINI_API_KEY else None

# Mount Static Assets
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


def verify_admin_key(x_admin_key: Optional[str] = Header(None)):
    if x_admin_key != ADMIN_SECRET_KEY:
        raise HTTPException(status_code=401, detail="Unauthorized: Invalid Admin Key!")


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
    message: str


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
# 4. WEBSOCKET & CORE ROUTING
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
# 5. AUTHENTICATION (GMAIL 2FA)
# -------------------------------------------------------------
@app.post("/api/admin/request-otp")
def request_otp(req: RequestOTP):
    if req.password != ADMIN_SECRET_KEY:
        raise HTTPException(status_code=401, detail="Incorrect Password!")

    otp = str(random.randint(100000, 999999))
    otp_session["code"] = otp
    otp_session["expires_at"] = time.time() + 300

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
    if req.otp_code != otp_session["code"]:
        raise HTTPException(status_code=401, detail="Invalid 2FA Code.")

    return {"status": "verified", "admin_key": ADMIN_SECRET_KEY}


# -------------------------------------------------------------
# 6. AI FORM PARSER (GEMINI INTEGRATION)
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
            model='gemini-2.5-flash',
            contents=f"{system_instruction}\n\nDescription: {data.prompt}"
        )

        raw_text = response.text.replace("```json", "").replace("```", "").strip()
        parsed = json.loads(raw_text)
        return parsed
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Parsing Error: {str(e)}")


# -------------------------------------------------------------
# 7. DYNAMIC CRUD API ROUTES (PROJECTS, ACHIEVEMENTS, SKILLS, REVIEWS)
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


# REVIEWS
@app.get("/api/reviews")
def get_reviews(db: Session = Depends(get_db)):
    return db.query(ReviewModel).filter(ReviewModel.is_approved == 1).all()


@app.post("/api/reviews")
async def submit_review(data: ReviewSchema, db: Session = Depends(get_db)):
    initials = "".join([part[0].upper() for part in data.name.split()[:2]]) if data.name else "CL"
    new_review = ReviewModel(name=data.name, avatar_initials=initials, message=data.message, is_approved=1)
    db.add(new_review)
    db.commit()
    db.refresh(new_review)
    await ws_manager.broadcast("update_reviews")
    return {"status": "success", "item": new_review}


# -------------------------------------------------------------
# 8. CONTACT FORM & TELEGRAM DISPATCHER
# -------------------------------------------------------------
@app.post("/api/contact")
def send_contact_message(data: ContactMessage):
    contact = data.get_contact_field()

    if TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID:
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
        system_instruction = (
            "You are an AI assistant for Muxammadrizo A'zamjonov's portfolio. "
            "Be polite, concise, and highlight his skills in Python, FastAPI backends, and Unreal Engine 5.8."
        )
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=f"{system_instruction}\n\nUser Question: {request.message}"
        )
        return {"response": response.text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))