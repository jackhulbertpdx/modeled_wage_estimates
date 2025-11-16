# Quick Deployment Guide

## Deploy to Vercel (5 minutes)

### Option 1: GitHub Integration (Recommended)

1. **Push code to GitHub**:
   ```bash
   git add .
   git commit -m "Add BLS Wage Comparison frontend"
   git push origin main
   ```

2. **Import to Vercel**:
   - Go to https://vercel.com
   - Click "Add New" → "Project"
   - Import your Git repository
   - Vercel auto-detects settings from `vercel.json`
   - Click "Deploy"

3. **Done!** Your app will be live at `https://your-project.vercel.app`

### Option 2: Vercel CLI

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Deploy**:
   ```bash
   cd frontend
   vercel
   ```

3. **Follow prompts**:
   - Link to existing project or create new
   - Accept default settings
   - Wait for deployment

4. **Production deployment**:
   ```bash
   vercel --prod
   ```

## Deploy to Netlify

### Via Drag-and-Drop

1. **Build locally**:
   ```bash
   npm run build
   ```

2. **Go to Netlify**:
   - Visit https://app.netlify.com/drop
   - Drag `dist` folder to upload
   - Done!

### Via GitHub

1. **Push to GitHub** (same as above)

2. **Import to Netlify**:
   - Go to https://app.netlify.com
   - Click "Add new site" → "Import an existing project"
   - Connect to Git provider
   - Configure build:
     - Build command: `npm run build`
     - Publish directory: `dist`
   - Click "Deploy"

## Environment Variables

No environment variables needed! All data is static JSON files.

## Custom Domain

### Vercel
1. Go to project settings
2. Click "Domains"
3. Add your custom domain
4. Update DNS records as instructed

### Netlify
1. Go to site settings
2. Click "Domain management"
3. Add custom domain
4. Follow DNS setup instructions

## Post-Deployment Checklist

- [ ] Test occupation search
- [ ] Submit a salary comparison
- [ ] Verify charts render correctly
- [ ] Check responsive design on mobile
- [ ] Verify all data files load (check Network tab)
- [ ] Test different occupations and locations

## Troubleshooting

**Issue**: Data not loading
- Check `public/data/` folder has JSON files
- Run `python export_data.py` if missing

**Issue**: Build fails
- Ensure Node.js 20.17+ installed
- Run `npm install` to update dependencies

**Issue**: 404 on refresh
- Vercel/Netlify should handle this automatically
- Check `vercel.json` or `_redirects` file exists

## Monitoring

### Vercel Analytics
- Enable in project settings
- View traffic, performance metrics

### Custom Analytics
Add to `index.html` if needed:
- Google Analytics
- Plausible
- Simple Analytics

## Updates

To update data and redeploy:

```bash
# 1. Update data
cd transformation
python export_data.py

# 2. Commit changes
cd ../frontend
git add public/data/
git commit -m "Update wage data"
git push

# Vercel/Netlify will auto-deploy!
```

## Performance Tips

- Enable Vercel Analytics for performance monitoring
- Use Vercel Edge Network for global CDN
- Enable compression (automatic on Vercel/Netlify)
- Consider image optimization if you add images later

## Support

- Vercel Docs: https://vercel.com/docs
- Netlify Docs: https://docs.netlify.com
- Vite Docs: https://vitejs.dev/guide/
