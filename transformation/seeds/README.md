# Cost of Living Data

## Current Status

The `cost_of_living_index.csv` file contains **placeholder data** with sample cost-of-living indices for major US metro areas and states. This data is marked as "Placeholder" in the `data_source` column.

## Data Structure

| Column | Description |
|--------|-------------|
| `state_code` | Two-digit state FIPS code |
| `metro_area_name` | Name of the metro area or state |
| `col_index` | Cost of living index (100 = national average) |
| `data_year` | Year of the data |
| `data_source` | Source of the data |

## How to Update with Real Data

### Option 1: MIT Living Wage Calculator (Recommended)

**Best for:** Comprehensive, research-grade data

1. **License the data**: Visit https://livingwage.mit.edu/ and contact them through their form to license bulk data
2. **Coverage**: Includes Counties, Metropolitan Statistical Areas (MSAs), and States
3. **Update frequency**: Updated annually (last update: February 10, 2025)
4. **Cost**: Commercial licensing required for bulk downloads

### Option 2: Council for Community and Economic Research (C2ER)

**Best for:** Quarterly updated cost of living indices

1. **Subscribe**: Visit https://www.c2er.org/
2. **Coverage**: ~265 urban areas
3. **Update frequency**: Quarterly
4. **Cost**: Subscription required

### Option 3: Bureau of Labor Statistics CPI by Metro Area

**Best for:** Free, publicly available data (but more complex to process)

1. **Access**: https://www.bls.gov/cpi/regional-resources.htm
2. **Coverage**: Major metropolitan areas
3. **Note**: CPI tracks price changes over time within an area, not cost comparisons across areas
4. **Processing**: You'll need to normalize CPIs to create a relative cost-of-living index

### Option 4: Manual Research

**Best for:** Small number of locations

1. Use the MIT Living Wage Calculator interactively for up to 10 locations
2. Manually enter data into the CSV file
3. Update `data_source` to "MIT Living Wage Calculator 2024" or appropriate source

## Updating the CSV File

1. **Format**: Keep the same CSV structure
2. **State codes**: Use two-digit FIPS codes (e.g., "06" for California, "36" for New York)
3. **Index scale**: Use 100 as the national average
4. **Year**: Update `data_year` to match your data
5. **Source**: Update `data_source` to cite your actual source
6. **Load**: Run `dbt seed` to reload the data

```bash
cd transformation
dbt seed
dbt run --select mart_geographic_comparison
```

## Impact on Application

The cost-of-living data is used in:
- **Geographic Wage Explorer**: Calculates purchasing power adjusted wages
- **Purchasing power rankings**: Ranks metro areas by real income potential
- **Move calculator**: Shows cost-of-living adjusted income changes

When you update the data, these features will automatically use the new values.
