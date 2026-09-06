from fastapi import APIRouter

def get_routers():
    api_router = APIRouter()
    
    @api_router.get("/health", tags=["Health"])
    def health_check():
        return {"status": "ok"}

    
    return api_router