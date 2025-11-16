import type { WageData } from '../types'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts'

interface WageResultsProps {
  data: WageData
}

const WageResults = ({ data }: WageResultsProps) => {
  const diffFromMedian = data.userSalary - data.p50_annual_wage
  const diffPct = ((diffFromMedian / data.p50_annual_wage) * 100).toFixed(1)

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value)
  }

  // Prepare chart data
  const chartData = data.timeSeries
    .sort((a, b) => a.data_year - b.data_year)
    .map(point => ({
      year: point.data_year,
      '25th Percentile': point.p25_annual_wage,
      'Median': point.p50_annual_wage,
      '75th Percentile': point.p75_annual_wage,
      'Your Salary': data.userSalary
    }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Your Wage Comparison Results
        </h2>
        <p className="text-gray-600">
          {data.occupation_text} • {data.area_text} • {data.data_year}
        </p>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Percentile Card */}
        <div className="card bg-gradient-to-br from-blue-50 to-blue-100">
          <h3 className="text-sm font-medium text-gray-600 mb-1">Your Percentile</h3>
          <p className="text-3xl font-bold text-blue-700">
            {data.userPercentile.toFixed(0)}th
          </p>
          <p className="text-sm text-gray-600 mt-2">
            You earn more than {data.userPercentile.toFixed(0)}% of workers in this occupation
          </p>
        </div>

        {/* Market Median Card */}
        <div className="card">
          <h3 className="text-sm font-medium text-gray-600 mb-1">Market Median</h3>
          <p className="text-3xl font-bold text-gray-900">
            {formatCurrency(data.p50_annual_wage)}
          </p>
          <p className="text-sm text-gray-600 mt-2">
            50th percentile for this occupation
          </p>
        </div>

        {/* Difference from Median Card */}
        <div className={`card ${diffFromMedian >= 0 ? 'bg-gradient-to-br from-green-50 to-green-100' : 'bg-gradient-to-br from-red-50 to-red-100'}`}>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Difference from Median</h3>
          <p className={`text-3xl font-bold ${diffFromMedian >= 0 ? 'text-green-700' : 'text-red-700'}`}>
            {diffFromMedian >= 0 ? '+' : ''}{formatCurrency(diffFromMedian)}
          </p>
          <p className="text-sm text-gray-600 mt-2">
            {diffPct >= '0' ? '+' : ''}{diffPct}% vs market median
          </p>
        </div>

        {/* 10-Year Growth Card */}
        <div className="card">
          <h3 className="text-sm font-medium text-gray-600 mb-1">10-Year Avg Growth</h3>
          <p className="text-3xl font-bold text-gray-900">
            {data.avg_10yr_growth_pct.toFixed(1)}%
          </p>
          <p className="text-sm text-gray-600 mt-2">
            {data.trend_classification}
          </p>
        </div>
      </div>

      {/* Wage Range Visualization */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Position in the Wage Distribution</h3>
        <div className="relative pt-4 pb-8">
          {/* Wage Range Bar */}
          <div className="relative h-12 bg-gradient-to-r from-blue-200 via-blue-400 to-blue-600 rounded-lg">
            {/* User Position Marker */}
            <div
              className="absolute top-0 bottom-0 w-1 bg-red-500 shadow-lg"
              style={{
                left: `${data.userPercentile}%`,
                transform: 'translateX(-50%)'
              }}
            >
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded whitespace-nowrap">
                You: {formatCurrency(data.userSalary)}
              </div>
            </div>
          </div>

          {/* Labels */}
          <div className="flex justify-between mt-2 text-sm">
            <div className="text-left">
              <div className="font-medium">25th</div>
              <div className="text-gray-600">{formatCurrency(data.p25_annual_wage)}</div>
            </div>
            <div className="text-center">
              <div className="font-medium">50th (Median)</div>
              <div className="text-gray-600">{formatCurrency(data.p50_annual_wage)}</div>
            </div>
            <div className="text-right">
              <div className="font-medium">75th</div>
              <div className="text-gray-600">{formatCurrency(data.p75_annual_wage)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Time Series Chart */}
      {chartData.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Wage Trends Over Time (2014-2023)
          </h3>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
              <Tooltip
                formatter={(value: number) => formatCurrency(value)}
                labelFormatter={(label) => `Year: ${label}`}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="25th Percentile"
                stroke="#93c5fd"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="Median"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="75th Percentile"
                stroke="#1e40af"
                strokeWidth={2}
                dot={false}
              />
              <ReferenceLine
                y={data.userSalary}
                stroke="#ef4444"
                strokeWidth={2}
                strokeDasharray="5 5"
                label={{ value: 'Your Salary', position: 'right', fill: '#ef4444', fontWeight: 'bold' }}
              />
            </LineChart>
          </ResponsiveContainer>
          <p className="text-sm text-gray-600 mt-4">
            The chart shows how wages have changed over time for {data.occupation_text}.
            Your salary is shown as a red dashed line for comparison.
          </p>
        </div>
      )}

      {/* Data Quality Note */}
      <div className="card bg-gray-50">
        <h4 className="font-medium text-gray-900 mb-2">About This Data</h4>
        <div className="text-sm text-gray-600 space-y-1">
          <p>• Data Reliability: <span className="font-medium">{data.data_reliability}</span></p>
          <p>• Latest Data Year: <span className="font-medium">{data.data_year}</span></p>
          <p>• Source: Bureau of Labor Statistics Modeled Wage Estimates</p>
        </div>
      </div>
    </div>
  )
}

export default WageResults
