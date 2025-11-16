# BLS Modeled Wage Estimates App

A full-stack data pipeline and web application for comparing personal salaries against Bureau of Labor Statistics (BLS) Modeled Wage Estimates data (2014-2023).

![Tech Stack](https://img.shields.io/badge/dbt-FF694B?style=flat&logo=dbt&logoColor=white)
![DuckDB](https://img.shields.io/badge/DuckDB-FFF000?style=flat&logo=duckdb&logoColor=black)
![React](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)

## Overview

This project provides an end-to-end solution for analyzing BLS wage data, featuring:
- Automated data extraction from BLS API
- Cloud-based data warehouse (MotherDuck/DuckDB)
- dbt transformation pipeline with staging, intermediate, and mart layers
- React application for personal wage comparison
- Static deployment to Vercel

## Features

### Personal Wage Comparison Dashboard
- **Search 1,300+ occupations** - Searchable dropdown with filter
- **Compare your salary** - See where you rank in the wage distribution
- **Geographic analysis** - National, state, and metropolitan area comparisons
- **Historical trends** - 10-year time series (2014-2023) with growth rates
- **Interactive visualizations** - Percentile positions, trend charts using Recharts
- **Data quality indicators** - Reliability ratings and observation counts

### Data Pipeline
- **Automated extraction** - Python scripts to fetch latest BLS data
- **dbt transformations** - Modular SQL models with data quality tests
- **Staging layer** - Cleaned and standardized source data
- **Intermediate layer** - Percentile calculations, growth rates, time series
- **Mart layer** - Application-ready tables optimized for specific use cases
- **Cost of living integration** - Purchasing power calculations (placeholder data)

## Stack

### Data Pipeline
- **Python 3.9+** - Data extraction and processing
- **DuckDB/MotherDuck** - Cloud-based analytical database
- **dbt (data build tool)** - SQL transformations and data modeling
- **Pandas** - Data manipulation

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **Recharts** - React charting library
- **Vercel** - Deployment platform

## Project Structure

```
modeled_wage_estimates/
├── data_extraction/
│   ├── get_bls_data.py       # Fetch data from BLS API
│   └── md_load.py            # Load to MotherDuck
├── transformation/
│   ├── models/
│   │   ├── staging/
│   │   │   ├── stg_bls_wages.sql
│   │   │   └── sources.yml
│   │   ├── intermediate/
│   │   │   ├── int_wage_percentiles_by_location.sql
│   │   │   ├── int_growth_rates.sql
│   │   │   └── int_time_series.sql
│   │   └── marts/
│   │       ├── dim_occupations.sql
│   │       ├── dim_areas.sql
│   │       ├── fct_wages.sql
│   │       ├── mart_personal_comparison.sql
│   │       └── mart_geographic_comparison.sql
│   ├── seeds/
│   │   └── cost_of_living_index.csv
│   ├── export_data.py        # Export to JSON for frontend
│   └── dbt_project.yml
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── WageComparison.tsx
│   │   │   ├── WageForm.tsx
│   │   │   └── WageResults.tsx
│   │   ├── types.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── public/
│   │   ├── data/             # Generated JSON files (not in git)
│   │   └── DATA_README.md
│   ├── README.md             # Frontend-specific docs
│   ├── DEPLOYMENT.md         # Deployment guide
│   └── vercel.json
└── README.md                 # This file
```

## Quick Start

### Prerequisites

- Python 3.9+
- Node.js 20.17+
- MotherDuck account (or local DuckDB)
- npm or yarn

### 1. Data Extraction

```bash
cd data_extraction

# Set up MotherDuck token
export motherduck_token="your_token_here"

# Fetch BLS data
python get_bls_data.py

# Load to MotherDuck
python md_load.py
```

### 2. dbt Transformation

```bash
cd transformation

# Install dbt (if not already)
pip install dbt-duckdb

# Configure profiles.yml with MotherDuck connection

# Run transformations
dbt seed    # Load cost of living data
dbt run     # Run all models
dbt test    # Run data quality tests
```

### 3. Export Data

```bash
# Still in transformation/
python export_data.py

# This creates JSON files in frontend/public/data/
```

### 4. Frontend Development

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev

# Visit http://localhost:5173
```

### 5. Build for Production

```bash
# In frontend/
npm run build

# Creates optimized build in dist/
```

## Data Models

### Staging Layer
- **stg_bls_wages** - Cleaned and standardized BLS raw data

### Intermediate Layer
- **int_wage_percentiles_by_location** - Calculates 10th, 25th, 50th, 75th, 90th percentiles by occupation + location + year
- **int_growth_rates** - Year-over-year, 3-year, 5-year, 10-year growth calculations
- **int_time_series** - Combined percentiles and growth for time series visualizations

### Marts Layer
- **dim_occupations** - Occupation dimension table
- **dim_areas** - Geographic area dimension table
- **fct_wages** - Core wage fact table
- **mart_personal_comparison** - Optimized for Personal Wage Comparison Dashboard (7.4M records)
- **mart_geographic_comparison** - Optimized for geographic comparisons with cost of living adjustments

## Key Metrics

### Data Coverage
- **Time period**: 2014-2023 (10 years)
- **Occupations**: 1,318 unique occupations
- **Geographic areas**: 570 areas (1 national, states, metro areas)
- **Total wage records**: 910,000+
- **Time series points**: 5,000+ for top occupations

### Calculated Metrics
- **Percentiles**: 10th, 25th, 50th (median), 75th, 90th
- **Growth rates**: YoY, 3-year, 5-year, 10-year CAGR
- **Trend classifications**: Strong Growth, Moderate Growth, Slow Growth, Declining
- **Data reliability**: Modeled, Actual, Estimated (from BLS)
- **Purchasing power**: Wage adjusted for cost of living index

## Deployment

### Deploy to Vercel

```bash
cd frontend

# Option 1: CLI
vercel

# Option 2: GitHub Integration
# Push to GitHub, then import project in Vercel dashboard
```

### Deploy to Netlify

```bash
cd frontend
npm run build

# Drag dist/ folder to app.netlify.com/drop
# Or connect GitHub repository
```

See [`frontend/DEPLOYMENT.md`](frontend/DEPLOYMENT.md) for detailed deployment instructions.

## Data Updates

To refresh with latest BLS data:

```bash
# 1. Extract new data
cd data_extraction
python get_bls_data.py
python md_load.py

# 2. Run dbt transformations
cd ../transformation
dbt run

# 3. Export to JSON
python export_data.py

# 4. Rebuild frontend
cd ../frontend
npm run build

# 5. Deploy (or git push for auto-deploy)
```

## Development Workflow

### Adding New dbt Models

1. Create SQL file in appropriate layer (`models/intermediate/` or `models/marts/`)
2. Add schema documentation in `schema.yml`
3. Run `dbt run --select your_model`
4. Add tests in `schema.yml`
5. Run `dbt test --select your_model`

### Adding Frontend Features

1. Create component in `src/components/`
2. Define TypeScript interfaces in `src/types.ts`
3. Import and use in `WageComparison.tsx` or `App.tsx`
4. Style with Tailwind CSS utility classes
5. Test with `npm run dev`

## Known Issues & Limitations

### Data Files
- **Size**: Metropolitan wages file is 358 MB (excluded from git)
- **Generation required**: Must run `export_data.py` before deployment
- **No backend API**: All data served as static JSON (fast but large)

### Frontend
- **Bundle size**: 537 KB (Recharts adds significant weight)
- **Metro area limit**: Only first 50 metros shown in dropdown
- **No caching**: JSON files fetched on every comparison
- **Static data**: No real-time updates (requires data pipeline re-run)

### Cost of Living Data
- **Placeholder data**: Current CoL index is sample data for 36 metros
- **Needs real data**: Should integrate MIT Living Wage Calculator or C2ER data
- **Limited coverage**: Not all metro areas have CoL data

## Future Enhancements

### Phase 2: Geographic Wage Explorer
- Interactive map visualization
- Side-by-side city comparisons
- Cost of living-adjusted rankings
- Migration value calculator

### Phase 3: Career Path Explorer
- Related occupation suggestions
- Career progression paths
- Skill gap analysis
- Education ROI calculator

### Phase 4: Salary Projections
- ML-based wage forecasting
- Industry trend analysis
- Personalized salary trajectories
- Negotiation assistant with market context

## Contributing

Contributions welcome! Areas for improvement:
- Real cost of living data integration
- Performance optimization (code splitting, data compression)
- Additional visualizations (D3.js custom charts)
- Backend API for dynamic data
- User authentication and saved comparisons
- Export reports (PDF, CSV)

## Data Source

Bureau of Labor Statistics (BLS)
- **Dataset**: Modeled Wage Estimates
- **Coverage**: 2014-2023
- **Update frequency**: Annual
- **Documentation**: https://www.bls.gov/oes/

## License

- **Application code**: MIT License
- **BLS data**: Public Domain (U.S. Government)

## Acknowledgments

- Bureau of Labor Statistics for comprehensive wage data
- dbt Labs for transformation framework
- Recharts for visualization library
- MotherDuck for cloud DuckDB hosting


---

**Built with**: Python, dbt, DuckDB, React, TypeScript, Tailwind CSS
**Data**: Bureau of Labor Statistics Modeled Wage Estimates (2014-2023)
