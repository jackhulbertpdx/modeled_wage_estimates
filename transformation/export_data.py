"""
Export dbt mart data to JSON files for static frontend deployment.
This script queries MotherDuck and exports data to JSON files that can be served statically.
"""

import duckdb
import json
import os
import numpy as np
from pathlib import Path

# Output directory for JSON files
OUTPUT_DIR = Path(__file__).parent.parent / "frontend" / "public" / "data"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

def clean_dataframe_for_json(df):
    """Replace NaN, inf, and -inf with None for valid JSON"""
    return df.replace([np.nan, np.inf, -np.inf], None)

print("🦆 Connecting to MotherDuck...")
con = duckdb.connect('md:')

# ===== Export Occupation List =====
print("📊 Exporting occupation list (with high-quality data only)...")
occupations = con.execute("""
    SELECT DISTINCT
        dim_occ.occupation_code,
        dim_occ.occupation_text,
        dim_occ.major_occupation_group
    FROM my_db.marts_marts.dim_occupations dim_occ
    WHERE EXISTS (
        SELECT 1
        FROM my_db.marts_marts.mart_personal_comparison mpc
        WHERE mpc.occupation_code = dim_occ.occupation_code
            AND mpc.is_latest_year = true
            AND mpc.wage_observation_count >= 10
    )
    ORDER BY occupation_text
""").fetchdf()

with open(OUTPUT_DIR / "occupations.json", 'w') as f:
    json.dump(clean_dataframe_for_json(occupations).to_dict('records'), f, indent=2)
print(f"   ✓ Exported {len(occupations)} occupations (filtered for data availability)")

# ===== Export Area List =====
print("📍 Exporting area list (with high-quality data only)...")
areas = con.execute("""
    SELECT DISTINCT
        dim_area.area_code,
        dim_area.area_text,
        dim_area.area_type,
        dim_area.state_code
    FROM my_db.marts_marts.dim_areas dim_area
    WHERE dim_area.area_type IN ('National', 'State', 'Metropolitan')
        AND EXISTS (
            SELECT 1
            FROM my_db.marts_marts.mart_personal_comparison mpc
            WHERE mpc.area_code = dim_area.area_code
                AND mpc.is_latest_year = true
                AND mpc.wage_observation_count >= 10
        )
    ORDER BY area_type, area_text
""").fetchdf()

with open(OUTPUT_DIR / "areas.json", 'w') as f:
    json.dump(clean_dataframe_for_json(areas).to_dict('records'), f, indent=2)
print(f"   ✓ Exported {len(areas)} areas (filtered for data availability)")

# ===== Export Latest Year Summary (for quick lookups) =====
print("💰 Exporting latest year wage summary (high quality only)...")
latest_summary = con.execute("""
    SELECT
        occupation_code,
        occupation_text,
        area_code,
        area_text,
        area_type,
        state_code,
        data_year,
        p50_annual_wage as median_wage,
        p25_annual_wage,
        p75_annual_wage,
        mean_annual_wage,
        avg_10yr_growth_pct,
        trend_classification,
        data_reliability,
        wage_observation_count
    FROM my_db.marts_marts.mart_personal_comparison
    WHERE is_latest_year = true
        AND wage_observation_count >= 10  -- Filter for statistical reliability
    ORDER BY occupation_code, area_code
""").fetchdf()
print(f"   ℹ️  Filtered to {len(latest_summary)} records with 10+ observations (from 1.6M total)")

# Split by area type for better performance
for area_type in ['National', 'State', 'Metropolitan']:
    subset = latest_summary[latest_summary['area_type'] == area_type]
    filename = f"wages_latest_{area_type.lower()}.json"
    with open(OUTPUT_DIR / filename, 'w') as f:
        json.dump(clean_dataframe_for_json(subset).to_dict('records'), f)
    print(f"   ✓ Exported {len(subset)} {area_type} wage records")

# ===== Export Time Series Data (sample for top occupations) =====
print("📈 Exporting time series data for top occupations...")
time_series = con.execute("""
    WITH top_occupations AS (
        SELECT DISTINCT occupation_code
        FROM my_db.marts_marts.mart_personal_comparison
        WHERE is_latest_year = true
            AND area_type = 'National'
            AND wage_observation_count >= 10
        ORDER BY p50_annual_wage DESC
        LIMIT 100
    )
    SELECT
        ts.occupation_code,
        ts.occupation_text,
        ts.area_code,
        ts.area_text,
        ts.area_type,
        ts.data_year,
        ts.p25_annual_wage,
        ts.p50_annual_wage,
        ts.p75_annual_wage,
        ts.yoy_growth_pct
    FROM my_db.marts_marts.mart_personal_comparison ts
    INNER JOIN top_occupations t ON ts.occupation_code = t.occupation_code
    WHERE ts.area_type = 'National'
        AND ts.wage_observation_count >= 10
    ORDER BY ts.occupation_code, ts.data_year
""").fetchdf()

with open(OUTPUT_DIR / "time_series_national.json", 'w') as f:
    json.dump(clean_dataframe_for_json(time_series).to_dict('records'), f)
print(f"   ✓ Exported {len(time_series)} time series records")

# ===== Export Geographic Comparison Data =====
print("🌎 Exporting geographic comparison data...")
geo_comparison = con.execute("""
    SELECT
        occupation_code,
        occupation_text,
        area_code,
        area_text,
        state_code,
        median_annual_wage,
        national_median_wage,
        diff_from_national_pct,
        growth_rate_10yr,
        cost_of_living_index,
        purchasing_power_wage,
        market_classification,
        data_reliability
    FROM my_db.marts_marts.mart_geographic_comparison
    WHERE area_type = 'Metropolitan'
        AND wage_observation_count >= 10
    ORDER BY occupation_code, wage_rank_nominal
""").fetchdf()

with open(OUTPUT_DIR / "geographic_comparison.json", 'w') as f:
    json.dump(clean_dataframe_for_json(geo_comparison).to_dict('records'), f)
print(f"   ✓ Exported {len(geo_comparison)} geographic comparison records")

# ===== Export Occupation-Area Availability Mapping =====
print("🔗 Exporting occupation-area availability mapping...")
availability = con.execute("""
    SELECT
        occupation_code,
        array_agg(DISTINCT area_code) as available_areas
    FROM my_db.marts_marts.mart_personal_comparison
    WHERE is_latest_year = true
        AND wage_observation_count >= 10
    GROUP BY occupation_code
""").fetchdf()

# Convert to dict for easier lookup
availability_map = {}
for _, row in availability.iterrows():
    # Convert numpy array to Python list for JSON serialization
    availability_map[row['occupation_code']] = row['available_areas'].tolist() if hasattr(row['available_areas'], 'tolist') else list(row['available_areas'])

with open(OUTPUT_DIR / "occupation_area_mapping.json", 'w') as f:
    json.dump(availability_map, f)
print(f"   ✓ Exported availability mapping for {len(availability_map)} occupations")

# ===== Export Metadata =====
print("ℹ️  Exporting metadata...")
metadata = {
    "last_updated": con.execute("SELECT CURRENT_TIMESTAMP").fetchone()[0].isoformat(),
    "latest_data_year": int(con.execute("""
        SELECT MAX(data_year)
        FROM my_db.marts_marts.mart_personal_comparison
    """).fetchone()[0]),
    "occupation_count": len(occupations),
    "area_count": len(areas),
    "total_records": len(latest_summary)
}

with open(OUTPUT_DIR / "metadata.json", 'w') as f:
    json.dump(metadata, f, indent=2)

print("\n✅ Data export complete!")
print(f"📂 Output directory: {OUTPUT_DIR}")
print(f"📊 Total files created: {len(list(OUTPUT_DIR.glob('*.json')))}")

con.close()
