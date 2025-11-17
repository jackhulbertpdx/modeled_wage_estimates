-- models/marts/dim_occupations.sql
-- Dimension: Occupations

{{
  config(
    materialized='table'
  )
}}

with unique_occupations as (
    select
        occupation_code,
        -- Take the most common occupation_text for each code
        mode(occupation_text) as occupation_text
    from {{ ref('stg_bls_wages') }}
    where occupation_code is not null
    group by occupation_code
),

enhanced as (
    select
        occupation_code,
        occupation_text,
        
        -- Extract major occupation group (first 2 digits)
        left(occupation_code, 2) as major_occupation_group,
        
        -- Classify occupation level
        case 
            when length(occupation_code) = 2 then 'Major Group'
            when length(occupation_code) = 4 then 'Minor Group'
            when length(occupation_code) = 6 then 'Detailed Occupation'
            else 'Other'
        end as occupation_level,
        
        -- Count records for this occupation
        (
            select count(*) 
            from {{ ref('stg_bls_wages') }} s 
            where s.occupation_code = unique_occupations.occupation_code
        ) as record_count
        
    from unique_occupations
)

select * from enhanced
order by occupation_code