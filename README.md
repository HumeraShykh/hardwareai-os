# HardwareAI OS — Offline LLM Demo

> Full-stack offline LLM system with hardware simulation + built-in apps

## Quick Start

```bash
# 1. Install Ollama (one time)
brew install ollama
ollama pull llama3.2

# 2. Run everything
chmod +x start.sh && ./start.sh

# 3. Open browser
open http://localhost:5173
```

## Apps Included

| App | Description |
|---|---|
| 🔧 Hardware | LLM-controlled LED, Fan, Motor, Buzzer, Sensors |
| 📷 Camera | Live webcam capture & streaming |
| 🌤️ Weather | Offline simulated weather (Karachi/Lahore/Islamabad) |
| 🎵 Music | Music player with track list |
| 🖼️ Photos | Photo gallery with upload |

## Demo Commands (AI Terminal)

```
"Turn on the LED"
"Set fan speed to 75%"
"What's the temperature?"
"Is everything running ok?"
"Shut down all devices"
"Open camera"
"Show weather"
"Play music"
```

## Stack
- **LLM**: Ollama + Llama 3.2 (fully offline)
- **Backend**: FastAPI + Python
- **Frontend**: React + Vite + Tailwind CSS
- **Hardware**: Simulated GPIO (swap real RPi/Jetson GPIO with 1 line)
