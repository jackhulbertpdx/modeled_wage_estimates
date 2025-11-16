export interface Occupation {
  occupation_code: string
  occupation_text: string
  major_occupation_group: string
}

export interface Area {
  area_code: string
  area_text: string
  area_type: string
  state_code?: string
}

export interface WageRecord {
  occupation_code: string
  occupation_text: string
  area_code: string
  area_text: string
  area_type: string
  state_code?: string
  data_year: number
  median_wage: number
  p25_annual_wage: number
  p50_annual_wage: number
  p75_annual_wage: number
  mean_annual_wage: number
  avg_10yr_growth_pct: number
  trend_classification: string
  data_reliability: string
}

export interface TimeSeriesPoint {
  occupation_code: string
  area_code: string
  data_year: number
  p25_annual_wage: number
  p50_annual_wage: number
  p75_annual_wage: number
  yoy_growth_pct: number
}

export interface WageData extends WageRecord {
  userSalary: number
  userPercentile: number
  timeSeries: TimeSeriesPoint[]
}
