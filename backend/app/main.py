from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from .config import settings
from .database import init_db
from .api.tasks import router as tasks_router
from .api.dependencies import router as dependencies_router
from .api.ai_suggestions import router as ai_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(
    title="TaskFlow Pro API",
    description="DAG-powered Kanban board with CPM scheduling and secure AI suggestions",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS configuration
origins = [o.strip() for o in settings.cors_origins.split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(HTTPException)
async def custom_http_exception_handler(request: Request, exc: HTTPException):
    if isinstance(exc.detail, dict):
        content = {
            "error": exc.detail.get("error", "http_error"),
            "message": exc.detail.get("message", str(exc.detail)),
            "detail": exc.detail.get("detail"),
        }
    else:
        content = {
            "error": "http_error",
            "message": str(exc.detail),
            "detail": None,
        }
    return JSONResponse(status_code=exc.status_code, content=content)


# Mount routers under /api/v1
app.include_router(tasks_router, prefix="/api/v1")
app.include_router(dependencies_router, prefix="/api/v1")
app.include_router(ai_router, prefix="/api/v1")


@app.get("/health")
async def health():
    return {"status": "ok", "app": "TaskFlow Pro"}


@app.get("/")
async def root():
    return {"message": "TaskFlow Pro API is running. Explore docs at /docs"}
