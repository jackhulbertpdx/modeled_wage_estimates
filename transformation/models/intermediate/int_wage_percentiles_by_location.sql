-- models/intermediate/int_wage_percentiles_by_location.sql
-- Calculate wage percentiles by occupation, location, and year
-- This model is optimized for the Personal Wage Comparison Dashboard

{{
  config(
    materialized='table'
  )
}}

with base_wages as (
    select
        fw.occupation_code,
        dim_occ.occupation_text,
        dim_occ.major_occupation_group,
        fw.area_code,
        da.area_text,
        da.area_level,
        da.area_type,
        da.state_code,
        fw.data_year,
        fw.avg_hourly_wage,
        fw.estimated_annual_wage,
        fw.estimate_quality,
        fw.is_fulltime,
        -- Calculate percentile rank for this wage within the occupation
        percent_rank() over (
            partition by fw.occupation_code, fw.area_code, fw.data_year
            order by fw.avg_hourly_wage
        ) as wage_percentile_rank
    from {{ ref('fct_wages') }} fw
    inner join {{ ref('dim_occupations') }} dim_occ
        on fw.occupation_code = dim_occ.occupation_code
    inner join {{ ref('dim_areas') }} da
        on fw.area_code = da.area_code
    where fw.avg_hourly_wage is not null
        and fw.is_fulltime = true  -- Focus on full-time wages for comparison
        and fw.data_year is not null
        and fw.data_year != ''
),

percentile_calculations as (
    select
        occupation_code,
        occupation_text,
        major_occupation_group,
        area_code,
        area_text,
        area_level,
        area_type,
        state_code,
        data_year,
        -- Count of wage observations
        count(*) as wage_observation_count,
        -- Percentiles
        percentile_cont(0.10) within group (order by avg_hourly_wage) as p10_hourly_wage,
        percentile_cont(0.25) within group (order by avg_hourly_wage) as p25_hourly_wage,
        percentile_cont(0.50) within group (order by avg_hourly_wage) as p50_hourly_wage,
        percentile_cont(0.75) within group (order by avg_hourly_wage) as p75_hourly_wage,
        percentile_cont(0.90) within group (order by avg_hourly_wage) as p90_hourly_wage,
        -- Annual equivalents (hourly * 2080 hours)
        percentile_cont(0.10) within group (order by avg_hourly_wage) * 2080 as p10_annual_wage,
        percentile_cont(0.25) within group (order by avg_hourly_wage) * 2080 as p25_annual_wage,
        percentile_cont(0.50) within group (order by avg_hourly_wage) * 2080 as p50_annual_wage,
        percentile_cont(0.75) within group (order by avg_hourly_wage) * 2080 as p75_annual_wage,
        percentile_cont(0.90) within group (order by avg_hourly_wage) * 2080 as p90_annual_wage,
        -- Additional statistics
        avg(avg_hourly_wage) as mean_hourly_wage,
        min(avg_hourly_wage) as min_hourly_wage,
        max(avg_hourly_wage) as max_hourly_wage,
        avg(estimated_annual_wage) as mean_annual_wage,
        -- Data quality
        avg(case when estimate_quality = 'High' then 1.0 else 0.0 end) as high_quality_pct
    from base_wages
    group by
        occupation_code,
        occupation_text,
        major_occupation_group,
        area_code,
        area_text,
        area_level,
        area_type,
        state_code,
        data_year
)

select
    -- Primary identifiers
    occupation_code,
    occupation_text,
    major_occupation_group,
    area_code,
    area_text,
    area_level,
    area_type,
    state_code,
    try_cast(data_year as integer) as data_year,
    -- Observation count
    wage_observation_count,
    -- Hourly percentiles (rounded to 2 decimals)
    round(p10_hourly_wage::numeric, 2) as p10_hourly_wage,
    round(p25_hourly_wage::numeric, 2) as p25_hourly_wage,
    round(p50_hourly_wage::numeric, 2) as p50_hourly_wage,
    round(p75_hourly_wage::numeric, 2) as p75_hourly_wage,
    round(p90_hourly_wage::numeric, 2) as p90_hourly_wage,
    -- Annual percentiles (rounded to nearest dollar)
    round(p10_annual_wage::numeric, 0) as p10_annual_wage,
    round(p25_annual_wage::numeric, 0) as p25_annual_wage,
    round(p50_annual_wage::numeric, 0) as p50_annual_wage,
    round(p75_annual_wage::numeric, 0) as p75_annual_wage,
    round(p90_annual_wage::numeric, 0) as p90_annual_wage,
    -- Additional statistics
    round(mean_hourly_wage::numeric, 2) as mean_hourly_wage,
    round(min_hourly_wage::numeric, 2) as min_hourly_wage,
    round(max_hourly_wage::numeric, 2) as max_hourly_wage,
    round(mean_annual_wage::numeric, 0) as mean_annual_wage,
    -- Data quality
    round(high_quality_pct::numeric, 3) as high_quality_pct,
    -- Metadata
    current_timestamp as calculated_at
from percentile_calculations
where wage_observation_count >= 5  -- Only include areas with sufficient observations
