from datetime import datetime

CITIES = {
    "karachi": {
        "temp": 34, "condition": "Sunny", "humidity": 65, "wind": 18,
        "forecast": [
            {"day": "Mon", "high": 35, "low": 27, "condition": "Sunny"},
            {"day": "Tue", "high": 36, "low": 28, "condition": "Hot & Hazy"},
            {"day": "Wed", "high": 34, "low": 27, "condition": "Sunny"},
        ]
    },
    "lahore": {
        "temp": 38, "condition": "Hot & Hazy", "humidity": 45, "wind": 12,
        "forecast": [
            {"day": "Mon", "high": 39, "low": 28, "condition": "Hot & Hazy"},
            {"day": "Tue", "high": 37, "low": 27, "condition": "Partly Cloudy"},
            {"day": "Wed", "high": 38, "low": 28, "condition": "Sunny"},
        ]
    },
    "islamabad": {
        "temp": 28, "condition": "Light Rain", "humidity": 71, "wind": 5,
        "forecast": [
            {"day": "Mon", "high": 31, "low": 23, "condition": "Light Rain"},
            {"day": "Tue", "high": 29, "low": 22, "condition": "Sunny"},
            {"day": "Wed", "high": 29, "low": 23, "condition": "Sunny"},
            {"day": "Thu", "high": 31, "low": 23, "condition": "Sunny"},
            {"day": "Fri", "high": 28, "low": 21, "condition": "Thunderstorm"},
            {"day": "Sat", "high": 29, "low": 22, "condition": "Partly Cloudy"},
            {"day": "Sun", "high": 30, "low": 22, "condition": "Sunny"},
        ]
    },
    "default": {
        "temp": 27, "condition": "Clear", "humidity": 50, "wind": 15,
        "forecast": [
            {"day": "Mon", "high": 28, "low": 22, "condition": "Clear"},
            {"day": "Tue", "high": 27, "low": 21, "condition": "Cloudy"},
            {"day": "Wed", "high": 26, "low": 20, "condition": "Windy"},
        ]
    },
}

def get_weather(city: str = "default") -> dict:
    base = CITIES.get(city.lower(), CITIES["default"])
    return {
        "success":     True,
        "city":        city.title() if city != "default" else "Local",
        "temperature": base["temp"],
        "condition":   base["condition"],
        "humidity":    base["humidity"],
        "wind_kmh":    base["wind"],
        "updated":     datetime.now().strftime("%H:%M"),
        "forecast":    base["forecast"],
    }
