import sys

from app.src.auth.security import decode_token


def main():
    if len(sys.argv) != 2:
        print("Uso: python3 scripts/testar_token.py <token>")
        sys.exit(1)

    token = sys.argv[1]

    try:
        payload = decode_token(token)
    except Exception as erro:
        print(f"Token inválido: {type(erro).__name__}: {erro}")
        sys.exit(1)

    print("Token válido! Payload decodificado:\n")
    for chave, valor in payload.items():
        print(f"{chave}: {valor}")


if __name__ == "__main__":
    main()
