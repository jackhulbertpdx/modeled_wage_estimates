# BLS Modeled Wage Estimates 

A web application for comparing earnings against Bureau of Labor Statistics (BLS) Modeled Wage Estimates data (2014-2023).

## Overview

This project provides an end-to-end solution for analyzing BLS MWE data, featuring:
- Automated data extraction from BLS 
- Data storage (MotherDuck)
- Transformation staging, intermediate, and mart layers (dbt)
- React app front-end for personal wage comparison

## Features

### Personal Wage Comparison Dashboard
- **Search 1,300+ occupations** - Searchable dropdown with filter
- **Compare your salary** - See where you rank in the wage distribution
- **Historical trends** - 10-year time series (2014-2023) with growth rates
- **Data quality indicators** - Reliability ratings and observation counts

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

### Prereqs

- Python 3.9+
- Node.js 20.17+
- MotherDuck (or local DuckDB)
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

### 3. Export for front-end files (JSON)

```bash
# Still in transformation/
python export_data.py

# This creates JSON files in frontend/public/data/
```

### 4. Frontend 

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev

# Visit http://localhost:5173
```

### 5. Deploy on Vercel

```bash
# In frontend/
npm run build

# Creates optimized build in dist/
```

## Data Models

### Staging Layer
- **stg_bls_wages** - Cleaned and standardized BLS raw data - unioned across n years 

### Intermediate Layer
- **int_wage_percentiles_by_location** - Calculates 10th, 25th, 50th, 75th, 90th percentiles by occupation + location + year
- **int_growth_rates** - YoY, 3-year, 5-year, 10-year growth calculations
- **int_time_series** - Combined percentiles and growth for time series visualizations

### Marts Layer
- **dim_occupations** - Occupation dimension table
- **dim_areas** - Geographic area dimension table
- **fct_wages** - Core wage fact table
- **mart_personal_comparison** - Optimized for Personal Wage Comparison analyss
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


## Data Source

Bureau of Labor Statistics (BLS)
- **Dataset**: Modeled Wage Estimates
- **Coverage**: 2014-2023
- **Update frequency**: Annual
- **Documentation**: https://www.bls.gov/oes/
