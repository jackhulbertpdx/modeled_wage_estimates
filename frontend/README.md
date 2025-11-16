# BLS Wage Comparison Tool - Frontend

A React + TypeScript application for comparing personal wages against Bureau of Labor Statistics (BLS) data.

## Features

- **Personal Wage Comparison**: Compare your salary to market data by occupation and location
- **Interactive Visualizations**: View your position in wage distributions, time series trends (2014-2023)
- **Searchable Interface**: Easy-to-use occupation search with 1,300+ occupations
- **Geographic Comparison**: Compare wages across national, state, and metropolitan areas

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and optimized builds
- **Tailwind CSS** for styling
- **Recharts** for data visualizations
- **Static JSON data** for fast, serverless deployment

## Project Structure

```
frontend/
├── public/
│   └── data/           # Static JSON data exports (910K+ wage records)
│       ├── occupations.json
│       ├── areas.json
│       ├── wages_latest_*.json
│       ├── time_series_national.json
│       └── metadata.json
├── src/
│   ├── components/     # React components
│   │   ├── WageComparison.tsx   # Main container
│   │   ├── WageForm.tsx         # Input form
│   │   └── WageResults.tsx      # Results display
│   ├── types.ts        # TypeScript interfaces
│   ├── App.tsx         # App layout
│   └── main.tsx        # Entry point
├── vercel.json         # Vercel deployment config
└── postcss.config.js   # PostCSS/Tailwind config
```

## Local Development

### Prerequisites

- Node.js 20.19+ or 22.12+ (currently works with 20.17.0 despite warnings)
- npm

### Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Ensure data files exist in `public/data/`:
   - Run the data export script from the transformation directory:
     ```bash
     cd ../transformation
     python export_data.py
     ```

3. Start development server:
   ```bash
   npm run dev
   ```
   
   App will be available at `http://localhost:5173/`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally

## Deployment

### Vercel Deployment (Recommended)

1. **Install Vercel CLI** (optional):
   ```bash
   npm install -g vercel
   ```

2. **Deploy via CLI**:
   ```bash
   vercel
   ```

3. **Or connect to GitHub**:
   - Push code to GitHub repository
   - Import project in Vercel dashboard
   - Vercel will auto-detect settings from `vercel.json`

### Deployment Configuration

The `vercel.json` file configures:
- Build command: `npm run build`
- Output directory: `dist`
- Framework: Vite
- SPA routing: All routes redirect to `index.html`

### Other Static Hosts

The app can be deployed to any static hosting service:
- **Netlify**: Drag-and-drop `dist` folder or connect to GitHub
- **GitHub Pages**: Use `gh-pages` package to deploy `dist` folder
- **Cloudflare Pages**: Connect repository and set build command

Build settings for all platforms:
- Build command: `npm run build`
- Publish directory: `dist`

## Data Updates

To update the wage data:

1. **Run data extraction** (from project root):
   ```bash
   cd data_extraction
   python get_bls_data.py
   python md_load.py
   ```

2. **Run dbt transformations**:
   ```bash
   cd transformation
   dbt run
   ```

3. **Export to JSON**:
   ```bash
   python export_data.py
   ```

4. **Rebuild and redeploy**:
   ```bash
   cd frontend
   npm run build
   # Then push to Git or redeploy to hosting
   ```

## Performance Notes

- **Bundle size**: ~537 KB (162 KB gzipped) - includes Recharts charting library
- **Data files**: 910K+ records split across 8 JSON files
- **Load strategy**: Lazy loads wage data only when comparison is submitted
- **First paint**: Fast due to static HTML/CSS/JS bundle

### Optimization Opportunities

For production, consider:
- Code splitting with dynamic imports
- Compressing JSON files with gzip/brotli
- Using CDN for faster global delivery
- Implementing service workers for offline access

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- ES2020+ JavaScript features
- CSS Grid and Flexbox

## Known Issues

- **Node.js Version Warning**: Vite prefers 20.19+, but builds successfully with 20.17.0
- **Large Bundle Size**: Recharts adds significant size; consider lighter alternatives for production
- **Metro Area Limit**: Only first 50 metro areas shown in dropdown (performance optimization)

## Troubleshooting

### Build fails with PostCSS error

Ensure Tailwind v3 is installed:
```bash
npm install -D tailwindcss@^3.4.0 postcss autoprefixer
```

### Data not loading

1. Check `public/data/` directory has JSON files
2. Verify JSON files are valid (not empty)
3. Check browser console for fetch errors
4. Ensure server is serving static files from `/data/` path

### TypeScript errors

Ensure type imports use `import type`:
```typescript
import type { Occupation, Area } from '../types'
```

## License

Data source: Bureau of Labor Statistics (Public Domain)
Application: MIT License

## Support

For issues or questions:
- Check BLS data documentation: https://www.bls.gov/help/
- Review dbt transformation models in `../transformation/models/`
- Contact project maintainer
