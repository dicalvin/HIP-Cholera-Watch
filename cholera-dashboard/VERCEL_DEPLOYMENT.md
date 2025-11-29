# Vercel Deployment Guide

This guide covers deploying both the React frontend and Flask API to Vercel.

## Prerequisites

1. Vercel account (sign up at [vercel.com](https://vercel.com))
2. Vercel CLI installed: `npm install -g vercel`

## Option 1: Deploy via Vercel Dashboard (Recommended)

### Step 1: Deploy Frontend

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "Add New..." → "Project"
3. Import your GitHub repository: `dicalvin/Cholera-Watch`
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (root)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Click "Deploy"

### Step 2: Deploy API as Separate Service

1. In Vercel dashboard, click "Add New..." → "Project" again
2. Import the same repository: `dicalvin/Cholera-Watch`
3. Configure:
   - **Framework Preset**: Other
   - **Root Directory**: `api`
   - **Build Command**: `pip install -r requirements.txt` (or leave empty)
   - **Output Directory**: Leave empty
4. Add environment variables:
   - `PYTHON_VERSION`: `3.11`
5. Click "Deploy"

**Note**: For the API, you may need to use Vercel's serverless functions. See Option 2 below.

## Option 2: Deploy API as Serverless Function

Vercel supports Python serverless functions. The API is configured to work with this.

### Configuration

The `api/` folder contains:
- `index.py` - Serverless function entry point
- `predict.py` - Main Flask app
- `vercel.json` - Vercel configuration

### Deploy

1. Deploy the entire project (frontend + API):
   ```bash
   vercel
   ```
2. Follow the prompts to link your project
3. Vercel will automatically detect and deploy both frontend and API

## Option 3: Deploy API Separately (Alternative)

If serverless functions don't work well, deploy the API to a separate service:

### Render.com (Recommended for API)

1. Go to [render.com](https://render.com)
2. Create new "Web Service"
3. Connect GitHub repo: `dicalvin/Cholera-Watch`
4. Configure:
   - **Root Directory**: `api`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `python predict.py`
   - **Environment**: Python 3
5. Get your API URL (e.g., `https://cholera-api.onrender.com`)

6. Update frontend environment variable:
   - In Vercel dashboard → Your project → Settings → Environment Variables
   - Add: `VITE_API_URL` = `https://cholera-api.onrender.com/api/predict`
   - Redeploy frontend

## Environment Variables

### Frontend (Vercel)

Add these in Vercel dashboard → Settings → Environment Variables:

- `VITE_API_URL` (optional): Your API URL if deployed separately
  - If API is on same Vercel project: Leave empty (uses `/api/predict`)
  - If API is on Render/Railway: Set to full URL

### API (if deployed separately)

- `PORT`: Usually set automatically by platform
- `PYTHON_VERSION`: `3.11` (for Vercel)

## Model Files

**Important**: Model files (`.pkl`) are in `.gitignore` because they're large.

### Option A: Upload to Deployment Platform

1. **For Render/Railway**: Use their file upload or connect via SSH
2. **For Vercel**: Use Vercel CLI to upload:
   ```bash
   vercel env add MODEL_PATH
   # Or upload via dashboard
   ```

### Option B: Use GitHub Releases

1. Create a GitHub Release
2. Attach model files as release assets
3. Download in deployment setup script

### Option C: Store in Cloud Storage

1. Upload to AWS S3, Google Cloud Storage, etc.
2. Download in deployment script using API keys

## Testing Deployment

### Frontend
- Visit your Vercel URL: `https://your-project.vercel.app`
- Check that all pages load
- Test navigation

### API
- Health check: `https://your-api-url.vercel.app/health`
- Test prediction: Use the Early Warning page or:
  ```bash
  curl -X POST https://your-api-url.vercel.app/api/predict \
    -H "Content-Type: application/json" \
    -d '{"suspected": 100, "confirmed": 50, "deaths": 2, "month": 6, "year": 2024, "cfr": 4.0, "positivity": 50.0, "region": "Central", "historicalSuspected": [80, 85, 90, 95, 100]}'
  ```

## Troubleshooting

### API returns 404
- Check that `api/` folder is properly configured
- Verify `vercel.json` routes are correct
- Check Vercel function logs

### CORS errors
- Ensure `flask-cors` is installed
- Check that `CORS(app)` is in `predict.py`
- Verify API URL is correct

### Model not found
- Upload model files to deployment platform
- Check `MODEL_PATH` in `predict.py`
- Verify file paths are correct for deployment environment

### Predictions are 0
- Check browser console for errors
- Verify API is accessible
- Check API logs in Vercel dashboard
- Test API endpoint directly

## Continuous Deployment

Vercel automatically deploys on every push to `main` branch:
1. Push to GitHub: `git push origin main`
2. Vercel detects changes
3. Automatically builds and deploys
4. You get a preview URL for each deployment

## Custom Domain

1. In Vercel dashboard → Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions
4. Vercel handles SSL automatically

