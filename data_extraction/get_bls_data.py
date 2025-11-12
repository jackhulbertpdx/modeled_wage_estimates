import os
import pandas as pd
import json

# ---- CONFIG ----
data_dir = "/Users/jackhulbert/Desktop/Data Science Projects/bls_data/data"
output_parquet = os.path.join(data_dir, "bls_data_unified.parquet")

# ---- COLUMN MAPPING ----
# Standardized name -> list of possible original names (includes ALL variations found)
COLUMN_MAPPING = {
    "series_id": ["Series ID"],
    "series_title": ["Series Title", "Series title"],
    "avg_hourly_wage": ["Average Hourly Wage ($)", "Average hourly wage ($)"],
    "avg_hourly_wage_footnote": ["Average Hourly Wage Footnote", "Average hourly wage footnote", "Average  hourly wage footnote"],
    "relative_standard_error": ["Relative standard  error", "Relative standard error", "Relative Standard Error"],
    "relative_standard_error_footnote": ["Relative standard error footnote", "Relative Standard Error Footnote"],
    "area_code": ["Area Code", "Area code"],
    "area_level": ["Area Level", "Area level"],
    "area_text": ["Area Text", "Area text", "Areat text"],
    "occupation_code": ["Occupation Code", "Occupation  code", "Occupation code"],
    "occupation_text": ["Occupation Text", "Occupation text"],
    "job_characteristic_code": ["Job Characteristic Code", "Job characteristic code"],
    "job_characteristic_text": ["Job Characteristic Text", "Job characteristic text"],
    "work_level_code": ["Work Level Code", "Work level code"],
    "work_level_text": ["Work Level Text", "Work level text"]
}

# Create reverse mapping: original name -> standardized name
REVERSE_MAPPING = {}
for std_name, orig_names in COLUMN_MAPPING.items():
    for orig_name in orig_names:
        REVERSE_MAPPING[orig_name] = std_name

# ---- STEP 1: Process each file ----
print("📂 Processing Excel files...")

unified_dfs = []
file_list = [f for f in os.listdir(data_dir) if f.endswith(".xlsx") and not f.startswith("~$")]

for file in file_list:
    file_path = os.path.join(data_dir, file)
    
    try:
        # Read the file
        df = pd.read_excel(file_path, sheet_name=1, dtype=str)
        
        # Clean column names
        df.columns = [c.strip().replace("\n", " ").replace("\r", " ") for c in df.columns]
        
        # Create new dataframe with only standardized columns
        new_df = pd.DataFrame()
        
        for std_name in COLUMN_MAPPING.keys():
            # Find which original column maps to this standardized name
            for col in df.columns:
                if col in COLUMN_MAPPING[std_name]:
                    new_df[std_name] = df[col]
                    break
            
            # If column doesn't exist, fill with NA
            if std_name not in new_df.columns:
                new_df[std_name] = pd.NA
        
        # Add source file column
        new_df['source_file'] = file
        
        print(f"✅ {file}: {len(new_df):,} rows, {len(new_df.columns)} columns")
        unified_dfs.append(new_df)
        
    except Exception as e:
        print(f"❌ {file}: {e}")

if not unified_dfs:
    raise RuntimeError("No files processed successfully!")

# ---- STEP 2: Union all dataframes ----
print("\n🔗 Combining all files...")

# Concatenate (all have same columns now)
final_df = pd.concat(unified_dfs, ignore_index=True)

print(f"\n✅ Unified dataset created:")
print(f"  - Total rows: {len(final_df):,}")
print(f"  - Total columns: {len(final_df.columns)}")
print(f"  - Columns: {sorted(final_df.columns)}")

# ---- STEP 3: Data quality summary ----
print(f"\n📊 Data Quality Summary:")
for col in sorted(final_df.columns):
    non_null = final_df[col].notna().sum()
    pct = (non_null / len(final_df)) * 100
    print(f"  {col:40s}: {non_null:8,} / {len(final_df):,} ({pct:5.1f}%)")

# ---- STEP 4: Save to Parquet ----
final_df.to_parquet(output_parquet, index=False)
print(f"\n💾 Saved to: {output_parquet}")

# ---- STEP 5: MotherDuck code ----
print("\n🦆 To load into MotherDuck, run:")
print(f"""
import duckdb
con = duckdb.connect('md:')
con.execute('''
    CREATE OR REPLACE TABLE raw_bls_data AS 
    SELECT * FROM read_parquet('{output_parquet}')
''')
print("✅ Loaded to MotherDuck!")
print(f"Rows: {{con.execute('SELECT COUNT(*) FROM raw_bls_data').fetchone()[0]:,}}")
""")

# ---- STEP 6: Save mapping for reference ----
mapping_file = os.path.join(data_dir, "column_mapping.json")
with open(mapping_file, 'w') as f:
    json.dump(COLUMN_MAPPING, f, indent=2)
print(f"\n📋 Column mapping saved to: {mapping_file}")