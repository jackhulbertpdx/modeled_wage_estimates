-- models/marts/wage_summary.sql
-- Summary: Aggregated wage statistics by occupation and year

{{
  config(
    materialized='table'
  )
}}

with wage_stats as (
    select
        f.occupation_code,
        o.occupation_text,
        o.major_occupation_group,
        o.occupation_level,
        f.data_year,
        
        -- Wage statistics
        count(*) as record_count,
        round(avg(f.avg_hourly_wage), 2) as avg_wage,
        round(min(f.avg_hourly_wage), 2) as min_wage,
        round(max(f.avg_hourly_wage), 2) as max_wage,
        round(percentile_cont(0.5) within group (order by f.avg_hourly_wage), 2) as median_wage,
        round(percentile_cont(0.25) within group (order by f.avg_hourly_wage), 2) as p25_wage,
        round(percentile_cont(0.75) within group (order by f.avg_hourly_wage), 2) as p75_wage,
        
        -- Annual equivalents
        round(avg(f.estimated_annual_wage), 0) as avg_annual_wage,
        round(min(f.estimated_annual_wage), 0) as min_annual_wage,
        round(max(f.estimated_annual_wage), 0) as max_annual_wage,
        
        -- Coverage statistics
        count(distinct f.area_code) as area_count,
        sum(case when f.is_union then 1 else 0 end) as union_record_count,
        sum(case when f.is_fulltime then 1 else 0 end) as fulltime_record_count,
        
        -- Data quality
        round(avg(nullif(f.relative_standard_error, 0)), 2) as avg_relative_standard_error,
        sum(case when f.estimate_quality = 'High' then 1 else 0 end)::float / count(*) as high_quality_pct
        
    from {{ ref('fct_wages') }} f
    inner join {{ ref('dim_occupations') }} o 
        on f.occupation_code = o.occupation_code
    group by 
        f.occupation_code,
        o.occupation_text,
        o.major_occupation_group,
        o.occupation_level,
        f.data_year
)

select * from wage_stats
order by data_year desc, avg_wage desc