from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.engine import make_url
from sqlalchemy.orm import Session, sessionmaker

from app.src.core.config import settings

# Driver fixado: o padrão de "postgresql://" muda entre versões do SQLAlchemy
# (a 2.1 passou a procurar o psycopg 3, que não usamos).
database_url = make_url(settings.database_url).set(drivername="postgresql+psycopg2")

engine = create_engine(database_url, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
