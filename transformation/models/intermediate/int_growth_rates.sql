-- models/intermediate/int_growth_rates.sql
-- Calculate year-over-year wage growth rates
-- Used for trend analysis and career projections

{{
  config(
    materialized='table'
  )
}}

with wage_by_year as (
    select
        occupation_code,
        occupation_text,
        major_occupation_group,
        area_code,
        area_text,
        area_type,
        state_code,
        data_year,
        p50_hourly_wage as median_hourly_wage,
        p50_annual_wage as median_annual_wage,
        mean_hourly_wage,
        mean_annual_wage,
        wage_observation_count
    from {{ ref('int_wage_percentiles_by_location') }}
),

lagged_wages as (
    select
        occupation_code,
        occupation_text,
        major_occupation_group,
        area_code,
        area_text,
        area_type,
        state_code,
        data_year,
        median_hourly_wage,
        median_annual_wage,
        mean_hourly_wage,
        mean_annual_wage,
        wage_observation_count,
        -- Get previous year's wages for comparison
        lag(median_hourly_wage, 1) over (
            partition by occupation_code, area_code
            order by data_year
        ) as prev_year_median_hourly,
        lag(median_annual_wage, 1) over (
            partition by occupation_code, area_code
            order by data_year
        ) as prev_year_median_annual,
        lag(mean_hourly_wage, 1) over (
            partition by occupation_code, area_code
            order by data_year
        ) as prev_year_mean_hourly,
        -- Get the previous year value
        lag(data_year, 1) over (
            partition by occupation_code, area_code
            order by data_year
        ) as prev_year
    from wage_by_year
),

growth_calculations as (
    select
        occupation_code,
        occupation_text,
        major_occupation_group,
        area_code,
        area_text,
        area_type,
        state_code,
        data_year,
        prev_year,
        median_hourly_wage,
        median_annual_wage,
        mean_hourly_wage,
        mean_annual_wage,
        prev_year_median_hourly,
        prev_year_median_annual,
        prev_year_mean_hourly,
        wage_observation_count,
        -- Calculate year-over-year growth
        case
            when prev_year_median_hourly is not null and prev_year_median_hourly > 0
            then ((median_hourly_wage - prev_year_median_hourly) / prev_year_median_hourly) * 100
            else null
        end as yoy_median_growth_pct,
        case
            when prev_year_median_hourly is not null
            then median_hourly_wage - prev_year_median_hourly
            else null
        end as yoy_median_growth_dollars,
        case
            when prev_year_mean_hourly is not null and prev_year_mean_hourly > 0
            then ((mean_hourly_wage - prev_year_mean_hourly) / prev_year_mean_hourly) * 100
            else null
        end as yoy_mean_growth_pct,
        case
            when prev_year_mean_hourly is not null
            then mean_hourly_wage - prev_year_mean_hourly
            else null
        end as yoy_mean_growth_dollars
    from lagged_wages
),

-- Calculate multi-year averages
multi_year_growth as (
    select
        occupation_code,
        occupation_text,
        major_occupation_group,
        area_code,
        area_text,
        area_type,
        state_code,
        data_year,
        median_hourly_wage,
        median_annual_wage,
        mean_hourly_wage,
        mean_annual_wage,
        yoy_median_growth_pct,
        yoy_median_growth_dollars,
        yoy_mean_growth_pct,
        yoy_mean_growth_dollars,
        wage_observation_count,
        -- 3-year average growth rate
        avg(yoy_median_growth_pct) over (
            partition by occupation_code, area_code
            order by data_year
            rows between 2 preceding and current row
        ) as avg_3yr_growth_pct,
        -- 5-year average growth rate
        avg(yoy_median_growth_pct) over (
            partition by occupation_code, area_code
            order by data_year
            rows between 4 preceding and current row
        ) as avg_5yr_growth_pct,
        -- 10-year average growth rate
        avg(yoy_median_growth_pct) over (
            partition by occupation_code, area_code
            order by data_year
            rows between 9 preceding and current row
        ) as avg_10yr_growth_pct,
        -- Cumulative growth from first year
        first_value(median_hourly_wage) over (
            partition by occupation_code, area_code
            order by data_year
            rows between unbounded preceding and unbounded following
        ) as first_year_median_wage,
        -- Growth volatility (standard deviation of growth rates)
        stddev(yoy_median_growth_pct) over (
            partition by occupation_code, area_code
            order by data_year
            rows between 4 preceding and current row
        ) as growth_volatility_5yr
    from growth_calculations
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
    -- Current wages
    round(median_hourly_wage::numeric, 2) as median_hourly_wage,
    round(median_annual_wage::numeric, 0) as median_annual_wage,
    round(mean_hourly_wage::numeric, 2) as mean_hourly_wage,
    round(mean_annual_wage::numeric, 0) as mean_annual_wage,
    -- Year-over-year growth
    round(yoy_median_growth_pct::numeric, 2) as yoy_median_growth_pct,
    round(yoy_median_growth_dollars::numeric, 2) as yoy_median_growth_dollars,
    round(yoy_mean_growth_pct::numeric, 2) as yoy_mean_growth_pct,
    round(yoy_mean_growth_dollars::numeric, 2) as yoy_mean_growth_dollars,
    -- Multi-year averages
    round(avg_3yr_growth_pct::numeric, 2) as avg_3yr_growth_pct,
    round(avg_5yr_growth_pct::numeric, 2) as avg_5yr_growth_pct,
    round(avg_10yr_growth_pct::numeric, 2) as avg_10yr_growth_pct,
    -- Cumulative growth
    round(first_year_median_wage::numeric, 2) as first_year_median_wage,
    case
        when first_year_median_wage is not null and first_year_median_wage > 0
        then round(
            (((median_hourly_wage - first_year_median_wage) / first_year_median_wage) * 100)::numeric,
            2
        )
        else null
    end as cumulative_growth_pct,
    -- Volatility
    round(growth_volatility_5yr::numeric, 2) as growth_volatility_5yr,
    -- Metadata
    wage_observation_count,
    current_timestamp as calculated_at
from multi_year_growth
order by occupation_code, area_code, data_year
