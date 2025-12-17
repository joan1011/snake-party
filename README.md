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

## Testing

Run the test suite to verify everything works:

📘 **[Testing Guide](./TESTING.md)** - Complete testing documentation

**Quick Test:**
```bash
# Backend tests (6 tests)
cd backend && uv run pytest tests/ tests_integration/ -v

# Frontend tests (28 tests)
cd frontend && npm run test -- --run
```

## Deployment

Deploy to the cloud with Render:

📘 **[Quick Deploy Guide](./DEPLOY.md)** - One-click deployment with `render.yaml`

📘 **[Detailed Deployment Guide](./RENDER_DEPLOYMENT.md)** - Step-by-step manual setup

### Deploy Now
1. Push your code to GitHub
2. Go to [Render Dashboard](https://dashboard.render.com/)
3. Click **"New +"** → **"Blueprint"**
4. Connect your repository
5. Click **"Apply"**

Your app will be live in minutes! 🚀

## CI/CD Pipeline

Automated testing and deployment with GitHub Actions:

📘 **[CI/CD Setup Guide](./CI_CD_SETUP.md)** - Complete setup instructions

📘 **[Quick Reference](./CI_CD_QUICK_REF.md)** - Quick setup checklist

**Pipeline Features:**
- ✅ Automated testing (backend + frontend)
- ✅ Docker build validation
- ✅ Automatic deployment to Render on `main` branch
- ✅ Pull request testing

## Development

For local development without Docker, please see [backend/README.md](backend/README.md) and [frontend/README.md](frontend/README.md).

## Documentation

- [Testing Guide](./TESTING.md) - Test suite documentation
- [Deployment Guide](./DEPLOY.md) - Quick deployment reference
- [Detailed Deployment](./RENDER_DEPLOYMENT.md) - Step-by-step Render setup
- [CI/CD Setup](./CI_CD_SETUP.md) - GitHub Actions configuration
- [CI/CD Quick Reference](./CI_CD_QUICK_REF.md) - Quick setup checklist
