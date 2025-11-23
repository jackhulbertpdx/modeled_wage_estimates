import Fuse from 'fuse.js'
import type { Occupation } from '../types'
import { occupationKeywords, getKeywordsForOccupation } from '../data/occupationKeywords'

/**
 * Enhanced occupation data for search
 */
interface EnhancedOccupation extends Occupation {
  keywords: string[]
  aliases: string[]
  searchText: string // Combined text for searching
}

/**
 * Create enhanced occupation list with keywords and aliases
 */
export function enhanceOccupationsWithKeywords(occupations: Occupation[]): EnhancedOccupation[] {
  return occupations.map(occ => {
    const mapping = occupationKeywords.find(k => k.occupation_code === occ.occupation_code)
    const keywords = mapping?.keywords || []
    const aliases = mapping?.aliases || []

    // Create combined search text
    const searchText = [
      occ.occupation_text,
      ...keywords,
      ...aliases
    ].join(' ')

    return {
      ...occ,
      keywords,
      aliases,
      searchText
    }
  })
}

/**
 * Semantic search for occupations using Fuse.js
 */
export class OccupationSearchEngine {
  private fuse: Fuse<EnhancedOccupation>
  private enhancedOccupations: EnhancedOccupation[]

  constructor(occupations: Occupation[]) {
    this.enhancedOccupations = enhanceOccupationsWithKeywords(occupations)

    // Configure Fuse.js with weighted keys
    this.fuse = new Fuse(this.enhancedOccupations, {
      keys: [
        { name: 'occupation_text', weight: 3 },      // Highest weight for exact title
        { name: 'aliases', weight: 2.5 },            // High weight for aliases
        { name: 'keywords', weight: 2 },             // Good weight for keywords
        { name: 'searchText', weight: 1 }            // Lower weight for combined text
      ],
      threshold: 0.4,        // More lenient matching (0 = exact, 1 = match anything)
      distance: 100,         // How far to search for patterns
      minMatchCharLength: 2, // Minimum characters to match
      includeScore: true,    // Include relevance scores
      ignoreLocation: true,  // Don't penalize matches far from start
      useExtendedSearch: false
    })
  }

  /**
   * Search for occupations with semantic matching
   * Returns results sorted by relevance
   */
  search(query: string, limit = 100): Occupation[] {
    if (!query || query.trim().length < 2) {
      return this.enhancedOccupations.slice(0, limit)
    }

    const results = this.fuse.search(query, { limit })

    // Return the original occupation objects (without enhanced fields)
    return results.map(result => ({
      occupation_code: result.item.occupation_code,
      occupation_text: result.item.occupation_text,
      major_occupation_group: result.item.major_occupation_group
    }))
  }

  /**
   * Get suggestions for a partial query
   * More lenient for autocomplete
   */
  suggest(query: string, limit = 10): Occupation[] {
    if (!query || query.trim().length < 1) {
      return this.enhancedOccupations.slice(0, limit)
    }

    // Use more lenient threshold for suggestions
    const tempFuse = new Fuse(this.enhancedOccupations, {
      ...this.fuse.options,
      threshold: 0.5
    })

    const results = tempFuse.search(query, { limit })

    return results.map(result => ({
      occupation_code: result.item.occupation_code,
      occupation_text: result.item.occupation_text,
      major_occupation_group: result.item.major_occupation_group
    }))
  }

  /**
   * Find exact or near-exact matches
   * Useful for quick lookups
   */
  findExact(query: string): Occupation | null {
    const normalizedQuery = query.toLowerCase().trim()

    // Try exact match first
    const exactMatch = this.enhancedOccupations.find(occ =>
      occ.occupation_text.toLowerCase() === normalizedQuery ||
      occ.aliases.some(alias => alias.toLowerCase() === normalizedQuery) ||
      occ.keywords.some(kw => kw === normalizedQuery)
    )

    if (exactMatch) {
      return {
        occupation_code: exactMatch.occupation_code,
        occupation_text: exactMatch.occupation_text,
        major_occupation_group: exactMatch.major_occupation_group
      }
    }

    // Try fuzzy match with very strict threshold
    const results = this.fuse.search(query, { limit: 1 })
    if (results.length > 0 && results[0].score && results[0].score < 0.2) {
      return {
        occupation_code: results[0].item.occupation_code,
        occupation_text: results[0].item.occupation_text,
        major_occupation_group: results[0].item.major_occupation_group
      }
    }

    return null
  }

  /**
   * Get all occupations (for when no search is active)
   */
  getAll(limit?: number): Occupation[] {
    const occs = this.enhancedOccupations.map(occ => ({
      occupation_code: occ.occupation_code,
      occupation_text: occ.occupation_text,
      major_occupation_group: occ.major_occupation_group
    }))

    return limit ? occs.slice(0, limit) : occs
  }

  /**
   * Get keywords for an occupation (for display/debugging)
   */
  getKeywordsForOccupation(occupationCode: string): string[] {
    return getKeywordsForOccupation(occupationCode)
  }
}

/**
 * Helper to highlight matching text in results
 */
export function highlightMatch(text: string, query: string): string {
  if (!query) return text

  const regex = new RegExp(`(${query})`, 'gi')
  return text.replace(regex, '<mark>$1</mark>')
}

/**
 * Common job title mappings for quick suggestions
 */
export const commonJobTitleSuggestions = [
  { display: "Software Engineer", searchTerm: "software developer" },
  { display: "Data Scientist", searchTerm: "data scientist" },
  { display: "Product Manager", searchTerm: "manager" },
  { display: "UX Designer", searchTerm: "designer" },
  { display: "DevOps Engineer", searchTerm: "software developer" },
  { display: "Business Analyst", searchTerm: "business analyst" },
  { display: "Accountant", searchTerm: "accountant" },
  { display: "Teacher", searchTerm: "teacher" },
  { display: "Nurse", searchTerm: "nurse" },
  { display: "Sales Representative", searchTerm: "sales representative" },
  { display: "Customer Service Rep", searchTerm: "customer service" },
  { display: "Project Manager", searchTerm: "manager" },
  { display: "Marketing Manager", searchTerm: "market research analyst" },
  { display: "HR Specialist", searchTerm: "business operations" },
  { display: "Mechanical Engineer", searchTerm: "engineer" }
]
