from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
from llm_agent import ask_llm, parse_action
from hardware_sim import HardwareSimulator
from apps import camera_app, weather_app, music_app, photo_app

app = FastAPI(title="Hardware LLM Demo")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

hw = HardwareSimulator()

@app.post("/chat")
async def chat(payload: dict):
    user_input = payload.get("message", "")
    hw_status  = hw.get_status().get("hardware", {})
    llm_response = ask_llm(user_input, hw_context=hw_status)
    action = parse_action(llm_response)
    hw_result = hw.execute(action)
    return {"response": llm_response, "action": action, "hardware": hw_result}

@app.get("/hardware/status")
def hardware_status():
    return hw.get_status()

@app.post("/hardware/{device}/{action}")
def control_device(device: str, action: str, value: float = None):
    result = hw.execute({"device": device, "action": action, "value": value})
    return result

@app.get("/weather")
def get_weather(city: str = "default"):
    return weather_app.get_weather(city)

@app.get("/camera/capture")
def capture():
    return camera_app.capture_frame()

@app.get("/camera/stream-url")
def stream_url():
    return {"url": "/camera/stream"}

@app.get("/music/list")
def music_list():
    return music_app.list_tracks()

@app.post("/music/{action}")
def music_control(action: str, track: str = None):
    return music_app.control(action, track)

@app.get("/photos/list")
def photos_list():
    return photo_app.list_photos()

@app.post("/photos/upload")
async def upload_photo(file: UploadFile = File(...)):
    return await photo_app.save_photo(file)

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
