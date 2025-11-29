# Quick Vercel Deployment Guide

## Prerequisites

1. Vercel account: [vercel.com](https://vercel.com) (free)
2. GitHub repository connected

## Deployment Steps

### Option 1: Deploy via Vercel Dashboard (Easiest)

1. **Go to Vercel Dashboard**
   - Visit [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click "Add New..." → "Project"

2. **Import Repository**
   - Select `dicalvin/Cholera-Watch`
   - Click "Import"

3. **Configure Project**
   - **Framework Preset**: Vite (auto-detected)
   - **Root Directory**: `./` (leave as is)
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `dist` (auto-detected)
   - **Install Command**: `npm install` (auto-detected)

4. **Environment Variables** (Optional)
   - If deploying API separately, add:
     - `VITE_API_URL`: Your API URL

5. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes
   - Your site will be live at: `https://your-project.vercel.app`

### Option 2: Deploy via CLI

```bash
# Install Vercel CLI (if not installed)
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# For production deployment
vercel --prod
```

## API Deployment Options

### Option A: Deploy API Separately (Recommended)

Since Vercel serverless functions have limitations with large model files, deploy the API separately:

1. **Deploy to Render.com** (Free tier available)
   - Go to [render.com](https://render.com)
   - New → Web Service
   - Connect GitHub repo: `dicalvin/Cholera-Watch`
   - Root Directory: `api`
   - Build: `pip install -r requirements.txt`
   - Start: `python predict.py`
   - Get your API URL (e.g., `https://cholera-api.onrender.com`)

2. **Update Frontend**
   - In Vercel dashboard → Your project → Settings → Environment Variables
   - Add: `VITE_API_URL` = `https://cholera-api.onrender.com/api/predict`
   - Redeploy frontend

### Option B: Use Vercel Serverless Functions

The API is configured for Vercel serverless functions, but model files need to be uploaded:

1. **Upload Model Files**
   - Model files are too large for Git
   - Upload to Vercel via dashboard or use Vercel CLI:
     ```bash
     vercel env add MODEL_PATH
     ```

2. **Deploy**
   - Vercel will automatically detect `api/index.py` as a serverless function
   - Functions are available at `/api/predict` and `/health`

## After Deployment

1. **Test Frontend**
   - Visit your Vercel URL
   - Check all pages load correctly
   - Test navigation

2. **Test API**
   - Health: `https://your-project.vercel.app/health`
   - Or if separate: `https://your-api-url.com/health`

3. **Check Predictions**
   - Go to Early Warning page
   - Verify forecasts are loading
   - Check browser console for errors

## Continuous Deployment

Vercel automatically deploys on every push to `main`:
- Push to GitHub → Vercel detects → Auto-deploys → Live in 2-3 minutes

## Custom Domain

1. Vercel Dashboard → Your Project → Settings → Domains
2. Add your domain
3. Follow DNS instructions
4. SSL is automatic

## Troubleshooting

### API 404 Errors
- Check `vercel.json` configuration
- Verify `api/index.py` exists
- Check Vercel function logs in dashboard

### Model Not Found
- Upload model files to deployment platform
- Check `MODEL_PATH` in code
- Verify file paths

### CORS Errors
- Ensure `flask-cors` is installed
- Check API URL is correct
- Verify CORS is enabled in `predict.py`

