import type { WageData } from '../types'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, Cell } from 'recharts'

interface AggregatedWageResultsProps {
  results: WageData[]
  userSalary: number
}

const AggregatedWageResults = ({ results, userSalary }: AggregatedWageResultsProps) => {
  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value)
  }

  // Calculate aggregate statistics
  const avgMedian = results.reduce((sum, r) => sum + r.median_wage, 0) / results.length
  const avgPercentile = results.reduce((sum, r) => sum + r.userPercentile, 0) / results.length
  const maxMedian = Math.max(...results.map(r => r.median_wage))
  const minMedian = Math.min(...results.map(r => r.median_wage))

  // Best and worst fits
  const bestFit = results.reduce((best, current) =>
    Math.abs(current.median_wage - userSalary) < Math.abs(best.median_wage - userSalary)
      ? current : best
  )
  const highestPaying = results.reduce((highest, current) =>
    current.median_wage > highest.median_wage ? current : highest
  )
  const lowestPaying = results.reduce((lowest, current) =>
    current.median_wage < lowest.median_wage ? current : lowest
  )

  // Prepare bar chart data sorted by median wage
  const chartData = [...results]
    .sort((a, b) => b.median_wage - a.median_wage)
    .map(r => ({
      name: r.occupation_text.length > 30
        ? r.occupation_text.substring(0, 30) + '...'
        : r.occupation_text,
      fullName: r.occupation_text,
      '25th': r.p25_annual_wage,
      'Median': r.median_wage,
      '75th': r.p75_annual_wage,
      'Your Salary': userSalary,
      percentile: r.userPercentile
    }))

  // Color for bars based on comparison to user salary
  const getBarColor = (median: number) => {
    const diff = userSalary - median
    const pctDiff = (diff / median) * 100

    if (pctDiff > 10) return '#10b981' // green - you're well above
    if (pctDiff > 0) return '#84cc16' // light green - you're above
    if (pctDiff > -10) return '#eab308' // yellow - close to median
    return '#ef4444' // red - below
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card bg-gradient-to-br from-purple-50 to-purple-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Multi-Occupation Comparison
        </h2>
        <p className="text-gray-700">
          Comparing your salary of <span className="font-bold text-purple-900">{formatCurrency(userSalary)}</span> across {results.length} occupation categories
        </p>
      </div>

      {/* Aggregate Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Average Percentile */}
        <div className="card bg-gradient-to-br from-blue-50 to-blue-100">
          <h3 className="text-sm font-medium text-gray-600 mb-1">Average Percentile</h3>
          <p className="text-3xl font-bold text-blue-700">
            {avgPercentile.toFixed(0)}th
          </p>
          <p className="text-sm text-gray-600 mt-2">
            Across all {results.length} occupations
          </p>
        </div>

        {/* Average Median */}
        <div className="card">
          <h3 className="text-sm font-medium text-gray-600 mb-1">Average Median Wage</h3>
          <p className="text-3xl font-bold text-gray-900">
            {formatCurrency(avgMedian)}
          </p>
          <p className="text-sm text-gray-600 mt-2">
            Mean of all median wages
          </p>
        </div>

        {/* Range */}
        <div className="card">
          <h3 className="text-sm font-medium text-gray-600 mb-1">Wage Range</h3>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(minMedian)} - {formatCurrency(maxMedian)}
          </p>
          <p className="text-sm text-gray-600 mt-2">
            Spread across occupations
          </p>
        </div>

        {/* Best Fit */}
        <div className="card bg-gradient-to-br from-green-50 to-green-100">
          <h3 className="text-sm font-medium text-gray-600 mb-1">Best Market Fit</h3>
          <p className="text-sm font-bold text-green-700 leading-tight">
            {bestFit.occupation_text.length > 40
              ? bestFit.occupation_text.substring(0, 40) + '...'
              : bestFit.occupation_text}
          </p>
          <p className="text-sm text-gray-600 mt-2">
            Closest to your salary ({bestFit.userPercentile.toFixed(0)}th percentile)
          </p>
        </div>
      </div>

      {/* Comparison Bar Chart */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Salary Comparison Across Occupations
        </h3>
        <div className="mb-4 flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span>Well above median (&gt;10%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-lime-500 rounded"></div>
            <span>Above median</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-500 rounded"></div>
            <span>Near median</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span>Below median</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={Math.max(400, results.length * 60)}>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 150, bottom: 5 }}
            style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} style={{ fontFamily: 'IBM Plex Sans, sans-serif' }} />
            <YAxis type="category" dataKey="name" width={140} style={{ fontFamily: 'IBM Plex Sans, sans-serif' }} />
            <Tooltip
              formatter={(value: number) => formatCurrency(value)}
              labelFormatter={(label: string, payload: any) => {
                if (payload && payload[0]) {
                  return payload[0].payload.fullName
                }
                return label
              }}
              contentStyle={{ fontFamily: 'IBM Plex Sans, sans-serif' }}
            />
            <Legend wrapperStyle={{ fontFamily: 'IBM Plex Sans, sans-serif' }} />
            <Bar dataKey="25th" fill="#93c5fd" name="25th Percentile" />
            <Bar dataKey="Median" name="Median (50th)">
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.Median)} />
              ))}
            </Bar>
            <Bar dataKey="75th" fill="#1e40af" name="75th Percentile" />
            <ReferenceLine
              x={userSalary}
              stroke="#9333ea"
              strokeWidth={3}
              strokeDasharray="5 5"
              label={{ value: 'Your Salary', position: 'top', fill: '#9333ea', fontWeight: 'bold', fontFamily: 'IBM Plex Sans, sans-serif' }}
            />
          </BarChart>
        </ResponsiveContainer>
        <p className="text-sm text-gray-600 mt-4">
          Each occupation shows the wage distribution (25th, 50th, 75th percentiles).
          The purple dashed line represents your salary. Bar color indicates how your salary compares to the median.
        </p>
      </div>

      {/* Detailed Table */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Detailed Breakdown
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Occupation
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Median Wage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Your Percentile
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Difference
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  10-Yr Growth
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {results
                .sort((a, b) => b.median_wage - a.median_wage)
                .map((result, index) => {
                  const diff = userSalary - result.median_wage
                  const diffPct = ((diff / result.median_wage) * 100).toFixed(1)
                  return (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {result.occupation_text}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {formatCurrency(result.median_wage)}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          result.userPercentile >= 75 ? 'bg-green-100 text-green-800' :
                          result.userPercentile >= 50 ? 'bg-blue-100 text-blue-800' :
                          result.userPercentile >= 25 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {result.userPercentile.toFixed(0)}th
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={diff >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {diff >= 0 ? '+' : ''}{formatCurrency(diff)} ({diffPct}%)
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {result.avg_10yr_growth_pct !== null
                          ? `${result.avg_10yr_growth_pct.toFixed(1)}%`
                          : 'N/A'}
                      </td>
                    </tr>
                  )
                })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Key Insights */}
      <div className="card bg-blue-50">
        <h4 className="font-semibold text-gray-900 mb-3">Key Insights</h4>
        <div className="space-y-2 text-sm text-gray-700">
          <p>
            <span className="font-medium">Market Range:</span> Your salary falls within a market range of {formatCurrency(minMedian)} to {formatCurrency(maxMedian)} across the selected roles.
          </p>
          <p>
            <span className="font-medium">Strongest Position:</span> You're at the {bestFit.userPercentile.toFixed(0)}th percentile in your best-fit role, earning {formatCurrency(bestFit.median_wage)} median.
          </p>
          <p>
            <span className="font-medium">Average Position:</span> Across all roles, you're averaging the {avgPercentile.toFixed(0)}th percentile, indicating {
              avgPercentile >= 75 ? 'strong compensation well above market rates' :
              avgPercentile >= 50 ? 'competitive compensation near or above market median' :
              avgPercentile >= 25 ? 'room for growth toward market median' :
              'significant opportunity for salary growth'
            }.
          </p>
        </div>
      </div>
    </div>
  )
}

export default AggregatedWageResults
