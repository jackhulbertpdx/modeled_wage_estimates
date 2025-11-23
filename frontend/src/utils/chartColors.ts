/**
 * Colorblind-friendly chart colors
 * Based on IBM Design Language and Paul Tol's color schemes
 *
 * These colors are distinguishable for people with deuteranopia,
 * protanopia, and tritanopia (the three main types of color blindness)
 */

export const CHART_COLORS = {
  // Primary data colors (colorblind-safe)
  blue: '#2383E2',      // Primary blue - for main data
  orange: '#D9730D',    // Orange - complementary to blue
  teal: '#0F7B6C',      // Teal - for secondary data
  purple: '#6940A5',    // Purple - for tertiary data

  // Percentile bands (light versions for areas/fills)
  blueLight: '#EBF3FC',
  orangeLight: '#FCF0E6',
  tealLight: '#E6F3F1',
  purpleLight: '#F0EBF8',

  // Semantic colors
  success: '#0F7B6C',   // Teal for positive/above
  warning: '#D9730D',   // Orange for caution/near
  error: '#E34935',     // Red (still accessible) for negative/below
  neutral: '#787774',   // Gray for neutral data

  // Chart-specific palettes
  percentiles: {
    p25: '#B8D4F1',    // Light blue
    p50: '#2383E2',    // Primary blue
    p75: '#1565B8',    // Dark blue
    user: '#D9730D'    // Orange for user salary (high contrast)
  },

  comparison: {
    above: '#0F7B6C',  // Teal - earning above market
    near: '#D9730D',   // Orange - near market rate
    below: '#E34935'   // Red - below market
  },

  // Multi-series palette (for comparing multiple occupations)
  series: [
    '#2383E2',  // Blue
    '#D9730D',  // Orange
    '#0F7B6C',  // Teal
    '#6940A5',  // Purple
    '#C74523',  // Burnt orange
    '#2D7A89',  // Steel blue
    '#8B5A9F',  // Orchid
    '#B85C00'   // Brown
  ]
}

/**
 * Get color for percentile comparison
 */
export function getPercentileColor(percentile: number): string {
  if (percentile >= 75) return CHART_COLORS.success
  if (percentile >= 50) return CHART_COLORS.blue
  if (percentile >= 25) return CHART_COLORS.warning
  return CHART_COLORS.error
}

/**
 * Get color for salary comparison
 */
export function getSalaryComparisonColor(userSalary: number, medianWage: number): string {
  const diff = ((userSalary - medianWage) / medianWage) * 100

  if (diff > 10) return CHART_COLORS.comparison.above
  if (diff > -10) return CHART_COLORS.comparison.near
  return CHART_COLORS.comparison.below
}

/**
 * Get series color by index (with wrapping)
 */
export function getSeriesColor(index: number): string {
  return CHART_COLORS.series[index % CHART_COLORS.series.length]
}
