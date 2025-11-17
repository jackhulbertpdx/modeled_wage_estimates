import { useState, useEffect } from 'react'
import WageForm from './WageForm'
import WageResults from './WageResults'
import type { Occupation, Area, WageData } from '../types'

const WageComparison = () => {
  const [occupations, setOccupations] = useState<Occupation[]>([])
  const [areas, setAreas] = useState<Area[]>([])
  const [loading, setLoading] = useState(true)
  const [results, setResults] = useState<WageData | null>(null)

  // Load occupation and area lists on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [occupationsRes, areasRes] = await Promise.all([
          fetch('/data/occupations.json'),
          fetch('/data/areas.json')
        ])

        const occupationsData = await occupationsRes.json()
        const areasData = await areasRes.json()

        // Deduplicate occupations by occupation_code
        const uniqueOccupations = Array.from(
          new Map(occupationsData.map((occ: Occupation) => [occ.occupation_code, occ])).values()
        )

        // Deduplicate areas by area_code
        const uniqueAreas = Array.from(
          new Map(areasData.map((area: Area) => [area.area_code, area])).values()
        )

        setOccupations(uniqueOccupations)
        setAreas(uniqueAreas)
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const handleCompare = async (occupationCode: string, salary: number, areaCode: string) => {
    setLoading(true)
    try {
      // Determine which data file to load based on area code
      const area = areas.find(a => a.area_code === areaCode)
      let wageDataFile = '/data/wages_latest_national.json'

      if (area) {
        if (area.area_type === 'State') {
          wageDataFile = '/data/wages_latest_state.json'
        } else if (area.area_type === 'Metropolitan' || area.area_type === 'Metropolitan Division') {
          wageDataFile = '/data/wages_latest_metropolitan.json'
        }
      }

      console.log(`Loading ${wageDataFile} for area ${areaCode} (${area?.area_type})`)

      // Load wage data for the selected occupation and area
      const wageDataRes = await fetch(wageDataFile)
      const timeSeriesRes = await fetch('/data/time_series_national.json')

      const wageData = await wageDataRes.json()
      const timeSeriesData = await timeSeriesRes.json()

      // Find the specific wage record
      const wageRecord = wageData.find((w: any) =>
        w.occupation_code === occupationCode && w.area_code === areaCode
      )

      // Find time series for this occupation (national data only for now)
      const occupationTimeSeries = timeSeriesData.filter((t: any) =>
        t.occupation_code === occupationCode && t.area_code === '0000000'
      )

      if (wageRecord) {
        // Calculate user's percentile
        const percentile = calculatePercentile(
          salary,
          wageRecord.p25_annual_wage,
          wageRecord.p50_annual_wage,
          wageRecord.p75_annual_wage
        )

        setResults({
          ...wageRecord,
          userSalary: salary,
          userPercentile: percentile,
          timeSeries: occupationTimeSeries
        })
      } else {
        alert(`No wage data found for this occupation in ${area?.area_text || 'this area'}. Try selecting a different location or occupation.`)
        setResults(null)
      }
    } catch (error) {
      console.error('Error fetching wage data:', error)
      alert('Error loading wage data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const calculatePercentile = (
    salary: number,
    p25: number,
    p50: number,
    p75: number
  ): number => {
    if (salary <= p25) return 25 * (salary / p25)
    if (salary <= p50) return 25 + 25 * ((salary - p25) / (p50 - p25))
    if (salary <= p75) return 50 + 25 * ((salary - p50) / (p75 - p50))
    return 75 + 25 * Math.min((salary - p75) / (p75 - p50), 1)
  }

  if (loading && occupations.length === 0) {
    return (
      <div className="card">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <span className="ml-4 text-gray-600">Loading data...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Input Form */}
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Compare Your Salary
        </h2>
        <WageForm
          occupations={occupations}
          areas={areas}
          onSubmit={handleCompare}
          loading={loading}
        />
      </div>

      {/* Results */}
      {results && (
        <WageResults data={results} />
      )}
    </div>
  )
}

export default WageComparison
