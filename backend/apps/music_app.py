import os
import glob

MUSIC_DIR = os.path.join(os.path.dirname(__file__), "music_files")

# In-memory player state
player = {"current": None, "status": "stopped", "volume": 70}

def list_tracks() -> dict:
    files = glob.glob(os.path.join(MUSIC_DIR, "*.mp3")) + \
            glob.glob(os.path.join(MUSIC_DIR, "*.wav"))
    tracks = [os.path.basename(f) for f in files]
    # Add demo tracks if folder is empty
    if not tracks:
        tracks = ["demo_track_1.mp3", "demo_track_2.mp3", "ambient_hardware.mp3"]
    return {"success": True, "tracks": tracks, "player": player}

def control(action: str, track: str = None) -> dict:
    if action == "play":
        player["status"] = "playing"
        player["current"] = track or "demo_track_1.mp3"
    elif action == "pause":
        player["status"] = "paused"
    elif action == "stop":
        player["status"] = "stopped"
        player["current"] = None
    elif action == "next":
        player["status"] = "playing"
        player["current"] = "demo_track_2.mp3"
    elif action == "volume" and track:
        player["volume"] = int(track)
    return {"success": True, "player": player}
