.PHONY: run test install lint clean

# Default target
run:
	uv run uvicorn app.main:app --reload

test:
	uv run pytest

install:
	uv sync

lint:
	uv run ruff check .

clean:
	find . -type d -name "__pycache__" -exec rm -rf {} +
	find . -type d -name ".pytest_cache" -exec rm -rf {} +
