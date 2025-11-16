# Data Files

The `data/` directory contains JSON exports from the MotherDuck database.

**Note**: Data files are excluded from git (.gitignore) due to large file sizes (358+ MB).

## Generating Data Files

Before deploying or running locally, generate the data files:

```bash
cd ../../transformation
python export_data.py
```

This creates 8 JSON files:
- occupations.json (181 KB)
- areas.json (75 KB)
- wages_latest_national.json (2 MB)
- wages_latest_state.json (15 MB)
- wages_latest_metropolitan.json (358 MB)
- time_series_national.json (1.4 MB)
- geographic_comparison.json (3.9 MB)
- metadata.json (161 B)

## For Deployment

### Vercel/Netlify via GitHub

Add a build command that generates data files:

**Option 1**: Modify `package.json`:
```json
{
  "scripts": {
    "prebuild": "cd ../transformation && python export_data.py",
    "build": "tsc -b && vite build"
  }
}
```

**Option 2**: Use deployment hooks (recommended for cleaner separation)
- Keep data generation separate from frontend build
- Manually run export before pushing/deploying

### Local Development

Always run `python export_data.py` first to ensure you have the latest data.

## Data Size Considerations

The metropolitan wages file is very large (358 MB). Consider:
- Using Git LFS if needed in the future
- Splitting into smaller regional files
- Using a backend API instead of static JSON (future enhancement)

For now, data files are generated locally and deployed as static assets.
