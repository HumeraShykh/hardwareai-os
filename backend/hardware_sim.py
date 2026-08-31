import random
import time

class HardwareSimulator:
    def __init__(self):
        self.state = {
            "led":         {"status": "off", "brightness": 0},
            "fan":         {"status": "off", "speed": 0},
            "motor":       {"status": "off", "speed": 0},
            "buzzer":      {"status": "off"},
            "temperature_sensor": {"value": 24.5, "unit": "°C"},
            "humidity_sensor":    {"value": 58.0, "unit": "%"},
        }

    def execute(self, action: dict) -> dict:
        device = action.get("device", "none")
        act    = action.get("action", "none")
        value  = action.get("value")

        if device == "all" and act == "status":
            return self.get_status()

        if device not in self.state:
            return {"success": False, "message": f"Unknown device: {device}"}

        d = self.state[device]

        if act == "on":
            d["status"] = "on"
            if "speed" in d:      d["speed"] = 100
            if "brightness" in d: d["brightness"] = 100

        elif act == "off":
            d["status"] = "off"
            if "speed" in d:      d["speed"] = 0
            if "brightness" in d: d["brightness"] = 0

        elif act == "set" and value is not None:
            d["status"] = "on" if value > 0 else "off"
            if "speed" in d:      d["speed"] = float(value)
            if "brightness" in d: d["brightness"] = float(value)

        elif act == "read":
            # Simulate live sensor fluctuation
            if device == "temperature_sensor":
                d["value"] = round(24.5 + random.uniform(-2, 2), 1)
            elif device == "humidity_sensor":
                d["value"] = round(58.0 + random.uniform(-5, 5), 1)

        return {"success": True, "device": device, "state": d}

    def get_status(self) -> dict:
        # Simulate sensor drift on every status poll
        self.state["temperature_sensor"]["value"] = round(24.5 + random.uniform(-2, 2), 1)
        self.state["humidity_sensor"]["value"]    = round(58.0 + random.uniform(-5, 5), 1)
        return {"success": True, "hardware": self.state}
