import cv2
import base64
import time

def capture_frame() -> dict:
    try:
        cap = cv2.VideoCapture(0)
        if not cap.isOpened():
            return {"success": False, "message": "No camera found", "frame": None}

        ret, frame = cap.read()
        cap.release()

        if not ret:
            return {"success": False, "message": "Failed to capture", "frame": None}

        _, buffer = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 70])
        b64 = base64.b64encode(buffer).decode('utf-8')
        return {"success": True, "frame": f"data:image/jpeg;base64,{b64}", "timestamp": time.time()}
    except Exception as e:
        return {"success": False, "message": str(e), "frame": None}
