-- models/marts/dim_areas.sql
-- Dimension: Geographic areas

{{
  config(
    materialized='table'
  )
}}

with unique_areas as (
    select distinct
        area_code,
        area_level,
        area_text
    from {{ ref('stg_bls_wages') }}
    where area_code is not null
),

enhanced as (
    select
        area_code,
        area_level,
        area_text,

        -- Classify area type
        case
            when area_level = 'National' then 'National'
            when area_level = 'State area' then 'State'
            when area_level = 'Metro area' then 'Metropolitan'
            when area_level = 'Metropolitan division' then 'Metropolitan Division'
            when area_level = 'Nonmetropolitan area' then 'Nonmetropolitan'
            else 'Other'
        end as area_type,

        -- Extract state code from area_code (first 2 digits for most areas)
        -- State areas use full code, metros/nonmetros have state code in first 2 digits
        case
            when area_level = '1' then area_code  -- State areas
            when length(area_code) >= 2 then substring(area_code, 1, 2)  -- Extract state code
            else null
        end as state_code,

        -- Count records for this area
        (
            select count(*)
            from {{ ref('stg_bls_wages') }} s
            where s.area_code = unique_areas.area_code
        ) as record_count

    from unique_areas
)

select * from enhanced
order by area_code