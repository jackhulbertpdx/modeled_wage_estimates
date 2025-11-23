import { useState, useEffect } from 'react'
import { CHART_COLORS } from '../utils/chartColors'

interface GeoData {
  area_code: string
  area_text: string
  area_type: string
  state_code?: string
  median_wage: number
  occupation_text: string
  occupation_code: string
  p25_annual_wage: number
  p75_annual_wage: number
  data_year: number
}

const GeographicExplorer = () => {
  const [loading, setLoading] = useState(true)
  const [geoData, setGeoData] = useState<GeoData[]>([])
  const [viewType, setViewType] = useState<'state' | 'metro'>('state')
  const [selectedOccupation, setSelectedOccupation] = useState<string>('')
  const [occupations, setOccupations] = useState<string[]>([])

  // Helper function to normalize text casing to title case
  const toTitleCase = (text: string): string => {
    return text
      .toLowerCase()
      .split(' ')
      .map(word => {
        const lowercase = ['a', 'an', 'and', 'as', 'at', 'by', 'for', 'in', 'of', 'on', 'or', 'the', 'to', 'with']
        return lowercase.includes(word) ? word : word.charAt(0).toUpperCase() + word.slice(1)
      })
      .join(' ')
      .replace(/^./, (char) => char.toUpperCase())
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value)
  }

  // Load all occupations from both state and metro data on mount
  useEffect(() => {
    const loadAllOccupations = async () => {
      try {
        const [stateRes, metroRes] = await Promise.all([
          fetch('/data/wages_latest_state.json'),
          fetch('/data/wages_latest_metropolitan.json')
        ])

        const stateData = await stateRes.json()
        const metroData = await metroRes.json()

        // Combine and extract unique occupations from both datasets
        const allData = [...stateData, ...metroData]
        const uniqueOccs = Array.from(
          new Set(allData.map((d: GeoData) => toTitleCase(d.occupation_text)))
        ).sort()

        setOccupations(uniqueOccs as string[])

        if (!selectedOccupation && uniqueOccs.length > 0) {
          setSelectedOccupation(uniqueOccs[0] as string)
        }
      } catch (error) {
        console.error('Error loading occupation list:', error)
      }
    }

    loadAllOccupations()
  }, [])

  // Load geographic data based on selected view type
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        const dataFile = viewType === 'state'
          ? '/data/wages_latest_state.json'
          : '/data/wages_latest_metropolitan.json'

        const response = await fetch(dataFile)
        const data = await response.json()

        // Normalize occupation text casing
        const normalizedData = data.map((d: GeoData) => ({
          ...d,
          occupation_text: toTitleCase(d.occupation_text)
        }))

        setGeoData(normalizedData)
      } catch (error) {
        console.error('Error loading geographic data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [viewType])

  // Filter, deduplicate by area_code, and sort data
  const filteredData = selectedOccupation
    ? (() => {
        const filtered = geoData.filter(d => d.occupation_text === selectedOccupation)

        // Deduplicate by area_code - keep the entry with the highest median wage if duplicates exist
        const areaMap = new Map<string, GeoData>()
        filtered.forEach(d => {
          const existing = areaMap.get(d.area_code)
          if (!existing || d.median_wage > existing.median_wage) {
            areaMap.set(d.area_code, d)
          }
        })

        // Convert back to array and sort by median wage
        return Array.from(areaMap.values()).sort((a, b) => b.median_wage - a.median_wage)
      })()
    : []

  const stats = filteredData.length > 0 ? {
    highest: filteredData[0],
    lowest: filteredData[filteredData.length - 1],
    average: filteredData.reduce((sum, d) => sum + d.median_wage, 0) / filteredData.length
  } : null

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-[#FAFAFA]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2383E2] mx-auto mb-4"></div>
          <p className="text-[#787774]">Loading geographic data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full overflow-hidden bg-[#FAFAFA]">
      {/* Left Sidebar - Controls */}
      <div className="w-80 border-r border-[#E3E2E0] bg-white overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-[#37352F] mb-2">
            Geographic Explorer
          </h2>
          <p className="text-sm text-[#787774] mb-6">
            Explore wages across locations
          </p>

          {/* View Type Toggle */}
          <div className="mb-6">
            <label className="label">Geography Type</label>
            <div className="flex gap-2">
              <button
                onClick={() => setViewType('state')}
                className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewType === 'state'
                    ? 'bg-[#2383E2] text-white'
                    : 'bg-[#F7F6F3] text-[#37352F] hover:bg-[#EFEEEB] border border-[#E3E2E0]'
                }`}
              >
                States
              </button>
              <button
                onClick={() => setViewType('metro')}
                className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewType === 'metro'
                    ? 'bg-[#2383E2] text-white'
                    : 'bg-[#F7F6F3] text-[#37352F] hover:bg-[#EFEEEB] border border-[#E3E2E0]'
                }`}
              >
                Metro Areas
              </button>
            </div>
          </div>

          {/* Occupation Select */}
          <div>
            <label className="label">Occupation</label>
            <select
              value={selectedOccupation}
              onChange={(e) => setSelectedOccupation(e.target.value)}
              className="input-field text-sm"
            >
              <option value="">Select occupation...</option>
              {occupations.map((occ) => (
                <option key={occ} value={occ}>
                  {occ}
                </option>
              ))}
            </select>
          </div>

          {/* Statistics */}
          {stats && (
            <div className="mt-6 space-y-3">
              <div className="metric-card">
                <p className="text-xs text-[#787774] mb-1">Highest</p>
                <p className="text-sm font-semibold text-[#0F7B6C]">{stats.highest.area_text}</p>
                <p className="text-lg font-bold text-[#37352F]">{formatCurrency(stats.highest.median_wage)}</p>
              </div>

              <div className="metric-card">
                <p className="text-xs text-[#787774] mb-1">Average</p>
                <p className="text-xl font-bold text-[#37352F]">{formatCurrency(stats.average)}</p>
                <p className="text-xs text-[#787774]">{filteredData.length} locations</p>
              </div>

              <div className="metric-card">
                <p className="text-xs text-[#787774] mb-1">Lowest</p>
                <p className="text-sm font-semibold text-[#D9730D]">{stats.lowest.area_text}</p>
                <p className="text-lg font-bold text-[#37352F]">{formatCurrency(stats.lowest.median_wage)}</p>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Right Panel - Data Table */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-8">
          {selectedOccupation ? (
            <div className="chart-container">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-[#37352F] mb-1">
                  {selectedOccupation}
                </h3>
                <p className="text-sm text-[#787774]">
                  Median wages across {viewType === 'state' ? 'states' : 'metropolitan areas'}
                </p>
              </div>

              {/* Data Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-[#E3E2E0]">
                      <th className="text-left py-3 px-4 text-xs font-medium text-[#787774] uppercase tracking-wide">
                        Rank
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-[#787774] uppercase tracking-wide">
                        Location
                      </th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-[#787774] uppercase tracking-wide">
                        Median Wage
                      </th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-[#787774] uppercase tracking-wide">
                        25th - 75th
                      </th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-[#787774] uppercase tracking-wide">
                        vs Average
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map((location, index) => {
                      const vsAvg = stats ? ((location.median_wage - stats.average) / stats.average) * 100 : 0
                      const isAboveAvg = vsAvg > 0

                      return (
                        <tr
                          key={location.area_code}
                          className="border-b border-[#E3E2E0] hover:bg-[#F7F6F3] transition-colors"
                        >
                          <td className="py-3 px-4 text-sm text-[#787774]">
                            #{index + 1}
                          </td>
                          <td className="py-3 px-4 text-sm font-medium text-[#37352F]">
                            {location.area_text}
                          </td>
                          <td className="py-3 px-4 text-right text-sm font-semibold text-[#37352F]">
                            {formatCurrency(location.median_wage)}
                          </td>
                          <td className="py-3 px-4 text-right text-xs text-[#787774]">
                            {formatCurrency(location.p25_annual_wage)} - {formatCurrency(location.p75_annual_wage)}
                          </td>
                          <td className="py-3 px-4 text-right text-sm">
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                                isAboveAvg
                                  ? 'bg-[#E6F3F1] text-[#0F7B6C]'
                                  : 'bg-[#FCF0E6] text-[#D9730D]'
                              }`}
                            >
                              {isAboveAvg ? '+' : ''}{vsAvg.toFixed(1)}%
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* Empty state */
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-md">
                <h3 className="text-xl font-semibold text-[#37352F] mb-2">
                  Select an occupation
                </h3>
                <p className="text-[#787774]">
                  Choose an occupation from the left sidebar to explore geographic wage variations
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default GeographicExplorer
