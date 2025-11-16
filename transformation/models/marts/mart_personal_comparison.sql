-- models/marts/mart_personal_comparison.sql
-- Application-ready mart for Personal Wage Comparison Dashboard
-- Optimized for queries filtering by occupation + location + year range

{{
  config(
    materialized='table'
  )
}}

with time_series_data as (
    select
        occupation_code,
        occupation_text,
        major_occupation_group,
        area_code,
        area_text,
        area_type,
        state_code,
        data_year,
        -- Percentiles
        p25_hourly_wage,
        p50_hourly_wage,
        p75_hourly_wage,
        p25_annual_wage,
        p50_annual_wage,
        p75_annual_wage,
        mean_hourly_wage,
        mean_annual_wage,
        -- Growth metrics
        yoy_median_growth_pct,
        avg_3yr_growth_pct,
        avg_10yr_growth_pct,
        cumulative_growth_pct,
        trend_classification,
        -- Data quality
        wage_observation_count,
        high_quality_pct,
        is_latest_year,
        total_years_with_data
    from {{ ref('int_time_series') }}
),

-- Get latest year data for each occupation/area combination
latest_year_data as (
    select
        occupation_code,
        occupation_text,
        major_occupation_group,
        area_code,
        area_text,
        area_type,
        state_code,
        data_year as latest_year,
        p50_annual_wage as latest_median_wage,
        p25_annual_wage as latest_p25_wage,
        p75_annual_wage as latest_p75_wage,
        avg_10yr_growth_pct as long_term_growth_rate,
        trend_classification as current_trend
    from time_series_data
    where is_latest_year = true
),

-- Calculate 10-year historical range
ten_year_stats as (
    select
        occupation_code,
        area_code,
        min(p50_annual_wage) as ten_year_min_wage,
        max(p50_annual_wage) as ten_year_max_wage,
        avg(p50_annual_wage) as ten_year_avg_wage,
        -- Calculate CAGR (Compound Annual Growth Rate) over available period
        case
            when count(*) >= 2 and max(data_year) > min(data_year)
            then (
                power(
                    max(case when is_latest_year then p50_annual_wage else null end) /
                    nullif(min(p50_annual_wage), 0),
                    1.0 / nullif((max(data_year) - min(data_year)), 0)
                ) - 1
            ) * 100
            else null
        end as cagr_pct
    from time_series_data
    group by occupation_code, area_code
)

select
    -- Primary identifiers (optimized for filtering)
    ts.occupation_code,
    ts.occupation_text,
    ts.major_occupation_group,
    ts.area_code,
    ts.area_text,
    ts.area_type,
    ts.state_code,
    try_cast(ts.data_year as integer) as data_year,
    -- Annual wage percentiles (most commonly used)
    round(ts.p25_annual_wage::numeric, 0) as p25_annual_wage,
    round(ts.p50_annual_wage::numeric, 0) as p50_annual_wage,
    round(ts.p75_annual_wage::numeric, 0) as p75_annual_wage,
    round(ts.mean_annual_wage::numeric, 0) as mean_annual_wage,
    -- Hourly wage percentiles (for hourly comparisons)
    round(ts.p25_hourly_wage::numeric, 2) as p25_hourly_wage,
    round(ts.p50_hourly_wage::numeric, 2) as p50_hourly_wage,
    round(ts.p75_hourly_wage::numeric, 2) as p75_hourly_wage,
    round(ts.mean_hourly_wage::numeric, 2) as mean_hourly_wage,
    -- Growth metrics
    round(ts.yoy_median_growth_pct::numeric, 2) as yoy_growth_pct,
    round(ts.avg_3yr_growth_pct::numeric, 2) as avg_3yr_growth_pct,
    round(ts.avg_10yr_growth_pct::numeric, 2) as avg_10yr_growth_pct,
    round(ts.cumulative_growth_pct::numeric, 2) as cumulative_growth_pct,
    ts.trend_classification,
    -- Latest year summary metrics
    ly.latest_year,
    round(ly.latest_median_wage::numeric, 0) as latest_median_wage,
    ly.current_trend,
    round(ly.long_term_growth_rate::numeric, 2) as long_term_growth_rate,
    -- 10-year historical context
    round(tys.ten_year_min_wage::numeric, 0) as ten_year_min_wage,
    round(tys.ten_year_max_wage::numeric, 0) as ten_year_max_wage,
    round(tys.ten_year_avg_wage::numeric, 0) as ten_year_avg_wage,
    round(tys.cagr_pct::numeric, 2) as cagr_pct,
    -- Helper calculations for user comparison
    -- These can be used in the API to quickly calculate user's percentile
    round((ts.p75_annual_wage - ts.p25_annual_wage)::numeric, 0) as iqr_annual,
    round((ts.p50_annual_wage - ts.p25_annual_wage)::numeric, 0) as p25_to_median_range,
    round((ts.p75_annual_wage - ts.p50_annual_wage)::numeric, 0) as median_to_p75_range,
    -- Data quality indicators
    ts.wage_observation_count,
    round(ts.high_quality_pct::numeric, 3) as high_quality_pct,
    case
        when ts.wage_observation_count >= 30 and ts.high_quality_pct >= 0.7 then 'High'
        when ts.wage_observation_count >= 15 and ts.high_quality_pct >= 0.5 then 'Medium'
        else 'Low'
    end as data_reliability,
    -- Flags
    ts.is_latest_year,
    ts.total_years_with_data,
    -- Metadata
    current_timestamp as generated_at
from time_series_data ts
left join latest_year_data ly
    on ts.occupation_code = ly.occupation_code
    and ts.area_code = ly.area_code
left join ten_year_stats tys
    on ts.occupation_code = tys.occupation_code
    and ts.area_code = tys.area_code
-- Filter to only include areas with sufficient data quality
where ts.wage_observation_count >= 5
order by ts.occupation_code, ts.area_code, ts.data_year
