import sys
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from datetime import datetime
from app.config import settings
from app.database import create_tables
from app.routers import auth, users, customers, plans, usage, recommendations, feedback, admin

# ── Create FastAPI Application ──────────────────────────────────────────────────

app = FastAPI(
    title="SmartTariff API",
    description="SmartTariff Backend — FastAPI + SQLite",
    version="2.0.0",
)

# ── CORS ────────────────────────────────────────────────────────────────────────

client_origins = [origin.strip() for origin in settings.client_url.split(",") if origin.strip()]
if "http://localhost:5173" not in client_origins:
    client_origins.append("http://localhost:5173")
if "http://127.0.0.1:5173" not in client_origins:
    client_origins.append("http://127.0.0.1:5173")

app.add_middleware(
    CORSMiddleware,
    allow_origins=client_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Exception Handler ──────────────────────────────────────────────────────────

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    from fastapi import HTTPException
    if isinstance(exc, HTTPException):
        return JSONResponse(
            status_code=exc.status_code,
            content={"success": False, "message": exc.detail},
        )
    print(f"❌ Unhandled error: {exc}")
    return JSONResponse(
        status_code=500,
        content={"success": False, "message": "Internal server error"},
    )

# ── Root & Health Check ─────────────────────────────────────────────────────────

@app.get("/")
def root():
    return {
        "success": True,
        "message": "SmartTariff API is running",
        "docs": "/docs",
        "health": "/api/v1/health",
        "version": "2.0.0",
    }

@app.get("/favicon.ico", include_in_schema=False)
@app.get("/favicon.png", include_in_schema=False)
def favicon():
    return JSONResponse(status_code=204, content=None)

@app.get("/api/v1/health")
def health_check():
    return {
        "success": True,
        "message": "SmartTariff API is running",
        "timestamp": datetime.utcnow().isoformat(),
        "environment": settings.node_env,
    }

# ── Register Routers ───────────────────────────────────────────────────────────

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(customers.router)
app.include_router(plans.router)
app.include_router(usage.router)
app.include_router(recommendations.router)
app.include_router(feedback.router)
app.include_router(admin.router)

# ── Startup ─────────────────────────────────────────────────────────────────────

@app.on_event("startup")
def on_startup():
    try:
        create_tables()
        print("================================================")
        print("🚀 SmartTariff Backend Server Running (FastAPI)")
        print(f"📡 Port:        {settings.port}")
        print(f"🌍 Environment: {settings.node_env}")
        print(f"🔗 Health Check: http://localhost:{settings.port}/api/v1/health")
        print(f"📚 Docs:        http://localhost:{settings.port}/docs")
        print("================================================")
    except Exception as e:
        print(f"⚠️ Startup warning: {e}")
