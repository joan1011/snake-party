#!/bin/bash
set -e

echo "Starting Snake Party Application..."

# Transform DATABASE_URL if needed (Render provides postgresql://, we need postgresql+asyncpg://)
if [[ "$DATABASE_URL" == postgresql://* ]]; then
    export DATABASE_URL="${DATABASE_URL/postgresql:\/\//postgresql+asyncpg:\/\/}"
    echo "Transformed DATABASE_URL to use asyncpg driver"
fi

# Run database migrations
echo "Running database migrations..."
uv run alembic upgrade head

# Start FastAPI backend in background
echo "Starting FastAPI backend on port 8000..."
uv run uvicorn app.main:app --host 127.0.0.1 --port 8000 &

# Wait a moment for backend to start
sleep 2

# Start Nginx in foreground
echo "Starting Nginx on port 80..."
nginx -g 'daemon off;'
