# Render Deployment Guide for Snake Party

This guide will walk you through deploying your Snake Party application to Render.

## Overview

Your application consists of:
- **Frontend**: React application (built and served via Nginx)
- **Backend**: FastAPI application
- **Database**: PostgreSQL database

On Render, we'll deploy this as:
1. **PostgreSQL Database** (Managed Database)
2. **Web Service** (Docker container with Frontend + Backend + Nginx)

---

## Prerequisites

1. A [Render account](https://render.com) (free tier available)
2. Your code pushed to a Git repository (GitHub, GitLab, or Bitbucket)
3. This repository connected to Render

---

## Step 1: Push Your Code to Git

If you haven't already, push your code to GitHub:

```bash
git add .
git commit -m "Prepare for Render deployment"
git push origin main
```

---

## Step 2: Create PostgreSQL Database on Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"PostgreSQL"**
3. Configure the database:
   - **Name**: `snake-party-db` (or your preferred name)
   - **Database**: `snakedb`
   - **User**: `user` (or your preferred username)
   - **Region**: Choose closest to your users
   - **Plan**: Free (or paid for production)
4. Click **"Create Database"**
5. **IMPORTANT**: Save the **Internal Database URL** - you'll need this for your web service

The Internal Database URL will look like:
```
postgresql://user:password@dpg-xxxxx-a/snakedb
```

---

## Step 3: Create Web Service on Render

1. In Render Dashboard, click **"New +"** → **"Web Service"**
2. Connect your Git repository
3. Configure the service:

### Basic Settings
- **Name**: `snake-party`
- **Region**: Same as your database
- **Branch**: `main` (or your default branch)
- **Root Directory**: Leave empty (uses repository root)
- **Runtime**: `Docker`

### Build & Deploy Settings
- **Dockerfile Path**: `./Dockerfile`
- Render will automatically detect your Dockerfile

### Environment Variables

Click **"Advanced"** and add these environment variables:

| Key | Value |
|-----|-------|
| `DATABASE_URL` | `postgresql+asyncpg://user:password@your-db-host/snakedb` |

> **Note**: Replace the `DATABASE_URL` value with your Internal Database URL from Step 2, but change the protocol from `postgresql://` to `postgresql+asyncpg://` (required for async SQLAlchemy).

**Example**:
- Render gives you: `postgresql://user:abc123@dpg-xxxxx-a/snakedb`
- You should use: `postgresql+asyncpg://user:abc123@dpg-xxxxx-a/snakedb`

### Instance Type
- **Free** (for testing) or **Starter** ($7/month for production)

### Advanced Settings (Optional but Recommended)
- **Health Check Path**: `/api/health` (if you have a health endpoint)
- **Auto-Deploy**: Yes (deploys automatically on git push)

4. Click **"Create Web Service"**

---

## Step 4: Wait for Deployment

Render will:
1. Clone your repository
2. Build your Docker image (this takes 5-10 minutes first time)
3. Run database migrations via `start.sh`
4. Start your application

You can monitor the build logs in real-time on the Render dashboard.

---

## Step 5: Access Your Application

Once deployed, Render provides a URL like:
```
https://snake-party.onrender.com
```

- **Frontend**: `https://snake-party.onrender.com`
- **API Docs**: `https://snake-party.onrender.com/docs`
- **API**: `https://snake-party.onrender.com/api/*`

---

## Important Notes

### Free Tier Limitations
- **Spin Down**: Free services spin down after 15 minutes of inactivity
- **Spin Up**: First request after spin-down takes 30-60 seconds
- **Database**: Free PostgreSQL expires after 90 days
- **Bandwidth**: 100 GB/month

### Database Migrations
Your `start.sh` script automatically runs migrations on startup:
```bash
uv run alembic upgrade head
```

### Environment Variables
If you need additional environment variables (API keys, secrets, etc.), add them in the Render dashboard under **Environment** → **Environment Variables**.

---

## Troubleshooting

### Build Fails
- Check build logs in Render dashboard
- Ensure all dependencies are in `pyproject.toml` and `package.json`
- Verify Dockerfile builds locally: `docker build -t snake-party .`

### Database Connection Issues
- Verify `DATABASE_URL` uses `postgresql+asyncpg://` protocol
- Check database is in the same region as web service
- Ensure database is not suspended (free tier)

### Application Won't Start
- Check application logs in Render dashboard
- Verify migrations ran successfully
- Check that port 80 is exposed in Dockerfile (already configured)

### 502 Bad Gateway
- Backend might not be starting properly
- Check logs for Python errors
- Verify uvicorn is running on port 8000

---

## Updating Your Application

To deploy updates:

1. Make your code changes locally
2. Commit and push to Git:
   ```bash
   git add .
   git commit -m "Your update message"
   git push origin main
   ```
3. Render automatically rebuilds and deploys (if Auto-Deploy is enabled)

---

## Custom Domain (Optional)

To use your own domain:

1. Go to your web service settings
2. Click **"Custom Domains"**
3. Add your domain
4. Update your DNS records as instructed by Render
5. Render provides free SSL certificates automatically

---

## Monitoring & Logs

- **Logs**: Available in Render dashboard under your service
- **Metrics**: CPU, Memory, and Request metrics available
- **Alerts**: Set up email alerts for service failures

---

## Cost Estimate

### Free Tier (Development/Testing)
- Web Service: Free (with spin-down)
- PostgreSQL: Free (90 days)
- **Total**: $0/month

### Starter Tier (Production)
- Web Service: $7/month (always on)
- PostgreSQL: $7/month (persistent)
- **Total**: $14/month

---

## Next Steps

1. ✅ Create PostgreSQL database on Render
2. ✅ Create Web Service on Render
3. ✅ Configure environment variables
4. ✅ Deploy and test
5. 🎯 Set up custom domain (optional)
6. 🎯 Configure monitoring and alerts
7. 🎯 Set up CI/CD for automated testing

---

## Support

- [Render Documentation](https://render.com/docs)
- [Render Community](https://community.render.com/)
- [Render Status](https://status.render.com/)

---

**Happy Deploying! 🚀**
