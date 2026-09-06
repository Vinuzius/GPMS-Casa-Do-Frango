from fastapi import FastAPI

from app.src.core.config import settings
from app.src.core.openapi import LICENSE_INFO, TAGS_METADATA
from app.src.core.routers import get_routers
  
app = FastAPI(
    title=settings.api_title,
    description=settings.api_description,
    version=settings.api_version,
    license_info=LICENSE_INFO,
    openapi_tags=TAGS_METADATA,
    docs_url="/api/docs",
)
app.include_router(get_routers())


