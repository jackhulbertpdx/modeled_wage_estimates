import { useState } from 'react'
import type { Occupation, Area } from '../types'

interface WageFormProps {
  occupations: Occupation[]
  areas: Area[]
  availabilityMap: Record<string, string[]>
  onSubmit: (occupationCode: string, salary: number, areaCode: string) => void
  loading: boolean
}

const WageForm = ({ occupations, areas, availabilityMap, onSubmit, loading }: WageFormProps) => {
  const [occupationCode, setOccupationCode] = useState('')
  const [salary, setSalary] = useState('')
  const [areaCode, setAreaCode] = useState('0000000') // Default to National
  const [searchTerm, setSearchTerm] = useState('')

  // Filter occupations based on search term
  const filteredOccupations = occupations.filter(occ =>
    occ.occupation_text.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Filter areas based on selected occupation
  const filteredAreas = occupationCode && availabilityMap[occupationCode]
    ? areas.filter(area => availabilityMap[occupationCode].includes(area.area_code))
    : areas // Show all areas if no occupation selected

  // Count of available areas by type
  const availableByType = {
    national: filteredAreas.filter(a => a.area_type === 'National').length,
    state: filteredAreas.filter(a => a.area_type === 'State').length,
    metro: filteredAreas.filter(a => a.area_type === 'Metropolitan').length
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!occupationCode || !salary) {
      alert('Please fill in all fields')
      return
    }

    const salaryNum = parseFloat(salary)
    if (isNaN(salaryNum) || salaryNum <= 0) {
      alert('Please enter a valid salary')
      return
    }

    onSubmit(occupationCode, salaryNum, areaCode)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Occupation Selection */}
      <div>
        <label htmlFor="occupation" className="label">
          Occupation *
        </label>
        <input
          type="text"
          placeholder="Search occupations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-field mb-2"
        />
        <select
          id="occupation"
          value={occupationCode}
          onChange={(e) => setOccupationCode(e.target.value)}
          className="input-field"
          required
        >
          <option value="">Select an occupation</option>
          {filteredOccupations.slice(0, 100).map((occ) => (
            <option key={occ.occupation_code} value={occ.occupation_code}>
              {occ.occupation_text}
            </option>
          ))}
        </select>
        {filteredOccupations.length > 100 && (
          <p className="mt-1 text-sm text-gray-500">
            Showing first 100 results. Refine your search to see more.
          </p>
        )}
      </div>

      {/* Salary Input */}
      <div>
        <label htmlFor="salary" className="label">
          Your Annual Salary ($) *
        </label>
        <input
          type="number"
          id="salary"
          value={salary}
          onChange={(e) => setSalary(e.target.value)}
          placeholder="75000"
          min="0"
          step="1000"
          className="input-field"
          required
        />
      </div>

      {/* Location Selection */}
      <div>
        <label htmlFor="area" className="label">
          Location
          {occupationCode && (
            <span className="ml-2 text-xs font-normal text-gray-500">
              ({filteredAreas.length} areas with data for this occupation)
            </span>
          )}
        </label>
        <select
          id="area"
          value={areaCode}
          onChange={(e) => setAreaCode(e.target.value)}
          className="input-field"
          disabled={!occupationCode}
        >
          <option value="0000000">
            {occupationCode ? 'National Average' : 'Select an occupation first'}
          </option>
          {occupationCode && availableByType.state > 0 && (
            <optgroup label={`States (${availableByType.state})`}>
              {filteredAreas
                .filter(a => a.area_type === 'State')
                .sort((a, b) => a.area_text.localeCompare(b.area_text))
                .map((area) => (
                  <option key={area.area_code} value={area.area_code}>
                    {area.area_text}
                  </option>
                ))}
            </optgroup>
          )}
          {occupationCode && availableByType.metro > 0 && (
            <optgroup label={`Metropolitan Areas (${availableByType.metro > 50 ? '50+' : availableByType.metro})`}>
              {filteredAreas
                .filter(a => a.area_type === 'Metropolitan')
                .sort((a, b) => a.area_text.localeCompare(b.area_text))
                .slice(0, 50)
                .map((area) => (
                  <option key={area.area_code} value={area.area_code}>
                    {area.area_text}
                  </option>
                ))}
            </optgroup>
          )}
        </select>
        <p className="mt-1 text-sm text-gray-500">
          {occupationCode
            ? `Showing areas with wage data for selected occupation`
            : 'Select an occupation to see available locations'}
        </p>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Analyzing...' : 'Compare Salary'}
      </button>
    </form>
  )
}

export default WageForm
