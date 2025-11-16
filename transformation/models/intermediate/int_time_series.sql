-- models/intermediate/int_time_series.sql
-- Time series data optimized for chart visualizations
-- Combines percentiles and growth rates in a format ready for frontend consumption

{{
  config(
    materialized='table'
  )
}}

with percentiles as (
    select
        occupation_code,
        occupation_text,
        major_occupation_group,
        area_code,
        area_text,
        area_type,
        state_code,
        data_year,
        p10_hourly_wage,
        p25_hourly_wage,
        p50_hourly_wage,
        p75_hourly_wage,
        p90_hourly_wage,
        p10_annual_wage,
        p25_annual_wage,
        p50_annual_wage,
        p75_annual_wage,
        p90_annual_wage,
        mean_hourly_wage,
        mean_annual_wage,
        wage_observation_count,
        high_quality_pct
    from {{ ref('int_wage_percentiles_by_location') }}
),

growth_rates as (
    select
        occupation_code,
        area_code,
        data_year,
        yoy_median_growth_pct,
        avg_3yr_growth_pct,
        avg_5yr_growth_pct,
        avg_10yr_growth_pct,
        cumulative_growth_pct,
        growth_volatility_5yr
    from {{ ref('int_growth_rates') }}
),

combined as (
    select
        p.*,
        g.yoy_median_growth_pct,
        g.avg_3yr_growth_pct,
        g.avg_5yr_growth_pct,
        g.avg_10yr_growth_pct,
        g.cumulative_growth_pct,
        g.growth_volatility_5yr
    from percentiles p
    left join growth_rates g
        on p.occupation_code = g.occupation_code
        and p.area_code = g.area_code
        and p.data_year = g.data_year
),

-- Calculate trend indicators
trends as (
    select
        *,
        -- Trend classification based on 3-year average growth
        case
            when avg_3yr_growth_pct >= 3.0 then 'Strong Growth'
            when avg_3yr_growth_pct >= 1.5 then 'Moderate Growth'
            when avg_3yr_growth_pct >= 0.0 then 'Slow Growth'
            when avg_3yr_growth_pct < 0.0 then 'Declining'
            else 'Insufficient Data'
        end as trend_classification,
        -- Interquartile range (measure of wage distribution)
        p75_hourly_wage - p25_hourly_wage as iqr_hourly_wage,
        p75_annual_wage - p25_annual_wage as iqr_annual_wage,
        -- Years since data start (for indexing)
        data_year - min(data_year) over (
            partition by occupation_code, area_code
        ) as years_since_start,
        -- First and last year flags
        case when data_year = min(data_year) over (partition by occupation_code, area_code)
            then true else false end as is_first_year,
        case when data_year = max(data_year) over (partition by occupation_code, area_code)
            then true else false end as is_latest_year,
        -- Count of years with data
        count(*) over (partition by occupation_code, area_code) as total_years_with_data
    from combined
)

select
    -- Identifiers
    occupation_code,
    occupation_text,
    major_occupation_group,
    area_code,
    area_text,
    area_type,
    state_code,
    try_cast(data_year as integer) as data_year,
    years_since_start,
    is_first_year,
    is_latest_year,
    total_years_with_data,
    -- Percentile bands (hourly)
    round(p10_hourly_wage::numeric, 2) as p10_hourly_wage,
    round(p25_hourly_wage::numeric, 2) as p25_hourly_wage,
    round(p50_hourly_wage::numeric, 2) as p50_hourly_wage,
    round(p75_hourly_wage::numeric, 2) as p75_hourly_wage,
    round(p90_hourly_wage::numeric, 2) as p90_hourly_wage,
    -- Percentile bands (annual)
    round(p10_annual_wage::numeric, 0) as p10_annual_wage,
    round(p25_annual_wage::numeric, 0) as p25_annual_wage,
    round(p50_annual_wage::numeric, 0) as p50_annual_wage,
    round(p75_annual_wage::numeric, 0) as p75_annual_wage,
    round(p90_annual_wage::numeric, 0) as p90_annual_wage,
    -- Means
    round(mean_hourly_wage::numeric, 2) as mean_hourly_wage,
    round(mean_annual_wage::numeric, 0) as mean_annual_wage,
    -- Distribution measures
    round(iqr_hourly_wage::numeric, 2) as iqr_hourly_wage,
    round(iqr_annual_wage::numeric, 0) as iqr_annual_wage,
    -- Growth metrics
    round(yoy_median_growth_pct::numeric, 2) as yoy_median_growth_pct,
    round(avg_3yr_growth_pct::numeric, 2) as avg_3yr_growth_pct,
    round(avg_5yr_growth_pct::numeric, 2) as avg_5yr_growth_pct,
    round(avg_10yr_growth_pct::numeric, 2) as avg_10yr_growth_pct,
    round(cumulative_growth_pct::numeric, 2) as cumulative_growth_pct,
    round(growth_volatility_5yr::numeric, 2) as growth_volatility_5yr,
    trend_classification,
    -- Data quality
    wage_observation_count,
    round(high_quality_pct::numeric, 3) as high_quality_pct,
    -- Metadata
    current_timestamp as calculated_at
from trends
order by occupation_code, area_code, data_year
