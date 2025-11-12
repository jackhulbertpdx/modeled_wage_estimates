import duckdb

# Connect to MotherDuck (will prompt for token first time)
con = duckdb.connect('md:')

# Load parquet and create table
parquet_path = '/Users/jackhulbert/Desktop/Data Science Projects/bls_data/data/bls_data_unified.parquet'

con.execute(f"""
    CREATE OR REPLACE TABLE bls_data_ AS 
    SELECT * FROM read_parquet('{parquet_path}')
""")

print("✅ Table created in MotherDuck!")

# Verify
result = con.execute("SELECT COUNT(*) FROM bls_data").fetchone()
print(f"Total rows: {result[0]:,}")

# Show sample
con.execute("SELECT * FROM bls_data LIMIT 5").df()