# 🚀 Quick CI/CD Reference

## Setup Checklist

- [ ] Push code to GitHub
- [ ] Get Render API Key from [Account Settings](https://dashboard.render.com/account/settings)
- [ ] Get Render Service ID from service URL (`srv-xxxxx`)
- [ ] Add `RENDER_API_KEY` to GitHub Secrets
- [ ] Add `RENDER_SERVICE_ID` to GitHub Secrets
- [ ] Push to `main` branch to trigger deployment

## GitHub Secrets

Go to: **Repository Settings** → **Secrets and variables** → **Actions** → **New repository secret**

| Secret Name | Where to Find |
|-------------|---------------|
| `RENDER_API_KEY` | Render Dashboard → Account Settings → API Keys |
| `RENDER_SERVICE_ID` | Service URL: `https://dashboard.render.com/web/srv-XXXXX` |

## Pipeline Triggers

| Event | Tests Run | Deploy |
|-------|-----------|--------|
| Push to `main` | ✅ All | ✅ Yes |
| Push to `develop` | ✅ All | ❌ No |
| Pull Request | ✅ All | ❌ No |

## What Gets Tested

### Backend (6 tests)
- ✅ API endpoints
- ✅ Authentication flow
- ✅ Leaderboard & scores
- ✅ Database integration

### Frontend (28 tests)
- ✅ Game logic
- ✅ State management
- ✅ Collision detection
- ✅ Production build

### Docker
- ✅ Image builds successfully

## Pipeline Flow

```
Push to GitHub
    ↓
┌───────────────────────────────┐
│  Run Tests in Parallel        │
│  • Backend Tests (PostgreSQL) │
│  • Frontend Tests (Vitest)    │
└───────────────┬───────────────┘
                ↓
        ┌───────────────┐
        │ Docker Build  │
        └───────┬───────┘
                ↓
        ┌───────────────┐
        │ All Pass?     │
        └───┬───────┬───┘
            │       │
           Yes      No
            │       │
            ↓       ↓
    ┌───────────┐  ❌
    │ Deploy to │  Stop
    │  Render   │
    └───────────┘
         ✅
```

## Deployment Only Happens When:

1. ✅ Branch is `main`
2. ✅ Event is `push` (not PR)
3. ✅ All tests pass
4. ✅ Docker build succeeds

## View Pipeline Status

**GitHub:** Repository → Actions tab

**Render:** [Dashboard](https://dashboard.render.com/)

## Manual Deployment

If you need to deploy without pushing to `main`:

### Option 1: Via Render Dashboard
1. Go to your service
2. Click **Manual Deploy** → **Deploy latest commit**

### Option 2: Via GitHub Actions
1. Go to **Actions** tab
2. Select **CI/CD Pipeline**
3. Click **Run workflow**
4. Select branch and run

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Tests fail | Check logs in Actions tab |
| Deployment fails | Verify GitHub Secrets are correct |
| Build fails | Test Docker build locally: `docker build -t test .` |
| Secrets not working | Re-create secrets (copy-paste carefully) |

## Test Locally Before Pushing

```bash
# Backend tests
cd backend
uv run pytest tests/ tests_integration/ -v

# Frontend tests
cd frontend
npm run test -- --run
npm run lint
npm run build

# Docker build
docker build -t snake-party:test .
```

## Skip CI

Add to commit message:
```bash
git commit -m "Update docs [skip ci]"
```

## Useful Commands

```bash
# View recent workflow runs
gh run list

# View specific run
gh run view <run-id>

# View logs
gh run view <run-id> --log

# Re-run failed jobs
gh run rerun <run-id>
```

## Cost

- **GitHub Actions:** Free (2,000 min/month for private repos)
- **Render Deployments:** Free (included in plan)
- **Pipeline Duration:** ~5-10 minutes per run

## Next Steps

1. ✅ Set up secrets
2. ✅ Push to `main`
3. 🎯 Monitor deployment
4. 🎯 Add more tests
5. 🎯 Set up staging environment

---

**Need Help?** See [CI_CD_SETUP.md](./CI_CD_SETUP.md) for detailed guide.
