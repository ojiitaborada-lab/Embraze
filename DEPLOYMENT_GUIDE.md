# Deploying Embraze to Vercel

## Prerequisites
- GitHub account
- Vercel account (free tier)
- Your code pushed to GitHub

## Method 1: Vercel Dashboard (Recommended)

### Step 1: Prepare Your Repository
```bash
# Initialize git if not already done
git init

# Add all files
git add .

# Commit your changes
git commit -m "Ready for deployment"

# Create main branch
git branch -M main

# Add your GitHub repository
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git

# Push to GitHub
git push -u origin main
```

### Step 2: Deploy on Vercel
1. Go to [vercel.com](https://vercel.com)
2. Sign up/Login with GitHub
3. Click "Add New Project"
4. Import your repository
5. Configure settings:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

### Step 3: Add Environment Variables
In Vercel dashboard, add these environment variables:
```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### Step 4: Deploy
Click "Deploy" and wait for the build to complete!

## Method 2: Vercel CLI

### Install Vercel CLI
```bash
npm install -g vercel
```

### Login to Vercel
```bash
vercel login
```

### Deploy
```bash
# From your project directory
cd Embraze-react

# Deploy to production
vercel --prod
```

Follow the prompts to configure your project.

## Vercel Free Tier Limits
- ✅ Unlimited deployments
- ✅ 100GB bandwidth per month
- ✅ Automatic HTTPS
- ✅ Custom domains
- ✅ Preview deployments
- ✅ Serverless functions (100GB-hours)

## Post-Deployment

### Update Firebase Configuration
1. Go to Firebase Console
2. Add your Vercel domain to authorized domains:
   - Authentication → Settings → Authorized domains
   - Add: `your-app.vercel.app`

### Custom Domain (Optional)
1. In Vercel dashboard, go to your project
2. Settings → Domains
3. Add your custom domain
4. Update DNS records as instructed

## Automatic Deployments
Once connected to GitHub:
- Every push to `main` branch = Production deployment
- Every PR = Preview deployment with unique URL

## Troubleshooting

### Build Fails
- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Verify environment variables are set

### Firebase Not Working
- Verify environment variables are set correctly
- Check Firebase authorized domains
- Ensure Firebase config is correct

### 404 on Routes
Add `vercel.json` to handle SPA routing:
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

## Monitoring
- View analytics in Vercel dashboard
- Check deployment logs
- Monitor performance metrics

## Support
- Vercel Docs: https://vercel.com/docs
- Vercel Community: https://github.com/vercel/vercel/discussions
