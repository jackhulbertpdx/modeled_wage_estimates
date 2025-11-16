import { useState } from 'react'
import type { Occupation, Area } from '../types'

interface WageFormProps {
  occupations: Occupation[]
  areas: Area[]
  onSubmit: (occupationCode: string, salary: number, areaCode: string) => void
  loading: boolean
}

const WageForm = ({ occupations, areas, onSubmit, loading }: WageFormProps) => {
  const [occupationCode, setOccupationCode] = useState('')
  const [salary, setSalary] = useState('')
  const [areaCode, setAreaCode] = useState('0000000') // Default to National
  const [searchTerm, setSearchTerm] = useState('')

  // Filter occupations based on search term
  const filteredOccupations = occupations.filter(occ =>
    occ.occupation_text.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
        </label>
        <select
          id="area"
          value={areaCode}
          onChange={(e) => setAreaCode(e.target.value)}
          className="input-field"
        >
          <option value="0000000">National Average</option>
          <optgroup label="States">
            {areas
              .filter(a => a.area_type === 'State')
              .sort((a, b) => a.area_text.localeCompare(b.area_text))
              .map((area) => (
                <option key={area.area_code} value={area.area_code}>
                  {area.area_text}
                </option>
              ))}
          </optgroup>
          <optgroup label="Metropolitan Areas">
            {areas
              .filter(a => a.area_type === 'Metropolitan')
              .sort((a, b) => a.area_text.localeCompare(b.area_text))
              .slice(0, 50)
              .map((area) => (
                <option key={area.area_code} value={area.area_code}>
                  {area.area_text}
                </option>
              ))}
          </optgroup>
        </select>
        <p className="mt-1 text-sm text-gray-500">
          Select a location to compare against market data
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
