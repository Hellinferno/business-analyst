from fastapi import APIRouter

from app.api.v1.routes import auth, documents, elicitation, process_maps, uat

api_router = APIRouter(prefix="/v1")

api_router.include_router(auth.router)
api_router.include_router(elicitation.router)
api_router.include_router(documents.router)
api_router.include_router(process_maps.router)
api_router.include_router(uat.router)
