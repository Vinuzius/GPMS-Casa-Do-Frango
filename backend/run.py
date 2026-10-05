from pathlib import Path

import uvicorn

BACKEND_DIR = str(Path(__file__).resolve().parent)

if __name__ == "__main__":
    uvicorn.run("app.main:app", reload=True, app_dir=BACKEND_DIR, reload_dirs=[BACKEND_DIR])
