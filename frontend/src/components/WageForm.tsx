import { useState, useMemo, useEffect } from 'react'
import type { Occupation, Area } from '../types'
import { OccupationSearchEngine, commonJobTitleSuggestions } from '../utils/occupationSearch'

interface WageFormProps {
  occupations: Occupation[]
  areas: Area[]
  availabilityMap: Record<string, string[]>
  onSubmit: (occupationCodes: string[], salary: number, areaCode: string) => void
  loading: boolean
}

const WageForm = ({ occupations, areas, availabilityMap, onSubmit, loading }: WageFormProps) => {
  const [selectedOccupationCodes, setSelectedOccupationCodes] = useState<string[]>([])
  const [salary, setSalary] = useState('')
  const [areaCode, setAreaCode] = useState('0000000') // Default to National
  const [searchTerm, setSearchTerm] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [showMultiSelect, setShowMultiSelect] = useState(false)

  // Initialize semantic search engine
  const searchEngine = useMemo(() => {
    return new OccupationSearchEngine(occupations)
  }, [occupations])

  // Use semantic search instead of simple filtering
  const filteredOccupations = useMemo(() => {
    if (!searchTerm) {
      return searchEngine.getAll(100)
    }
    return searchEngine.search(searchTerm, 100)
  }, [searchTerm, searchEngine])

  // Auto-select all relevant roles when semantic search returns 1-20 results
  useEffect(() => {
    if (searchTerm && filteredOccupations.length >= 1 && filteredOccupations.length <= 20) {
      const codes = filteredOccupations.map(occ => occ.occupation_code)
      setSelectedOccupationCodes(codes)
    }
  }, [searchTerm, filteredOccupations])

  // Show multi-select when search has results and results are reasonable (2-20)
  const shouldShowMultiSelect = searchTerm && filteredOccupations.length > 1 && filteredOccupations.length <= 20

  // Filter areas based on selected occupations (intersection of available areas)
  const filteredAreas = useMemo(() => {
    if (selectedOccupationCodes.length === 0) {
      return areas
    }

    // Find areas that have data for ALL selected occupations
    const areasByOccupation = selectedOccupationCodes.map(code =>
      new Set(availabilityMap[code] || [])
    )

    // Intersection of all area sets
    const commonAreas = areas.filter(area =>
      areasByOccupation.every(areaSet => areaSet.has(area.area_code))
    )

    return commonAreas
  }, [selectedOccupationCodes, areas, availabilityMap])

  // Count of available areas by type
  const availableByType = {
    national: filteredAreas.filter(a => a.area_type === 'National').length,
    state: filteredAreas.filter(a => a.area_type === 'State').length,
    metro: filteredAreas.filter(a => a.area_type === 'Metropolitan').length
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (selectedOccupationCodes.length === 0 || !salary) {
      alert('Please select at least one occupation and enter your salary')
      return
    }

    const salaryNum = parseFloat(salary)
    if (isNaN(salaryNum) || salaryNum <= 0) {
      alert('Please enter a valid salary')
      return
    }

    onSubmit(selectedOccupationCodes, salaryNum, areaCode)
  }

  const handleSuggestionClick = (suggestion: string) => {
    setSearchTerm(suggestion)
    setShowSuggestions(false)
  }

  const handleOccupationToggle = (occupationCode: string) => {
    setSelectedOccupationCodes(prev => {
      if (prev.includes(occupationCode)) {
        return prev.filter(code => code !== occupationCode)
      } else {
        return [...prev, occupationCode]
      }
    })
  }

  const handleSelectAll = () => {
    const codes = filteredOccupations.slice(0, 20).map(occ => occ.occupation_code)
    setSelectedOccupationCodes(codes)
  }

  const handleClearAll = () => {
    setSelectedOccupationCodes([])
  }

  const getSelectedOccupationNames = () => {
    return selectedOccupationCodes
      .map(code => occupations.find(occ => occ.occupation_code === code)?.occupation_text)
      .filter(Boolean)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Occupation Selection */}
      <div>
        <label htmlFor="occupation" className="label">
          Occupation *
        </label>

        {/* Quick Suggestions */}
        {!searchTerm && showSuggestions && (
          <div className="mb-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-xs font-medium text-blue-900 mb-2">Popular searches:</p>
            <div className="flex flex-wrap gap-2">
              {commonJobTitleSuggestions.slice(0, 8).map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSuggestionClick(suggestion.searchTerm)}
                  className="px-3 py-1 text-xs bg-white border border-blue-300 text-blue-700 rounded-full hover:bg-blue-100 hover:border-blue-400 transition-colors"
                >
                  {suggestion.display}
                </button>
              ))}
            </div>
          </div>
        )}

        <input
          type="text"
          placeholder="Search occupations (e.g., 'software engineer', 'nurse', 'accountant')..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          className="input-field mb-2"
        />

        {searchTerm && filteredOccupations.length === 0 && (
          <div className="mb-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800">
              No matches found for "{searchTerm}". Try searching for related terms or browse all occupations below.
            </p>
          </div>
        )}

        {searchTerm && filteredOccupations.length > 0 && (
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm text-green-600">
              Found {filteredOccupations.length} matching occupation{filteredOccupations.length !== 1 ? 's' : ''}
            </p>
            {shouldShowMultiSelect && (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-xs text-blue-600 hover:text-blue-800 underline"
                >
                  Select all
                </button>
                {selectedOccupationCodes.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearAll}
                    className="text-xs text-gray-600 hover:text-gray-800 underline"
                  >
                    Clear all
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Multi-select checkbox UI when semantic search returns multiple results */}
        {shouldShowMultiSelect ? (
          <div className="border border-gray-300 rounded-md bg-white p-4 max-h-96 overflow-y-auto">
            <p className="text-sm font-medium text-gray-700 mb-3">
              Select occupations to compare ({selectedOccupationCodes.length} selected):
            </p>
            <div className="space-y-2">
              {filteredOccupations.slice(0, 20).map((occ) => (
                <label
                  key={`${occ.occupation_code}-${occ.occupation_text}`}
                  className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedOccupationCodes.includes(occ.occupation_code)}
                    onChange={() => handleOccupationToggle(occ.occupation_code)}
                    className="mt-1 h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-900">{occ.occupation_text}</span>
                </label>
              ))}
            </div>
          </div>
        ) : (
          /* Traditional dropdown for single selection or when no search */
          <select
            id="occupation"
            value={selectedOccupationCodes[0] || ''}
            onChange={(e) => setSelectedOccupationCodes(e.target.value ? [e.target.value] : [])}
            className="input-field"
            required
          >
            <option value="">
              {searchTerm
                ? `Select from ${filteredOccupations.length} results`
                : 'Select an occupation or search above'}
            </option>
            {filteredOccupations.slice(0, 100).map((occ) => (
              <option key={`${occ.occupation_code}-${occ.occupation_text}`} value={occ.occupation_code}>
                {occ.occupation_text}
              </option>
            ))}
          </select>
        )}

        {/* Show selected occupations summary */}
        {selectedOccupationCodes.length > 0 && (
          <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-xs font-medium text-green-900 mb-1">
              Selected ({selectedOccupationCodes.length}):
            </p>
            <div className="flex flex-wrap gap-2">
              {getSelectedOccupationNames().map((name, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-green-300 text-green-800 rounded text-xs"
                >
                  {name}
                  <button
                    type="button"
                    onClick={() => handleOccupationToggle(selectedOccupationCodes[index])}
                    className="ml-1 text-green-600 hover:text-green-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {filteredOccupations.length > 100 && !shouldShowMultiSelect && (
          <p className="mt-1 text-sm text-gray-500">
            Showing first 100 results. Refine your search to see more.
          </p>
        )}
        {filteredOccupations.length > 20 && searchTerm && (
          <p className="mt-1 text-sm text-blue-600">
            Tip: Refine your search to enable multi-select (showing {filteredOccupations.length} results, max 20 for multi-select)
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
          {selectedOccupationCodes.length > 0 && (
            <span className="ml-2 text-xs font-normal text-gray-500">
              ({filteredAreas.length} areas with data for {selectedOccupationCodes.length > 1 ? 'all selected occupations' : 'this occupation'})
            </span>
          )}
        </label>
        <select
          id="area"
          value={areaCode}
          onChange={(e) => setAreaCode(e.target.value)}
          className="input-field"
          disabled={selectedOccupationCodes.length === 0}
        >
          <option value="0000000">
            {selectedOccupationCodes.length > 0 ? 'National Average' : 'Select an occupation first'}
          </option>
          {selectedOccupationCodes.length > 0 && availableByType.state > 0 && (
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
          {selectedOccupationCodes.length > 0 && availableByType.metro > 0 && (
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
          {selectedOccupationCodes.length > 0
            ? selectedOccupationCodes.length > 1
              ? `Showing areas with wage data for all ${selectedOccupationCodes.length} selected occupations`
              : `Showing areas with wage data for selected occupation`
            : 'Select an occupation to see available locations'}
        </p>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading || selectedOccupationCodes.length === 0}
        className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading
          ? 'Analyzing...'
          : selectedOccupationCodes.length > 1
          ? `Compare ${selectedOccupationCodes.length} Occupations`
          : 'Compare Salary'}
      </button>
    </form>
  )
}

export default WageForm
