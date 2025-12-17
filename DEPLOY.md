# Quick Render Deployment Guide

## Option 1: One-Click Deploy with render.yaml (Recommended)

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Add Render deployment configuration"
   git push origin main
   ```

2. **Deploy to Render**
   - Go to https://dashboard.render.com/
   - Click **"New +"** → **"Blueprint"**
   - Connect your GitHub repository
   - Render will automatically detect `render.yaml` and create:
     - PostgreSQL database (`snake-party-db`)
     - Web service (`snake-party`)
   - Click **"Apply"**

3. **Done!** Your app will be live at `https://snake-party.onrender.com`

---

## Option 2: Manual Setup

See [RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md) for detailed step-by-step instructions.

---

## What Gets Deployed

- ✅ **Frontend**: React app (built and served via Nginx)
- ✅ **Backend**: FastAPI on port 8000
- ✅ **Database**: PostgreSQL (managed by Render)
- ✅ **Migrations**: Run automatically on startup
- ✅ **Health Check**: `/api/health` endpoint

---

## Important URLs

After deployment:
- **App**: `https://your-service-name.onrender.com`
- **API Docs**: `https://your-service-name.onrender.com/docs`
- **Health Check**: `https://your-service-name.onrender.com/api/health`

---

## Free Tier Notes

⚠️ **Spin Down**: Free services sleep after 15 minutes of inactivity
- First request after sleep takes ~30-60 seconds
- Subsequent requests are instant

💡 **Tip**: Upgrade to Starter ($7/month) for always-on service

---

## Troubleshooting

### Build fails?
Check build logs in Render dashboard for errors.

### Database connection issues?
The `start.sh` script automatically transforms the DATABASE_URL to the correct format (`postgresql+asyncpg://`).

### App not responding?
Check application logs in Render dashboard.

---

## Next Steps

1. ✅ Deploy to Render
2. 🎯 Test your app at the Render URL
3. 🎯 Add custom domain (optional)
4. 🎯 Set up monitoring alerts

---

**Need help?** See [RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md) for detailed documentation.
