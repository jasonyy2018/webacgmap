from fastapi import FastAPI
from .config import settings
from .db import engine, init_db
from fastapi.middleware.cors import CORSMiddleware
from .api.endpoints import leads, search
from .services.maps_service import MapsService
from .services.ai_service import AIService

# Service Initializations for debug endpoint
maps_service = MapsService()
ai_service = AIService()

app = FastAPI(
    title=settings.app_name,
    debug=settings.debug
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=False if "*" in settings.cors_origins else True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(leads.router, prefix="/leads", tags=["leads"])
app.include_router(search.router, prefix="/leads/search", tags=["search"])

@app.on_event("startup")
def on_startup():
    init_db()

@app.get("/")
def read_root():
    return {"status": "online", "message": f"{settings.app_name} API"}

@app.get("/debug/status")
def debug_status():
    return {
        "api_key_configured": len(settings.google_api_key) > 5 if settings.google_api_key else False,
        "maps_service_active": maps_service.gmaps is not None,
        "ai_service_active": ai_service.model is not None,
        "database_url": settings.database_url
    }
