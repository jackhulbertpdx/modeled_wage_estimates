-- models/marts/mart_geographic_comparison.sql
-- Application-ready mart for Geographic Wage Explorer
-- Optimized for comparing wages across multiple locations for same occupation

{{
  config(
    materialized='table'
  )
}}

with latest_wages as (
    select
        occupation_code,
        occupation_text,
        major_occupation_group,
        area_code,
        area_text,
        area_type,
        state_code,
        data_year,
        p50_annual_wage as median_annual_wage,
        p50_hourly_wage as median_hourly_wage,
        mean_annual_wage,
        mean_hourly_wage,
        avg_10yr_growth_pct as growth_rate_10yr,
        yoy_median_growth_pct as growth_rate_yoy,
        trend_classification,
        wage_observation_count,
        high_quality_pct,
        is_latest_year
    from {{ ref('int_time_series') }}
    where is_latest_year = true  -- Only latest year for geographic comparison
        and area_type in ('Metropolitan', 'State', 'National')  -- Focus on major geographic areas
),

-- Calculate national benchmark for each occupation
national_benchmark as (
    select
        occupation_code,
        median_annual_wage as national_median_wage,
        median_hourly_wage as national_median_hourly,
        growth_rate_10yr as national_growth_rate
    from latest_wages
    where area_type = 'National'
),

-- Get cost of living data
cost_of_living as (
    select
        state_code,
        col_index,
        data_source
    from {{ ref('cost_of_living_index') }}
    where data_year = (select max(data_year) from {{ ref('cost_of_living_index') }})
),

-- Calculate state averages for context
state_averages as (
    select
        state_code,
        occupation_code,
        avg(median_annual_wage) as state_avg_wage,
        count(distinct area_code) as metro_count_in_state
    from latest_wages
    where area_type = 'Metropolitan'
        and state_code is not null
    group by state_code, occupation_code
),

-- Rank metros within each occupation
metro_rankings as (
    select
        lw.*,
        nb.national_median_wage,
        nb.national_median_hourly,
        nb.national_growth_rate,
        sa.state_avg_wage,
        sa.metro_count_in_state,
        col.col_index,
        col.data_source as col_data_source,
        -- Rank by nominal wage
        row_number() over (
            partition by lw.occupation_code
            order by lw.median_annual_wage desc
        ) as wage_rank_nominal,
        -- Rank by growth rate
        row_number() over (
            partition by lw.occupation_code
            order by lw.growth_rate_10yr desc nulls last
        ) as wage_rank_growth,
        -- Calculate percentile within occupation
        percent_rank() over (
            partition by lw.occupation_code
            order by lw.median_annual_wage
        ) as wage_percentile,
        -- Count of areas for this occupation
        count(*) over (partition by lw.occupation_code) as total_areas_for_occupation
    from latest_wages lw
    left join national_benchmark nb
        on lw.occupation_code = nb.occupation_code
    left join state_averages sa
        on lw.state_code = sa.state_code
        and lw.occupation_code = sa.occupation_code
    left join cost_of_living col
        on lw.state_code = col.state_code
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
    try_cast(data_year as integer) as latest_year,
    -- Local wages
    round(median_annual_wage::numeric, 0) as median_annual_wage,
    round(median_hourly_wage::numeric, 2) as median_hourly_wage,
    round(mean_annual_wage::numeric, 0) as mean_annual_wage,
    round(mean_hourly_wage::numeric, 2) as mean_hourly_wage,
    -- National comparison
    round(national_median_wage::numeric, 0) as national_median_wage,
    round(national_median_hourly::numeric, 2) as national_median_hourly,
    case
        when national_median_wage is not null and national_median_wage > 0
        then round(
            (((median_annual_wage - national_median_wage) / national_median_wage) * 100)::numeric,
            2
        )
        else null
    end as diff_from_national_pct,
    round((median_annual_wage - national_median_wage)::numeric, 0) as diff_from_national_dollars,
    -- State comparison (for metros)
    round(state_avg_wage::numeric, 0) as state_avg_wage,
    case
        when state_avg_wage is not null and state_avg_wage > 0
        then round(
            (((median_annual_wage - state_avg_wage) / state_avg_wage) * 100)::numeric,
            2
        )
        else null
    end as diff_from_state_pct,
    metro_count_in_state,
    -- Growth metrics
    round(growth_rate_yoy::numeric, 2) as growth_rate_yoy,
    round(growth_rate_10yr::numeric, 2) as growth_rate_10yr,
    round(national_growth_rate::numeric, 2) as national_growth_rate,
    case
        when national_growth_rate is not null
        then round((growth_rate_10yr - national_growth_rate)::numeric, 2)
        else null
    end as growth_rate_vs_national,
    trend_classification,
    -- Rankings
    wage_rank_nominal,
    wage_rank_growth,
    round((wage_percentile * 100)::numeric, 1) as wage_percentile,
    total_areas_for_occupation,
    -- Cost of living (from seed data)
    round(col_index::numeric, 2) as cost_of_living_index,
    case
        when col_index is not null and col_index > 0
        then round((median_annual_wage / col_index * 100)::numeric, 0)
        else null
    end as purchasing_power_wage,
    case
        when col_index is not null
        then row_number() over (
            partition by occupation_code
            order by (median_annual_wage / nullif(col_index, 0)) desc
        )
        else null
    end as purchasing_power_rank,
    col_data_source,
    -- Classification for UI filtering
    case
        when median_annual_wage >= national_median_wage * 1.2 then 'High Wage Market'
        when median_annual_wage >= national_median_wage * 0.9 then 'Average Wage Market'
        else 'Below Average Market'
    end as market_classification,
    case
        when growth_rate_10yr >= 3.0 then 'Fast Growing'
        when growth_rate_10yr >= 1.5 then 'Growing'
        when growth_rate_10yr >= 0.0 then 'Slow Growing'
        else 'Stagnant/Declining'
    end as growth_classification,
    -- Data quality
    wage_observation_count,
    round(high_quality_pct::numeric, 3) as high_quality_pct,
    case
        when wage_observation_count >= 30 and high_quality_pct >= 0.7 then 'High'
        when wage_observation_count >= 15 and high_quality_pct >= 0.5 then 'Medium'
        else 'Low'
    end as data_reliability,
    -- Metadata
    current_timestamp as generated_at
from metro_rankings
where wage_observation_count >= 10  -- Only include areas with reasonable sample size
order by occupation_code, wage_rank_nominal
