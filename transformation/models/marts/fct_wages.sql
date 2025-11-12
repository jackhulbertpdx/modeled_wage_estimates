-- models/marts/fct_wages.sql
-- Fact: Wage measurements

{{
  config(
    materialized='table'
  )
}}

with wages as (
    select
        -- Primary key
        series_id,
        
        -- Foreign keys to dimensions (already cleaned in staging)
        area_code,
        occupation_code,
        job_characteristic_code,
        work_level_code,
        
        -- Time dimension
        data_year,
        
        -- Measures
        avg_hourly_wage,
        relative_standard_error,
        
        -- Calculated measures (safely handle nulls)
        case 
            when avg_hourly_wage is not null then avg_hourly_wage * 2080 
            else null 
        end as estimated_annual_wage,  -- 40 hrs/week * 52 weeks
        
        case 
            when avg_hourly_wage is not null then avg_hourly_wage * 173.33 
            else null 
        end as estimated_monthly_wage,  -- Average hours per month
        
        -- Data quality indicator
        case 
            when relative_standard_error is null then 'Unknown'
            when relative_standard_error < 5 then 'High'
            when relative_standard_error < 15 then 'Medium'
            when relative_standard_error < 30 then 'Low'
            else 'Very Low'
        end as estimate_quality,
        
        -- Categorical flags (coalesce to handle nulls)
        coalesce(job_characteristic_text, 'Unknown') as job_characteristic_text,
        coalesce(work_level_text, 'Unknown') as work_level_text,
        
        (coalesce(job_characteristic_text, '') = 'Union') as is_union,
        (coalesce(job_characteristic_text, '') = 'Nonunion') as is_nonunion,
        (coalesce(job_characteristic_text, '') = 'Full-time') as is_fulltime,
        (coalesce(job_characteristic_text, '') = 'Part-time') as is_parttime,
        
        -- Footnotes
        coalesce(avg_hourly_wage_footnote is not null, false) as has_wage_footnote,
        avg_hourly_wage_footnote,
        relative_standard_error_footnote,
        
        -- Metadata
        source_file,
        loaded_at
        
    from {{ ref('stg_bls_wages') }}
)

select * from wages