import os, random, time, json, smtplib, requests, sqlite3, uuid, httpx, asyncio
from datetime import datetime
from typing import List, Optional
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from fastapi import FastAPI, HTTPException, Depends, status, Header, WebSocket, WebSocketDisconnect, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from dotenv import load_dotenv

from google import genai
from google.genai import types

try:
    import psutil
except ImportError:
    psutil = None

from sqlalchemy import create_engine, Column, Integer, String, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session

load_dotenv()
ENV_GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
ADMIN_USERNAME = os.getenv("ADMIN_USERNAME", "admin")
ADMIN_SECRET_KEY = os.getenv("ADMIN_SECRET_KEY", "super_secret_admin_pass_123")
GMAIL_USER = os.getenv("GMAIL_USER")
GMAIL_APP_PASSWORD = os.getenv("GMAIL_APP_PASSWORD")
TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "YOUR_TELEGRAM_BOT_TOKEN_HERE")
TELEGRAM_CHAT_ID = os.getenv("TELEGRAM_CHAT_ID", "YOUR_TELEGRAM_CHAT_ID_HERE")
TELEGRAM_BOT_USERNAME = os.getenv("TELEGRAM_BOT_USERNAME", "YourBotUsername")

otp_session = {};
admin_sessions = {};
telegram_auth_tokens = {}
admin_lockout_state = {"until": 0, "failed_otp_attempts": 0, "failed_login_attempts": 0}

server_stats = {"total_visits": 0, "unique_sessions": set(), "desktop_visits": 0, "mobile_visits": 0,
                "total_time_seconds": 0, "start_time": time.time(), "page_views": {"home": 0, "detail": 0},
                "content_views": {"projects": 0, "achievements": 0, "blogs": 0, "journey": 0},
                "os_breakdown": {"Windows": 0, "Android": 0, "iOS": 0, "Mac": 0, "Linux": 0, "Unknown": 0},
                "cpu_history": [10] * 7, "ram_history": [30] * 7, "traffic_history": [0] * 7,
                "ai_metrics": {"answered": 0, "lockouts": 0}, "recent_ai_prompts": []}

engine = create_engine("sqlite:///./portfolio.db", connect_args={"check_same_thread": False});
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine);
Base = declarative_base()


class ProjectModel(Base):
    __tablename__ = "projects";
    id = Column(Integer, primary_key=True)
    title = Column(String, nullable=False);
    title_uz = Column(String, default="");
    title_ru = Column(String, default="")
    category = Column(String, nullable=False, default="python")
    description = Column(Text, nullable=False);
    description_uz = Column(Text, default="");
    description_ru = Column(Text, default="")
    tech_stack = Column(String, nullable=False);
    github_link = Column(String);
    live_link = Column(String);
    image_url = Column(String)


class AchievementModel(Base):
    __tablename__ = "achievements";
    id = Column(Integer, primary_key=True)
    title = Column(String, nullable=False);
    title_uz = Column(String, default="");
    title_ru = Column(String, default="")
    category = Column(String, nullable=False)
    description = Column(Text, nullable=False);
    description_uz = Column(Text, default="");
    description_ru = Column(Text, default="")
    photo_url = Column(String);
    website_link = Column(String)


class JourneyModel(Base):
    __tablename__ = "journey";
    id = Column(Integer, primary_key=True)
    title = Column(String, nullable=False);
    title_uz = Column(String, default="");
    title_ru = Column(String, default="")
    date_range = Column(String, nullable=False)
    category_badge = Column(String, nullable=False);
    category_badge_uz = Column(String, default="");
    category_badge_ru = Column(String, default="")
    description = Column(Text, nullable=False);
    description_uz = Column(Text, default="");
    description_ru = Column(Text, default="")


class SkillModel(Base): __tablename__ = "skills"; id = Column(Integer, primary_key=True); name = Column(String,
                                                                                                        nullable=False); percentage = Column(
    Integer, nullable=False); category = Column(String, nullable=False)


class ReviewModel(Base): __tablename__ = "reviews"; id = Column(Integer, primary_key=True); name = Column(String,
                                                                                                          nullable=False); username = Column(
    String); avatar_url = Column(String); avatar_initials = Column(String, nullable=False,
                                                                   default="CL"); message = Column(Text,
                                                                                                   nullable=False); rating = Column(
    Integer, default=5); likes = Column(Integer, default=0); is_telegram_verified = Column(Integer,
                                                                                           default=0); is_approved = Column(
    Integer, default=0); created_at = Column(String, default=lambda: datetime.now().strftime(
    "%B %d, %Y")); admin_reply = Column(Text)


class SiteConfigModel(Base):
    __tablename__ = "site_config";
    id = Column(Integer, primary_key=True);
    dev_name = Column(String, default="A'zamjonov Muxammadrizo");
    site_brand = Column(String, default="Muxammadrizo.dev");
    hero_badge = Column(String, default="16 y/o • Hackathon IT School Fergana");
    hero_badge_uz = Column(String, default="16 yosh • Hackathon IT School Farg'ona");
    hero_badge_ru = Column(String, default="16 лет • Hackathon IT School Фергана");
    telegram_handle = Column(String, default="@muxammadrizo0125");
    github_url = Column(String, default="https://github.com/azammuhammadrizo924-debug");
    gmail_address = Column(String, default="azammuhammadrizo924@gmail.com");
    hero_bio = Column(Text,
                      default="Developer studying at Hackathon IT School in Fergana, Uzbekistan. Founder of NKND Studios.");
    hero_bio_uz = Column(Text, default="Farg'ona Hackathon IT School o'quvchisi.");
    hero_bio_ru = Column(Text, default="Студент Hackathon IT School в Фергане.");
    typewriter_phrases_json = Column(Text, default=json.dumps(
        ["Python FastAPI Backends", "Unreal Engine 5.8 Worlds", "Automated Telegram Bots"]));
    holo_greetings_json = Column(Text, default=json.dumps(["Hi", "Salom", "Привет"]));
    gemini_api_key = Column(String, default="")


class AiKnowledgeModel(Base): __tablename__ = "ai_knowledge"; id = Column(Integer, primary_key=True); topic = Column(
    String, nullable=False); fact = Column(Text, nullable=False)


Base.metadata.create_all(bind=engine)


def auto_migrate_db():
    conn = engine.raw_connection();
    cursor = conn.cursor()
    for table, col, ctype in [
        ("reviews", "username", "TEXT"), ("reviews", "avatar_url", "TEXT"), ("reviews", "rating", "INTEGER DEFAULT 5"),
        ("reviews", "likes", "INTEGER DEFAULT 0"), ("reviews", "is_telegram_verified", "INTEGER DEFAULT 0"),
        ("reviews", "created_at", "TEXT"), ("reviews", "admin_reply", "TEXT"),
        ("site_config", "hero_bio_uz", "TEXT"), ("site_config", "hero_bio_ru", "TEXT"),
        ("site_config", "gemini_api_key", "TEXT"), ("site_config", "hero_badge_uz", "TEXT"),
        ("site_config", "hero_badge_ru", "TEXT"),
        ("projects", "title_uz", "TEXT"), ("projects", "title_ru", "TEXT"), ("projects", "description_uz", "TEXT"),
        ("projects", "description_ru", "TEXT"),
        ("achievements", "title_uz", "TEXT"), ("achievements", "title_ru", "TEXT"),
        ("achievements", "description_uz", "TEXT"), ("achievements", "description_ru", "TEXT"),
        ("journey", "title_uz", "TEXT"), ("journey", "title_ru", "TEXT"), ("journey", "description_uz", "TEXT"),
        ("journey", "description_ru", "TEXT"), ("journey", "category_badge_uz", "TEXT"),
        ("journey", "category_badge_ru", "TEXT")
    ]:
        try:
            cursor.execute(f"ALTER TABLE {table} ADD COLUMN {col} {ctype}")
        except Exception:
            pass
    try:
        cursor.execute("ALTER TABLE site_config ADD COLUMN holo_greetings_json TEXT")
    except Exception:
        pass
    conn.commit();
    conn.close()


auto_migrate_db()
app = FastAPI(title="Developer Portfolio API")

if os.path.exists("static"): app.mount("/static", StaticFiles(directory="static"), name="static")


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_active_gemini_key(db: Session):
    config = db.query(SiteConfigModel).first()
    if config and config.gemini_api_key and config.gemini_api_key.strip() != "": return config.gemini_api_key.strip()
    return ENV_GEMINI_API_KEY


class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept(); self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections: self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except Exception:
                pass


ws_manager = ConnectionManager()


def send_email_otp(to_email: str, otp_code: str):
    if not GMAIL_USER or not GMAIL_APP_PASSWORD: return False
    msg = MIMEMultipart();
    msg['From'] = f"Portfolio Security <{GMAIL_USER}>";
    msg['To'] = to_email;
    msg['Subject'] = f"🔒 Admin 2FA Code: {otp_code}"
    msg.attach(MIMEText(
        f"<h2>Admin 2FA Verification Code</h2><div style='font-size:36px;font-weight:bold;color:#38bdf8;'>{otp_code}</div>",
        'html'))
    try:
        server = smtplib.SMTP("smtp.gmail.com", 587);
        server.starttls();
        server.login(GMAIL_USER, GMAIL_APP_PASSWORD);
        server.sendmail(GMAIL_USER, to_email, msg.as_string());
        server.quit();
        return True
    except Exception as e:
        print(f"\n❌ EMAIL SEND FAILED: {str(e)}\nEnsure you use a 16-letter 'App Password' from Google!\n")
        return False


def verify_admin_key(x_admin_key: Optional[str] = Header(None)):
    if not x_admin_key: raise HTTPException(status_code=401, detail="Unauthorized")
    if x_admin_key == ADMIN_SECRET_KEY: return
    if x_admin_key in admin_sessions:
        if time.time() < admin_sessions[x_admin_key]:
            return
        else:
            del admin_sessions[x_admin_key]
    raise HTTPException(status_code=401, detail="Unauthorized")


class RequestOTP(BaseModel): username: str; password: str


class VerifyOTP(BaseModel): otp_code: str


class SiteConfigSchema(
    BaseModel): dev_name: str; site_brand: str; hero_badge: str; hero_badge_uz: str; hero_badge_ru: str; telegram_handle: str; github_url: str; gmail_address: str; hero_bio: str; hero_bio_uz: str; hero_bio_ru: str; typewriter_phrases: \
List[str]; holo_greetings: List[str]


class UpdateApiKeySchema(BaseModel): api_key: str


class AiKnowledgeSchema(BaseModel): topic: str; fact: str


class ProjectSchema(BaseModel): title: str; title_uz: Optional[str] = ""; title_ru: Optional[
    str] = ""; category: str = "python"; description: str; description_uz: Optional[str] = ""; description_ru: Optional[
    str] = ""; tech_stack: str; github_link: Optional[str] = None; live_link: Optional[str] = None; image_url: Optional[
    str] = None


class JourneySchema(BaseModel): title: str; title_uz: Optional[str] = ""; title_ru: Optional[
    str] = ""; date_range: str; category_badge: str; category_badge_uz: Optional[str] = ""; category_badge_ru: Optional[
    str] = ""; description: str; description_uz: Optional[str] = ""; description_ru: Optional[str] = ""


class AchievementSchema(BaseModel): title: str; title_uz: Optional[str] = ""; title_ru: Optional[
    str] = ""; category: str; description: str; description_uz: Optional[str] = ""; description_ru: Optional[
    str] = ""; photo_url: Optional[str] = None; website_link: Optional[str] = None


class SkillSchema(BaseModel): name: str; percentage: int; category: str


class ReviewSchema(BaseModel): name: str; username: Optional[str] = None; avatar_url: Optional[
    str] = None; message: str; rating: Optional[int] = 5; auth_token: Optional[str] = None


class OwnerReplySchema(BaseModel): reply: str


class TrackVisitSchema(BaseModel): session_id: str; is_new: bool


class TrackContentSchema(BaseModel): type: str


class AIPrompt(BaseModel): prompt: str; type: str = "project"; lang: str = "ru"


class ChatRequest(BaseModel): message: str


class ContactMessage(BaseModel):
    name: str;
    contact_info: Optional[str] = None;
    email: Optional[str] = None;
    message: str

    def get_contact_field(self) -> str: return self.contact_info or self.email or "Not provided"


@app.websocket("/ws/status")
async def websocket_endpoint(websocket: WebSocket):
    await ws_manager.connect(websocket)
    try:
        while True:
            msg = await websocket.receive_text()
            if msg == "ping":
                server_stats["total_time_seconds"] += 5; await ws_manager.broadcast("update_stats")
            else:
                await websocket.send_text("12ms")
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)


@app.get("/")
def read_root(request: Request):
    server_stats["page_views"]["home"] += 1
    return FileResponse("static/index.html") if os.path.exists("static/index.html") else FileResponse("index.html")


@app.get("/detail")
def serve_detail_page(): server_stats["page_views"]["detail"] += 1; return FileResponse(
    "static/detail.html") if os.path.exists("static/detail.html") else FileResponse("detail.html")


@app.get("/admin")
def read_admin(): return FileResponse("static/admin.html") if os.path.exists("static/admin.html") else FileResponse(
    "admin.html")


@app.post("/api/track-visit")
async def track_unique_visit(request: Request, data: TrackVisitSchema):
    if data.session_id not in server_stats["unique_sessions"]:
        server_stats["unique_sessions"].add(data.session_id);
        server_stats["total_visits"] += 1;
        server_stats["traffic_history"].append(server_stats["total_visits"])
        if len(server_stats["traffic_history"]) > 10: server_stats["traffic_history"].pop(0)
        ua = request.headers.get("user-agent", "").lower()
        if "android" in ua:
            server_stats["os_breakdown"]["Android"] += 1; server_stats["mobile_visits"] += 1
        elif "iphone" in ua or "ipad" in ua:
            server_stats["os_breakdown"]["iOS"] += 1; server_stats["mobile_visits"] += 1
        elif "windows" in ua:
            server_stats["os_breakdown"]["Windows"] += 1; server_stats["desktop_visits"] += 1
        elif "mac" in ua:
            server_stats["os_breakdown"]["Mac"] += 1; server_stats["desktop_visits"] += 1
        elif "linux" in ua:
            server_stats["os_breakdown"]["Linux"] += 1; server_stats["desktop_visits"] += 1
        else:
            server_stats["os_breakdown"]["Unknown"] += 1
        await ws_manager.broadcast("update_stats")
    return {"status": "success"}


@app.post("/api/track-content")
async def track_content_open(data: TrackContentSchema):
    ct = data.type.lower()
    if ct == "project": ct = "projects"
    if ct == "proof": ct = "achievements"
    if ct == "blog": ct = "blogs"
    if ct in server_stats["content_views"]:
        server_stats["content_views"][ct] += 1
        await ws_manager.broadcast("update_stats")
    return {"status": "success"}


@app.get("/api/config")
def get_site_config(db: Session = Depends(get_db)):
    c = db.query(SiteConfigModel).first()
    if not c: c = SiteConfigModel(); db.add(c); db.commit(); db.refresh(c)
    return {"dev_name": c.dev_name, "site_brand": c.site_brand, "hero_badge": c.hero_badge,
            "hero_badge_uz": c.hero_badge_uz, "hero_badge_ru": c.hero_badge_ru, "telegram_handle": c.telegram_handle,
            "github_url": c.github_url, "gmail_address": c.gmail_address, "hero_bio": c.hero_bio,
            "hero_bio_uz": c.hero_bio_uz, "hero_bio_ru": c.hero_bio_ru,
            "typewriter_phrases": json.loads(c.typewriter_phrases_json or "[]"),
            "holo_greetings": json.loads(c.holo_greetings_json or "[]")}


@app.post("/api/admin/config", dependencies=[Depends(verify_admin_key)])
async def update_site_config(data: SiteConfigSchema, db: Session = Depends(get_db)):
    c = db.query(SiteConfigModel).first()
    if not c: c = SiteConfigModel(); db.add(c)
    c.dev_name = data.dev_name;
    c.site_brand = data.site_brand;
    c.hero_badge = data.hero_badge;
    c.hero_badge_uz = data.hero_badge_uz;
    c.hero_badge_ru = data.hero_badge_ru;
    c.telegram_handle = data.telegram_handle;
    c.github_url = data.github_url;
    c.gmail_address = data.gmail_address;
    c.hero_bio = data.hero_bio;
    c.hero_bio_uz = data.hero_bio_uz;
    c.hero_bio_ru = data.hero_bio_ru;
    c.typewriter_phrases_json = json.dumps(data.typewriter_phrases);
    c.holo_greetings_json = json.dumps(data.holo_greetings)
    db.commit();
    await ws_manager.broadcast("update_config");
    return {"status": "success"}


@app.post("/api/admin/update-apikey", dependencies=[Depends(verify_admin_key)])
async def update_api_key(data: UpdateApiKeySchema, db: Session = Depends(get_db)):
    c = db.query(SiteConfigModel).first()
    if not c: c = SiteConfigModel(); db.add(c)
    c.gemini_api_key = data.api_key;
    db.commit()
    return {"status": "success"}


@app.get("/api/stats")
def get_server_stats():
    cpu, rmb, rpc = 12.0, 148.0, 35.0
    if psutil:
        try:
            cpu = psutil.cpu_percent(interval=None); m = psutil.virtual_memory(); rmb = round(m.used / (1024 * 1024),
                                                                                              1); rpc = m.percent
        except:
            pass
    server_stats["cpu_history"].append(cpu);
    server_stats["ram_history"].append(rpc)
    if len(server_stats["cpu_history"]) > 10: server_stats["cpu_history"].pop(0)
    if len(server_stats["ram_history"]) > 10: server_stats["ram_history"].pop(0)
    return {**server_stats, "system_diagnostics": {"cpu_load_percent": cpu, "ram_allocated_mb": rmb, "ram_percent": rpc,
                                                   "uptime_seconds": int(time.time() - server_stats["start_time"]),
                                                   "cpu_history": server_stats["cpu_history"],
                                                   "ram_history": server_stats["ram_history"]}}


@app.post("/api/admin/request-otp")
def request_otp(req: RequestOTP):
    if time.time() < admin_lockout_state["until"]: raise HTTPException(status_code=429, detail="Locked")
    if req.username.strip() != ADMIN_USERNAME or req.password != ADMIN_SECRET_KEY:
        admin_lockout_state["failed_login_attempts"] += 1
        if admin_lockout_state["failed_login_attempts"] >= 10: admin_lockout_state["until"] = time.time() + 900;
        admin_lockout_state["failed_login_attempts"] = 0; raise HTTPException(status_code=429, detail="Locked 15m")
        raise HTTPException(status_code=401, detail="Invalid Credentials")
    admin_lockout_state["failed_login_attempts"] = 0
    otp = str(random.randint(100000, 999999));
    otp_session["code"] = otp;
    otp_session["expires_at"] = time.time() + 300
    print(f"\n\n{'=' * 50}\n🔐 DEVELOPMENT OTP CODE: {otp}\n{'=' * 50}\n\n")
    if send_email_otp(GMAIL_USER, otp): return {"status": "success", "message": "OTP sent to email."}
    return {"status": "success", "message": "Email failed. Look at Terminal!"}


@app.post("/api/admin/verify-otp")
def verify_otp(req: VerifyOTP):
    if time.time() < admin_lockout_state["until"]: raise HTTPException(status_code=429, detail="Locked")
    if "code" not in otp_session or time.time() > otp_session["expires_at"]: raise HTTPException(status_code=400,
                                                                                                 detail="Expired")
    if req.otp_code.strip() != otp_session["code"]:
        admin_lockout_state["failed_otp_attempts"] += 1
        if admin_lockout_state["failed_otp_attempts"] >= 10: admin_lockout_state["until"] = time.time() + 900;
        admin_lockout_state["failed_otp_attempts"] = 0; otp_session.clear(); raise HTTPException(status_code=429,
                                                                                                 detail="Locked 15m")
        raise HTTPException(status_code=401, detail="Incorrect")
    admin_lockout_state["failed_otp_attempts"] = 0;
    admin_lockout_state["until"] = 0;
    st = str(uuid.uuid4())

    # FIXED: Session token now lasts 30 full days! (2592000 seconds)
    admin_sessions[st] = time.time() + 2592000;
    otp_session.clear()
    return {"status": "verified", "admin_token": st}


@app.get("/api/ai-knowledge")
def get_ai_knowledge(db: Session = Depends(get_db)): return [{"id": r.id, "topic": r.topic, "fact": r.fact} for r in
                                                             db.query(AiKnowledgeModel).all()]


@app.post("/api/admin/ai-knowledge", dependencies=[Depends(verify_admin_key)])
def add_ai_knowledge(data: AiKnowledgeSchema, db: Session = Depends(get_db)): r = AiKnowledgeModel(topic=data.topic,
                                                                                                   fact=data.fact); db.add(
    r); db.commit(); return {"status": "success"}


@app.put("/api/admin/ai-knowledge/{rule_id}", dependencies=[Depends(verify_admin_key)])
def update_ai_knowledge(rule_id: int, data: AiKnowledgeSchema, db: Session = Depends(get_db)):
    r = db.query(AiKnowledgeModel).filter(AiKnowledgeModel.id == rule_id).first();
    if r: r.topic = data.topic; r.fact = data.fact; db.commit()
    return {"status": "success"}


@app.delete("/api/admin/ai-knowledge/{rule_id}", dependencies=[Depends(verify_admin_key)])
def delete_ai_knowledge(rule_id: int, db: Session = Depends(get_db)):
    r = db.query(AiKnowledgeModel).filter(AiKnowledgeModel.id == rule_id).first();
    if r: db.delete(r); db.commit()
    return {"status": "deleted"}


@app.post("/api/admin/ai-parse", dependencies=[Depends(verify_admin_key)])
def ai_parse_project(data: AIPrompt, db: Session = Depends(get_db)):
    active_key = get_active_gemini_key(db)
    if not active_key: raise HTTPException(status_code=500, detail="No AI Key Configured")
    try:
        # FIXED: Enforces gemini-1.5-flash everywhere to prevent 503 errors
        client = genai.Client(api_key=active_key)
        if data.type == "advanced_blocks":
            si = "Generate JSON with keys 'title', 'category', 'tech_stack' and 'blocks'. 'blocks' is an array of objects. Allowed block types: 'header', 'text', 'media'. Example: {\"title\": \"My Title\", \"category\": \"Python\", \"tech_stack\": \"FastAPI\", \"blocks\": [{\"type\": \"header\", \"content\": \"Intro\"}]}. RETURN ONLY RAW JSON without markdown wrapping."
        elif data.type == "journey":
            si = "Generate JSON for Dev Journey. Keys: 'title', 'date_range' (e.g. 2024 - Present), 'category_badge' (short 1-2 words), 'description'. RETURN ONLY RAW JSON without markdown wrapping."
        elif data.type == "translate_all":
            si = "Translate the provided JSON structure to Uzbek ('uz') and Russian ('ru'). Input is a JSON object. Return a JSON object with two keys: 'uz' and 'ru'. Each key must contain the fully translated JSON object, preserving the exact original structure, arrays, and keys. Only translate the string values. RETURN ONLY RAW JSON."
        else:
            si = "Generate JSON with keys: 'title', 'description', 'tech_stack'. RETURN ONLY RAW JSON without markdown wrapping."

        res = client.models.generate_content(model='gemini-3.6-flash', contents=f"{si}\n\nPrompt: {data.prompt}")
        raw = res.text.strip()
        if raw.startswith("```json"): raw = raw[7:]
        if raw.startswith("```"): raw = raw[3:]
        if raw.endswith("```"): raw = raw[:-3]
        return json.loads(raw.strip())
    except Exception as e:
        print(f"AI PARSE ERROR: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/projects")
def get_projects(db: Session = Depends(get_db)): return [
    {"id": p.id, "title": p.title, "title_uz": p.title_uz, "title_ru": p.title_ru, "category": p.category,
     "description": p.description, "description_uz": p.description_uz, "description_ru": p.description_ru,
     "tech_stack": p.tech_stack, "github_link": p.github_link, "live_link": p.live_link, "image_url": p.image_url} for p
    in db.query(ProjectModel).all()]


@app.post("/api/projects", dependencies=[Depends(verify_admin_key)])
async def create_project(data: ProjectSchema, db: Session = Depends(get_db)): db.add(
    ProjectModel(**data.model_dump())); db.commit(); await ws_manager.broadcast("update_projects"); return {
    "status": "success"}


@app.put("/api/projects/{item_id}", dependencies=[Depends(verify_admin_key)])
async def update_project(item_id: int, data: ProjectSchema, db: Session = Depends(get_db)):
    i = db.query(ProjectModel).filter(ProjectModel.id == item_id).first()
    if i: i.title = data.title; i.title_uz = data.title_uz; i.title_ru = data.title_ru; i.category = data.category; i.description = data.description; i.description_uz = data.description_uz; i.description_ru = data.description_ru; i.tech_stack = data.tech_stack; i.github_link = data.github_link; i.live_link = data.live_link; i.image_url = data.image_url; db.commit(); await ws_manager.broadcast(
        "update_projects")
    return {"status": "success"}


@app.delete("/api/projects/{item_id}", dependencies=[Depends(verify_admin_key)])
async def delete_project(item_id: int, db: Session = Depends(get_db)):
    i = db.query(ProjectModel).filter(ProjectModel.id == item_id).first()
    if i: db.delete(i); db.commit(); await ws_manager.broadcast("update_projects")
    return {"status": "deleted"}


@app.get("/api/achievements")
def get_achievements(db: Session = Depends(get_db)): return [
    {"id": a.id, "title": a.title, "title_uz": a.title_uz, "title_ru": a.title_ru, "category": a.category,
     "description": a.description, "description_uz": a.description_uz, "description_ru": a.description_ru,
     "photo_url": a.photo_url, "website_link": a.website_link} for a in db.query(AchievementModel).all()]


@app.post("/api/achievements", dependencies=[Depends(verify_admin_key)])
async def create_achievement(data: AchievementSchema, db: Session = Depends(get_db)): db.add(
    AchievementModel(**data.model_dump())); db.commit(); await ws_manager.broadcast("update_achievements"); return {
    "status": "success"}


@app.put("/api/achievements/{item_id}", dependencies=[Depends(verify_admin_key)])
async def update_achievement(item_id: int, data: AchievementSchema, db: Session = Depends(get_db)):
    i = db.query(AchievementModel).filter(AchievementModel.id == item_id).first()
    if i: i.title = data.title; i.title_uz = data.title_uz; i.title_ru = data.title_ru; i.category = data.category; i.description = data.description; i.description_uz = data.description_uz; i.description_ru = data.description_ru; i.photo_url = data.photo_url; i.website_link = data.website_link; db.commit(); await ws_manager.broadcast(
        "update_achievements")
    return {"status": "success"}


@app.delete("/api/achievements/{item_id}", dependencies=[Depends(verify_admin_key)])
async def delete_achievement(item_id: int, db: Session = Depends(get_db)):
    i = db.query(AchievementModel).filter(AchievementModel.id == item_id).first()
    if i: db.delete(i); db.commit(); await ws_manager.broadcast("update_achievements")
    return {"status": "deleted"}


@app.get("/api/journey")
def get_journey(db: Session = Depends(get_db)): return [
    {"id": j.id, "title": j.title, "title_uz": j.title_uz, "title_ru": j.title_ru, "date_range": j.date_range,
     "category_badge": j.category_badge, "category_badge_uz": j.category_badge_uz,
     "category_badge_ru": j.category_badge_ru, "description": j.description, "description_uz": j.description_uz,
     "description_ru": j.description_ru} for j in db.query(JourneyModel).all()]


@app.post("/api/journey", dependencies=[Depends(verify_admin_key)])
async def create_journey(data: JourneySchema, db: Session = Depends(get_db)): db.add(
    JourneyModel(**data.model_dump())); db.commit(); await ws_manager.broadcast("update_journey"); return {
    "status": "success"}


@app.put("/api/journey/{item_id}", dependencies=[Depends(verify_admin_key)])
async def update_journey(item_id: int, data: JourneySchema, db: Session = Depends(get_db)):
    i = db.query(JourneyModel).filter(JourneyModel.id == item_id).first()
    if i: i.title = data.title; i.title_uz = data.title_uz; i.title_ru = data.title_ru; i.date_range = data.date_range; i.category_badge = data.category_badge; i.category_badge_uz = data.category_badge_uz; i.category_badge_ru = data.category_badge_ru; i.description = data.description; i.description_uz = data.description_uz; i.description_ru = data.description_ru; db.commit(); await ws_manager.broadcast(
        "update_journey")
    return {"status": "success"}


@app.delete("/api/journey/{item_id}", dependencies=[Depends(verify_admin_key)])
async def delete_journey(item_id: int, db: Session = Depends(get_db)):
    i = db.query(JourneyModel).filter(JourneyModel.id == item_id).first()
    if i: db.delete(i); db.commit(); await ws_manager.broadcast("update_journey")
    return {"status": "deleted"}


@app.get("/api/skills")
def get_skills(db: Session = Depends(get_db)): return [
    {"id": s.id, "name": s.name, "percentage": s.percentage, "category": s.category} for s in
    db.query(SkillModel).all()]


@app.post("/api/skills", dependencies=[Depends(verify_admin_key)])
async def create_skill(data: SkillSchema, db: Session = Depends(get_db)): db.add(
    SkillModel(**data.model_dump())); db.commit(); await ws_manager.broadcast("update_skills"); return {
    "status": "success"}


@app.delete("/api/skills/{item_id}", dependencies=[Depends(verify_admin_key)])
async def delete_skill(item_id: int, db: Session = Depends(get_db)):
    i = db.query(SkillModel).filter(SkillModel.id == item_id).first()
    if i: db.delete(i); db.commit(); await ws_manager.broadcast("update_skills")
    return {"status": "deleted"}


@app.get("/api/admin/reviews", dependencies=[Depends(verify_admin_key)])
def get_all_reviews(db: Session = Depends(get_db)): return {"reviews": [
    {"id": r.id, "name": r.name, "username": r.username, "avatar_url": r.avatar_url,
     "avatar_initials": r.avatar_initials, "message": r.message, "rating": r.rating, "likes": r.likes,
     "is_telegram_verified": r.is_telegram_verified, "is_approved": r.is_approved, "created_at": r.created_at,
     "admin_reply": r.admin_reply} for r in db.query(ReviewModel).order_by(ReviewModel.id.desc()).all()]}


@app.get("/api/reviews")
def get_public_reviews(db: Session = Depends(get_db)): return {"reviews": [
    {"id": r.id, "name": r.name, "username": r.username, "avatar_url": r.avatar_url,
     "avatar_initials": r.avatar_initials, "message": r.message, "rating": r.rating, "likes": r.likes,
     "is_telegram_verified": r.is_telegram_verified, "created_at": r.created_at, "admin_reply": r.admin_reply} for r in
    db.query(ReviewModel).order_by(ReviewModel.id.desc()).all()]}


@app.post("/api/reviews/{review_id}/reply", dependencies=[Depends(verify_admin_key)])
async def post_owner_reply(review_id: int, data: OwnerReplySchema, db: Session = Depends(get_db)):
    r = db.query(ReviewModel).filter(ReviewModel.id == review_id).first()
    if r: r.admin_reply = data.reply.strip(); db.commit(); await ws_manager.broadcast("update_reviews")
    return {"status": "success"}


# FIXED: Delete Owner Reply correctly saves blank to DB
@app.delete("/api/reviews/{review_id}/reply", dependencies=[Depends(verify_admin_key)])
async def delete_owner_reply(review_id: int, db: Session = Depends(get_db)):
    r = db.query(ReviewModel).filter(ReviewModel.id == review_id).first()
    if r: r.admin_reply = ""; db.commit(); await ws_manager.broadcast("update_reviews")
    return {"status": "success"}


@app.post("/api/reviews")
async def submit_review(data: ReviewSchema, db: Session = Depends(get_db)):
    new_r = ReviewModel(name=data.name, username=data.username, message=data.message, rating=data.rating or 5)
    db.add(new_r);
    db.commit()
    return {"status": "pending_approval"}


@app.post("/api/reviews/{review_id}/like")
async def like_review(review_id: int, db: Session = Depends(get_db)):
    r = db.query(ReviewModel).filter(ReviewModel.id == review_id).first()
    if r: r.likes = (r.likes or 0) + 1; db.commit(); await ws_manager.broadcast("update_reviews")
    return {"status": "success"}


@app.delete("/api/admin/reviews/clear-all", dependencies=[Depends(verify_admin_key)])
async def clear_all_reviews(db: Session = Depends(get_db)):
    db.query(ReviewModel).delete();
    db.commit();
    await ws_manager.broadcast("update_reviews");
    return {"status": "success"}


@app.post("/api/contact")
def send_contact_message(data: ContactMessage):
    contact = data.get_contact_field()
    if TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID and TELEGRAM_BOT_TOKEN != "YOUR_TELEGRAM_BOT_TOKEN_HERE":
        cl = f"[https://t.me/](https://t.me/){contact.replace('@', '')}" if contact.startswith(
            "@") else f"mailto:{contact}"
        txt = f"📩 <b>New Message!</b>\n👤 {data.name}\n✉️ {contact}\n💬 {data.message}\n👉 <a href='{cl}'><b>Reply Direct</b></a>"
        try:
            requests.post(
                f"[https://api.telegram.org/bot](https://api.telegram.org/bot){TELEGRAM_BOT_TOKEN}/sendMessage",
                json={"chat_id": TELEGRAM_CHAT_ID, "text": txt, "parse_mode": "HTML"}, timeout=5)
        except Exception:
            pass
    return {"status": "success"}


@app.post("/api/chat")
def chat_with_gemini(request: ChatRequest, db: Session = Depends(get_db)):
    server_stats["ai_metrics"]["answered"] += 1;
    msg = request.message.strip()
    active_key = get_active_gemini_key(db)
    if not active_key: raise HTTPException(status_code=500, detail="No AI Key")
    try:
        # FIXED: gemini-1.5-flash is stable and perfectly works
        client = genai.Client(api_key=active_key)
        rules = db.query(AiKnowledgeModel).all()
        f_str = "\n".join([f"- {r.topic}: {r.fact}" for r in rules])
        sys_inst = f"You are Muxammadrizo's highly professional AI assistant. Do not write 100 word answers just for simple questions and greetings. If the user says 'hi' or 'hello', give a very short 1-sentence reply. Custom Knowledge:\n{f_str}"
        res = client.models.generate_content(model='gemini-3.6-flash', contents=f"{sys_inst}\n\nUser: {msg}")
        return {"response": res.text, "is_portfolio": True}
    except Exception as e:
        print(f"AI CHAT ERROR: {str(e)}")
        return {
            "response": "It looks like I'm taking a quick rest right now! 💤 Please reach out to Muxammadrizo directly on Telegram @muxammadrizo0125",
            "is_portfolio": True}