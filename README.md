# Snake Party Application

A full-stack Snake game application involving a React Frontend, FastAPI Backend, and PostgreSQL Database.

## Quick Start (Docker)

The easiest way to run the entire application is using Docker Compose.

### Prerequisites
- Docker & Docker Compose installed

### Run Command
To start all services (Database, Backend, Frontend):

```bash
docker compose up
```

- **Frontend**: [http://localhost](http://localhost)
- **Backend API**: [http://localhost:8000](http://localhost:8000)
- **API Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)

### Rebuild
If you make code changes and want to update the containers:

```bash
docker compose up --build
```

### Stop
To stop running containers:

```bash
docker compose down
```

## Development

For local development without Docker, please see [backend/README.md](backend/README.md) and [frontend/README.md](frontend/README.md).
