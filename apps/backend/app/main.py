import sys
from pathlib import Path

# Add project root to sys.path
root_dir = Path(__file__).resolve().parents[3]
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from apps.backend.app.api.routes import router

app = FastAPI(
    title="Bharat Adaptive Banking Backend",
    version="1.0.0",
    description="Harsh's Backend Service - Consumes CustomerState, Composes ExperienceConfig for Lakshya's UI"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)

from fastapi.responses import FileResponse

@app.get("/inspector")
def get_ai_inspector():
    inspector_path = root_dir / "ai" / "inspector.html"
    return FileResponse(inspector_path, media_type="text/html")

@app.get("/voice-inspector")
def get_voice_inspector():
    voice_path = root_dir / "ai" / "voice_inspector.html"
    return FileResponse(voice_path, media_type="text/html")

@app.get("/health")
def health():
    return {
        "status": "healthy",
        "service": "backend",
        "team_role": "Harsh (Backend Owner)",
        "contracts_status": "enforced"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("apps.backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
