# Snake Party Backend

FastAPI backend for Snake Party, featuring real-time game logic, leaderboards, and spectator modes.

## Prerequisites

- [uv](https://github.com/astral-sh/uv) (for ultra-fast python package management)
- Python 3.12+

## Installation

Install dependencies:

```bash
uv sync
```

## Running the Server

Start the development server with hot-reload:

```bash
uv run uvicorn app.main:app --reload
```

The API will be accessible at: http://localhost:8000
API Documentation: http://localhost:8000/docs

## Running Tests

Execute the test suite:

```bash
uv run pytest
```

## Project Structure

- `app/`: Application source code
  - `routers/`: API endpoints (auth, leaderboard, stats, spectator)
  - `models.py`: Pydantic data models
  - `database.py`: Mock in-memory database
- `tests/`: pytest test suite
