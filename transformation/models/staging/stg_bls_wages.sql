-- models/staging/stg_bls_wages.sql
-- Staging model: Clean and standardize raw BLS wage data

{{
  config(
    materialized='view'
  )
}}

with source_data as (
    select 
        -- Cast everything to string first to avoid type conversion errors
        cast(series_id as varchar) as series_id,
        cast(area_code as varchar) as area_code,
        cast(occupation_code as varchar) as occupation_code,
        cast(job_characteristic_code as varchar) as job_characteristic_code,
        cast(work_level_code as varchar) as work_level_code,
        cast(series_title as varchar) as series_title,
        cast(area_level as varchar) as area_level,
        cast(area_text as varchar) as area_text,
        cast(occupation_text as varchar) as occupation_text,
        cast(job_characteristic_text as varchar) as job_characteristic_text,
        cast(work_level_text as varchar) as work_level_text,
        cast(avg_hourly_wage as varchar) as avg_hourly_wage,
        cast(relative_standard_error as varchar) as relative_standard_error,
        cast(avg_hourly_wage_footnote as varchar) as avg_hourly_wage_footnote,
        cast(relative_standard_error_footnote as varchar) as relative_standard_error_footnote,
        cast(source_file as varchar) as source_file 
    from {{ source('bls', 'bls_data_') }}
),


cleaned as (
    select
        -- Primary key
        nullif(trim(series_id), '') as series_id,
        
        -- Identifiers - convert all empty strings to NULL
        nullif(trim(area_code), '') as area_code,
        nullif(trim(occupation_code), '') as occupation_code,
        nullif(trim(job_characteristic_code), '') as job_characteristic_code,
        nullif(trim(work_level_code), '') as work_level_code,
        
        -- Descriptive fields - convert all empty strings to NULL
        nullif(trim(series_title), '') as series_title,
        nullif(trim(area_level), '') as area_level,
        nullif(trim(area_text), '') as area_text,
        nullif(trim(occupation_text), '') as occupation_text,
        nullif(trim(job_characteristic_text), '') as job_characteristic_text,
        nullif(trim(work_level_text), '') as work_level_text,
        
        -- Metrics (cast to proper types, handle empty strings, dashes, and any non-numeric values)
        try_cast(
            nullif(
                nullif(
                    nullif(trim(avg_hourly_wage), ''), 
                    '-'
                ), 
                'N/A'
            ) as decimal(10,2)
        ) as avg_hourly_wage,
        
        try_cast(
            nullif(
                nullif(
                    nullif(trim(relative_standard_error), ''), 
                    '-'
                ), 
                'N/A'
            ) as decimal(10,2)
        ) as relative_standard_error,
        
        -- Footnotes/metadata - convert empty strings to NULL
        nullif(trim(avg_hourly_wage_footnote), '') as avg_hourly_wage_footnote,
        nullif(trim(relative_standard_error_footnote), '') as relative_standard_error_footnote,
        
        -- Source tracking
        nullif(trim(source_file), '') as source_file,
        
        -- Extract year from filename (e.g., "mwe-2014.xlsx" -> 2014)
        try_cast(
            regexp_extract(source_file, 'mwe-(\\d{4})', 1) 
            as varchar
        ) as data_year,
        
        -- Current timestamp for tracking
        current_timestamp as loaded_at
        
    from source_data
)

select * 
from cleaned
where avg_hourly_wage is not null  -- Filter out rows without valid wage data
  and series_id is not null        -- Filter out rows without series_id