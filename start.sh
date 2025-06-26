#!/bin/bash

# Activate virtual environment and install Python dependencies
echo "Setting up Python environment..."
source venv/bin/activate
pip install -r requirements.txt

# Start Flask API in background
echo "Starting Python Flask API on port 5000..."
cd api
python extract_pdf.py &
FLASK_PID=$!
cd ..

# Wait a moment for Flask to start
sleep 2

# Start Next.js development server
echo "Starting Next.js development server on port 3000..."
npm run dev &
NEXTJS_PID=$!

echo "Both servers are running:"
echo "- Flask API: http://localhost:5001"
echo "- Next.js App: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop both servers"

# Function to cleanup background processes
cleanup() {
    echo "Stopping servers..."
    kill $FLASK_PID 2>/dev/null
    kill $NEXTJS_PID 2>/dev/null
    exit
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Wait for background processes
wait 