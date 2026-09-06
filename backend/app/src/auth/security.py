from functools import lru_cache

import jwt
from jwt import PyJWKClient

from backend.app.src.core.config import settings


@lru_cache
def get_jwks_client() -> PyJWKClient:
    return PyJWKClient(settings.supabase_jwks_url)


def decode_token(token: str) -> dict:
    signing_key = get_jwks_client().get_signing_key_from_jwt(token)
    algorithm = jwt.get_unverified_header(token)["alg"]

    return jwt.decode(
        token,
        signing_key.key,
        algorithms=[algorithm],
        audience="authenticated",
    )
