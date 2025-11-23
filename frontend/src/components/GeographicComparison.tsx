import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts'
import type { WageData } from '../types'

interface GeographicComparisonProps {
  occupationCodes: string[]
  userSalary: number
  occupations: any[]
}

interface GeoWageData {
  area_text: string
  area_code: string
  area_type: string
  median_wage: number
  p25_annual_wage: number
  p75_annual_wage: number
  userPercentile: number
}

const GeographicComparison = ({ occupationCodes, userSalary, occupations }: GeographicComparisonProps) => {
  const [loading, setLoading] = useState(true)
  const [geoData, setGeoData] = useState<GeoWageData[]>([])
  const [viewType, setViewType] = useState<'state' | 'metro'>('state')

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value)
  }

  const calculatePercentile = (
    salary: number,
    p25: number,
    p50: number,
    p75: number
  ): number => {
    if (salary <= p25) return Math.max(0, 25 * (salary / p25))
    if (salary <= p50) return 25 + 25 * ((salary - p25) / (p50 - p25))
    if (salary <= p75) return 50 + 25 * ((salary - p50) / (p75 - p50))
    return Math.min(100, 75 + 25 * ((salary - p75) / (p75 - p50)))
  }

  useEffect(() => {
    const loadGeographicData = async () => {
      setLoading(true)
      try {
        // Load both state and metro data
        const [stateRes, metroRes] = await Promise.all([
          fetch('/data/wages_latest_state.json'),
          fetch('/data/wages_latest_metropolitan.json')
        ])

        const stateData = await stateRes.json()
        const metroData = await metroRes.json()

        // Filter for selected occupations and aggregate
        const processData = (data: any[], areaType: string) => {
          // Group by area
          const areaMap = new Map<string, any[]>()

          for (const occupationCode of occupationCodes) {
            const filtered = data.filter((w: any) => w.occupation_code === occupationCode)
            filtered.forEach((record: any) => {
              const key = record.area_code
              if (!areaMap.has(key)) {
                areaMap.set(key, [])
              }
              areaMap.get(key)!.push(record)
            })
          }

          // Calculate averages for areas that have data for all selected occupations
          const result: GeoWageData[] = []
          areaMap.forEach((records, areaCode) => {
            // Only include areas with data for all occupations
            if (records.length === occupationCodes.length) {
              const avgMedian = records.reduce((sum: number, r: any) => sum + r.median_wage, 0) / records.length
              const avgP25 = records.reduce((sum: number, r: any) => sum + r.p25_annual_wage, 0) / records.length
              const avgP75 = records.reduce((sum: number, r: any) => sum + r.p75_annual_wage, 0) / records.length

              result.push({
                area_text: records[0].area_text,
                area_code: areaCode,
                area_type: areaType,
                median_wage: avgMedian,
                p25_annual_wage: avgP25,
                p75_annual_wage: avgP75,
                userPercentile: calculatePercentile(userSalary, avgP25, avgMedian, avgP75)
              })
            }
          })

          return result
        }

        const stateGeoData = processData(stateData, 'State')
        const metroGeoData = processData(metroData, 'Metropolitan')

        // Set initial view based on data availability
        if (stateGeoData.length > 0) {
          setGeoData(stateGeoData)
          setViewType('state')
        } else if (metroGeoData.length > 0) {
          setGeoData(metroGeoData)
          setViewType('metro')
        }

        // Store both for switching
        (window as any).__stateGeoData = stateGeoData
        (window as any).__metroGeoData = metroGeoData

      } catch (error) {
        console.error('Error loading geographic data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadGeographicData()
  }, [occupationCodes, userSalary])

  const handleViewChange = (type: 'state' | 'metro') => {
    setViewType(type)
    const data = type === 'state'
      ? (window as any).__stateGeoData || []
      : (window as any).__metroGeoData || []
    setGeoData(data)
  }

  if (loading) {
    return (
      <div className="card">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-4 text-gray-600">Loading geographic data...</span>
        </div>
      </div>
    )
  }

  if (geoData.length === 0) {
    return (
      <div className="card bg-yellow-50 border-yellow-200">
        <p className="text-yellow-800">
          No geographic comparison data available for the selected occupation(s).
        </p>
      </div>
    )
  }

  // Sort by median wage (descending)
  const sortedData = [...geoData].sort((a, b) => b.median_wage - a.median_wage)

  // Top 20 for chart
  const topData = sortedData.slice(0, 20).map(d => ({
    name: d.area_text.length > 25 ? d.area_text.substring(0, 25) + '...' : d.area_text,
    fullName: d.area_text,
    'Median Wage': d.median_wage,
    'Your Salary': userSalary,
    percentile: d.userPercentile
  }))

  // Stats
  const highest = sortedData[0]
  const lowest = sortedData[sortedData.length - 1]
  const average = sortedData.reduce((sum, d) => sum + d.median_wage, 0) / sortedData.length

  // Best fit location
  const bestFit = sortedData.reduce((best, current) =>
    Math.abs(current.median_wage - userSalary) < Math.abs(best.median_wage - userSalary)
      ? current : best
  )

  // Color based on comparison to user salary
  const getBarColor = (medianWage: number) => {
    return medianWage >= userSalary ? '#3b82f6' : '#10b981'
  }

  return (
    <div className="space-y-6">
      {/* Header with View Toggle */}
      <div className="card bg-gradient-to-br from-indigo-50 to-indigo-100">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold text-gray-900">
            Geographic Wage Comparison
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => handleViewChange('state')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                viewType === 'state'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              States ({((window as any).__stateGeoData || []).length})
            </button>
            <button
              onClick={() => handleViewChange('metro')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                viewType === 'metro'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Metro Areas ({((window as any).__metroGeoData || []).length})
            </button>
          </div>
        </div>
        <p className="text-gray-700">
          {occupationCodes.length > 1
            ? `Average wages across ${occupationCodes.length} occupations`
            : 'Wage comparison across different locations'}
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card bg-gradient-to-br from-green-50 to-green-100">
          <h3 className="text-sm font-medium text-gray-600 mb-1">Highest Paying</h3>
          <p className="text-lg font-bold text-green-700 leading-tight">
            {highest.area_text}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            {formatCurrency(highest.median_wage)}
          </p>
        </div>

        <div className="card bg-gradient-to-br from-red-50 to-red-100">
          <h3 className="text-sm font-medium text-gray-600 mb-1">Lowest Paying</h3>
          <p className="text-lg font-bold text-red-700 leading-tight">
            {lowest.area_text}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            {formatCurrency(lowest.median_wage)}
          </p>
        </div>

        <div className="card">
          <h3 className="text-sm font-medium text-gray-600 mb-1">Average</h3>
          <p className="text-3xl font-bold text-gray-900">
            {formatCurrency(average)}
          </p>
          <p className="text-sm text-gray-600 mt-2">
            Across {sortedData.length} locations
          </p>
        </div>

        <div className="card bg-gradient-to-br from-blue-50 to-blue-100">
          <h3 className="text-sm font-medium text-gray-600 mb-1">Best Match</h3>
          <p className="text-lg font-bold text-blue-700 leading-tight">
            {bestFit.area_text}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            {formatCurrency(bestFit.median_wage)} ({bestFit.userPercentile.toFixed(0)}th pct)
          </p>
        </div>
      </div>

      {/* Top 20 Bar Chart */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Top 20 {viewType === 'state' ? 'States' : 'Metropolitan Areas'} by Median Wage
        </h3>
        <div className="mb-4 flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <span>Market pays more than you</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span>You earn above market</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={600}>
          <BarChart
            data={topData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 120, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
            <YAxis type="category" dataKey="name" width={110} />
            <Tooltip
              formatter={(value: number) => formatCurrency(value)}
              labelFormatter={(label: string, payload: any) => {
                if (payload && payload[0]) {
                  const percentile = payload[0].payload.percentile
                  return `${payload[0].payload.fullName} (${percentile.toFixed(0)}th percentile)`
                }
                return label
              }}
            />
            <Bar dataKey="Median Wage" name="Median Wage">
              {topData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry['Median Wage'])} />
              ))}
            </Bar>
            <ReferenceLine
              x={userSalary}
              stroke="#9333ea"
              strokeWidth={3}
              strokeDasharray="5 5"
              label={{ value: 'Your Salary', position: 'top', fill: '#9333ea', fontWeight: 'bold' }}
            />
          </BarChart>
        </ResponsiveContainer>
        <p className="text-sm text-gray-600 mt-4">
          Purple dashed line shows your salary. Blue bars indicate markets where you'd earn below median, green bars where you'd earn above median.
        </p>
      </div>

      {/* Full Table */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          All Locations (Ranked by Median Wage)
        </h3>
        <div className="overflow-x-auto max-h-96 overflow-y-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rank
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Median Wage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  25th - 75th Range
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Your Percentile
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  vs Your Salary
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedData.map((location, index) => {
                const diff = userSalary - location.median_wage
                const diffPct = ((diff / location.median_wage) * 100).toFixed(1)
                return (
                  <tr key={location.area_code} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      #{index + 1}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {location.area_text}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-semibold">
                      {formatCurrency(location.median_wage)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatCurrency(location.p25_annual_wage)} - {formatCurrency(location.p75_annual_wage)}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        location.userPercentile >= 75 ? 'bg-green-100 text-green-800' :
                        location.userPercentile >= 50 ? 'bg-blue-100 text-blue-800' :
                        location.userPercentile >= 25 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {location.userPercentile.toFixed(0)}th
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={diff >= 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                        {diff >= 0 ? '+' : ''}{formatCurrency(diff)} ({diffPct}%)
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default GeographicComparison
