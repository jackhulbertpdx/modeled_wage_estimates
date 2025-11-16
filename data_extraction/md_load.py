import duckdb
import os

# Connect to MotherDuck (will prompt for token first time)
con = duckdb.connect('md:')

# Get project root directory (parent of data_extraction/)
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
parquet_path = os.path.join(project_root, "data", "bls_data_unified.parquet")

con.execute(f"""
    CREATE OR REPLACE TABLE raw_bls_data AS 
    SELECT * FROM read_parquet('{parquet_path}')
""")

print("✅ Table created in MotherDuck!")

# Verify
result = con.execute("SELECT COUNT(*) FROM raw_bls_data").fetchone()
print(f"Total rows: {result[0]:,}")

# Show sample
con.execute("SELECT * FROM raw_bls_data LIMIT 5").df()