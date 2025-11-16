"""
Export dbt mart data to JSON files for static frontend deployment.
This script queries MotherDuck and exports data to JSON files that can be served statically.
"""

import duckdb
import json
import os
from pathlib import Path

# Output directory for JSON files
OUTPUT_DIR = Path(__file__).parent.parent / "frontend" / "public" / "data"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

print("🦆 Connecting to MotherDuck...")
con = duckdb.connect('md:')

# ===== Export Occupation List =====
print("📊 Exporting occupation list...")
occupations = con.execute("""
    SELECT DISTINCT
        occupation_code,
        occupation_text,
        major_occupation_group
    FROM my_db.marts_marts.dim_occupations
    ORDER BY occupation_text
""").fetchdf()

with open(OUTPUT_DIR / "occupations.json", 'w') as f:
    json.dump(occupations.to_dict('records'), f, indent=2)
print(f"   ✓ Exported {len(occupations)} occupations")

# ===== Export Area List =====
print("📍 Exporting area list...")
areas = con.execute("""
    SELECT DISTINCT
        area_code,
        area_text,
        area_type,
        state_code
    FROM my_db.marts_marts.dim_areas
    WHERE area_type IN ('National', 'State', 'Metropolitan')
    ORDER BY area_type, area_text
""").fetchdf()

with open(OUTPUT_DIR / "areas.json", 'w') as f:
    json.dump(areas.to_dict('records'), f, indent=2)
print(f"   ✓ Exported {len(areas)} areas")

# ===== Export Latest Year Summary (for quick lookups) =====
print("💰 Exporting latest year wage summary...")
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
        data_reliability
    FROM my_db.marts_marts.mart_personal_comparison
    WHERE is_latest_year = true
    ORDER BY occupation_code, area_code
""").fetchdf()

# Split by area type for better performance
for area_type in ['National', 'State', 'Metropolitan']:
    subset = latest_summary[latest_summary['area_type'] == area_type]
    filename = f"wages_latest_{area_type.lower()}.json"
    with open(OUTPUT_DIR / filename, 'w') as f:
        json.dump(subset.to_dict('records'), f)
    print(f"   ✓ Exported {len(subset)} {area_type} wage records")

# ===== Export Time Series Data (sample for top occupations) =====
print("📈 Exporting time series data for top occupations...")
time_series = con.execute("""
    WITH top_occupations AS (
        SELECT DISTINCT occupation_code
        FROM my_db.marts_marts.mart_personal_comparison
        WHERE is_latest_year = true AND area_type = 'National'
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
    ORDER BY ts.occupation_code, ts.data_year
""").fetchdf()

with open(OUTPUT_DIR / "time_series_national.json", 'w') as f:
    json.dump(time_series.to_dict('records'), f)
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
    json.dump(geo_comparison.to_dict('records'), f)
print(f"   ✓ Exported {len(geo_comparison)} geographic comparison records")

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
