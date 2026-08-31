#!/bin/bash
echo "🚀 Starting HardwareAI OS Demo..."

# Start backend
cd backend
pip install -r requirements.txt -q
uvicorn main:app --reload --port 8000 &
BACKEND_PID=$!
echo "✅ Backend running on http://localhost:8000"

# Start frontend
cd ../frontend
npm run dev &
FRONTEND_PID=$!
echo "✅ Frontend running on http://localhost:5173"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  🤖 HardwareAI OS is LIVE!"
echo "  Open: http://localhost:5173"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "NOTE: For LLM, run: ollama pull llama3.2"
echo "Press Ctrl+C to stop all services"

wait
