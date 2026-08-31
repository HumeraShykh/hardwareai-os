import os
import shutil
import base64
from fastapi import UploadFile

PHOTOS_DIR = os.path.join(os.path.dirname(__file__), "photos")
os.makedirs(PHOTOS_DIR, exist_ok=True)

def list_photos() -> dict:
    files = [f for f in os.listdir(PHOTOS_DIR) if f.lower().endswith(('.jpg', '.jpeg', '.png'))]
    photos = []
    for f in files:
        path = os.path.join(PHOTOS_DIR, f)
        with open(path, "rb") as img:
            b64 = base64.b64encode(img.read()).decode("utf-8")
        ext = f.split(".")[-1].lower()
        mime = "jpeg" if ext in ("jpg", "jpeg") else "png"
        photos.append({"name": f, "data": f"data:image/{mime};base64,{b64}"})
    return {"success": True, "photos": photos, "count": len(photos)}

async def save_photo(file: UploadFile) -> dict:
    dest = os.path.join(PHOTOS_DIR, file.filename)
    with open(dest, "wb") as f:
        shutil.copyfileobj(file.file, f)
    return {"success": True, "saved": file.filename}
