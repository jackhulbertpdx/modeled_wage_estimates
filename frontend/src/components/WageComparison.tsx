import { useState, useEffect } from 'react'
import WageForm from './WageForm'
import WageResults from './WageResults'
import AggregatedWageResults from './AggregatedWageResults'
import type { Occupation, Area, WageData } from '../types'

const WageComparison = () => {
  const [occupations, setOccupations] = useState<Occupation[]>([])
  const [areas, setAreas] = useState<Area[]>([])
  const [availabilityMap, setAvailabilityMap] = useState<Record<string, string[]>>({})
  const [loading, setLoading] = useState(true)
  const [results, setResults] = useState<WageData[]>([])
  const [userSalary, setUserSalary] = useState<number>(0)
  const [selectedOccupationCodes, setSelectedOccupationCodes] = useState<string[]>([])
  const [selectedAreaCode, setSelectedAreaCode] = useState<string>('')

  // Helper function to normalize text casing to title case
  const toTitleCase = (text: string): string => {
    return text
      .toLowerCase()
      .split(' ')
      .map(word => {
        // Keep certain words lowercase (articles, conjunctions, prepositions)
        const lowercase = ['a', 'an', 'and', 'as', 'at', 'by', 'for', 'in', 'of', 'on', 'or', 'the', 'to', 'with']
        return lowercase.includes(word) ? word : word.charAt(0).toUpperCase() + word.slice(1)
      })
      .join(' ')
      .replace(/^./, (char) => char.toUpperCase()) // Ensure first character is always uppercase
  }

  // Load occupation and area lists on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [occupationsRes, areasRes, mappingRes] = await Promise.all([
          fetch('/data/occupations.json'),
          fetch('/data/areas.json'),
          fetch('/data/occupation_area_mapping.json')
        ])

        const occupationsData = await occupationsRes.json()
        const areasData = await areasRes.json()
        const mappingData = await mappingRes.json()

        // Deduplicate occupations by occupation_code and normalize casing
        const uniqueOccupations = Array.from(
          new Map(occupationsData.map((occ: Occupation) => [occ.occupation_code, {
            ...occ,
            occupation_text: toTitleCase(occ.occupation_text)
          }])).values()
        )

        // Deduplicate areas by area_code
        const uniqueAreas = Array.from(
          new Map(areasData.map((area: Area) => [area.area_code, area])).values()
        )

        setOccupations(uniqueOccupations)
        setAreas(uniqueAreas)
        setAvailabilityMap(mappingData)
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const handleCompare = async (occupationCodes: string[], salary: number, areaCode: string) => {
    setLoading(true)
    setUserSalary(salary)
    setSelectedOccupationCodes(occupationCodes)
    setSelectedAreaCode(areaCode)

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
      console.log(`Comparing ${occupationCodes.length} occupation(s)`)

      // Load wage data for the selected occupations and area
      const wageDataRes = await fetch(wageDataFile)
      const timeSeriesRes = await fetch('/data/time_series_national.json')

      const wageData = await wageDataRes.json()
      const timeSeriesData = await timeSeriesRes.json()

      // Find wage records for all selected occupations
      const occupationResults: WageData[] = []
      const notFoundOccupations: string[] = []

      for (const occupationCode of occupationCodes) {
        const wageRecord = wageData.find((w: any) =>
          w.occupation_code === occupationCode && w.area_code === areaCode
        )

        const occupationTimeSeries = timeSeriesData.filter((t: any) =>
          t.occupation_code === occupationCode && t.area_code === '0000000'
        )

        if (wageRecord) {
          // Calculate user's percentile
          const percentile = calculatePercentile(
            salary,
            wageRecord.p25_annual_wage,
            wageRecord.median_wage,
            wageRecord.p75_annual_wage
          )

          occupationResults.push({
            ...wageRecord,
            userSalary: salary,
            userPercentile: percentile,
            timeSeries: occupationTimeSeries
          })
        } else {
          const occupation = occupations.find(o => o.occupation_code === occupationCode)
          notFoundOccupations.push(occupation?.occupation_text || occupationCode)
        }
      }

      if (occupationResults.length > 0) {
        setResults(occupationResults)

        // Show warning if some occupations don't have data
        if (notFoundOccupations.length > 0) {
          alert(`Note: No wage data found for ${notFoundOccupations.length} occupation(s) in ${area?.area_text || 'this area'}:\n- ${notFoundOccupations.join('\n- ')}\n\nShowing results for ${occupationResults.length} occupation(s).`)
        }
      } else {
        alert(`No wage data found for any of the selected occupations in ${area?.area_text || 'this area'}. Try selecting a different location.`)
        setResults([])
      }
    } catch (error) {
      console.error('Error fetching wage data:', error)
      alert('Error loading wage data. Please try again.')
      setResults([])
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
    <div className="flex h-screen overflow-hidden bg-[#FAFAFA]">
      {/* Left Sidebar - Configuration Panel */}
      <div className="w-96 border-r border-gray-200 bg-white overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Salary Comparison
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            Compare your salary against market data
          </p>
          <WageForm
            occupations={occupations}
            areas={areas}
            availabilityMap={availabilityMap}
            onSubmit={handleCompare}
            loading={loading}
          />
        </div>
      </div>

      {/* Right Panel - Results */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-8">
          {results.length > 0 ? (
            <>
              {/* Show aggregated view for multiple occupations */}
              {results.length > 1 ? (
                <AggregatedWageResults results={results} userSalary={userSalary} />
              ) : (
                /* Single occupation - show regular results */
                <WageResults data={results[0]} />
              )}
            </>
          ) : (
            /* Empty state */
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-md">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No results yet
                </h3>
                <p className="text-gray-500">
                  Select an occupation and enter your salary to see how you compare to the market
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default WageComparison
