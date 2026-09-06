import json
import sys
import urllib.error
import urllib.request

SUPABASE_URL = "https://rxmkfnyqcllvzahhdbpp.supabase.co"


def main():
    if len(sys.argv) != 4:
        print("Uso: python3 scripts/login_teste.py <email> <senha> <anon_key>")
        sys.exit(1)

    email, senha, anon_key = sys.argv[1:4]

    body = json.dumps({"email": email, "password": senha}).encode()
    request = urllib.request.Request(
        f"{SUPABASE_URL}/auth/v1/token?grant_type=password",
        data=body,
        headers={"apikey": anon_key, "Content-Type": "application/json"},
        method="POST",
    )

    try:
        with urllib.request.urlopen(request) as response:
            dados = json.load(response)
    except urllib.error.HTTPError as erro:
        print(f"Login falhou ({erro.code}): {erro.read().decode()}")
        sys.exit(1)

    print("Login OK!\n")
    print("access_token:")
    print(dados["access_token"])


if __name__ == "__main__":
    main()
