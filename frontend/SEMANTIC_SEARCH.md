# Semantic Occupation Search

## Overview

The BLS wage comparison tool now includes intelligent semantic search that maps free-text job titles to official BLS occupation categories. This allows users to search using common job titles like "software engineer" or "data scientist" and find the relevant BLS categories.

## How It Works

### 1. Keyword Mapping Database
Located in `src/data/occupationKeywords.ts`, this file contains comprehensive mappings for all occupation categories:

- **Keywords**: Common search terms (e.g., "software", "developer", "programming")
- **Aliases**: Alternative job titles (e.g., "Software Engineer", "Web Developer", "Full Stack Developer")
- **Occupation Codes**: Linked to official BLS codes

### 2. Fuzzy Search Engine
Located in `src/utils/occupationSearch.ts`, uses Fuse.js for:

- **Semantic matching**: Understands related terms
- **Typo tolerance**: Handles misspellings
- **Relevance ranking**: Best matches appear first
- **Weighted scoring**: Exact title matches rank higher than keyword matches

### 3. Enhanced UI
The search interface includes:

- **Quick suggestions**: Popular job title chips
- **Real-time search**: Instant results as you type
- **Match feedback**: Shows number of results found
- **Helpful placeholders**: Examples of searchable terms

## Example Searches

### Technology Jobs
| User Searches For | Maps To BLS Category |
|-------------------|---------------------|
| "software engineer" | Software Developers and QA Analysts |
| "data scientist" | Computer Occupations, All Other |
| "devops engineer" | Software Developers |
| "web developer" | Software Developers |
| "cybersecurity" | Information Security Analysts |
| "qa engineer" | Software Developers and QA Analysts |

### Business Jobs
| User Searches For | Maps To BLS Category |
|-------------------|---------------------|
| "business analyst" | Business Operations Specialists |
| "accountant" | Accountants and Auditors |
| "project manager" | Business Operations Specialists |
| "hr specialist" | Business Operations Specialists |

### Creative Jobs
| User Searches For | Maps To BLS Category |
|-------------------|---------------------|
| "graphic designer" | Graphic Designers |
| "ux designer" | Graphic Designers |
| "ui designer" | Graphic Designers |

### Other Jobs
| User Searches For | Maps To BLS Category |
|-------------------|---------------------|
| "nurse" | Healthcare Practitioners (category) |
| "teacher" | Education, Training, and Library (category) |
| "sales rep" | Sales Representatives |
| "customer service" | Customer Service Representatives |

## Technical Details

### Search Algorithm
The search engine uses weighted keys for matching:

- **Occupation Text** (weight: 3.0) - Highest priority for exact title matches
- **Aliases** (weight: 2.5) - High priority for alternative titles
- **Keywords** (weight: 2.0) - Good priority for related terms
- **Combined Search Text** (weight: 1.0) - Lower priority for general matching

### Configuration
```typescript
{
  threshold: 0.4,        // 0 = exact match, 1 = match anything
  distance: 100,         // Search pattern distance
  minMatchCharLength: 2, // Minimum characters to match
  ignoreLocation: true   // Don't penalize matches far from start
}
```

## Adding New Mappings

To add mappings for occupations not yet covered:

1. Open `src/data/occupationKeywords.ts`
2. Add a new entry to the `occupationKeywords` array:

```typescript
{
  occupation_code: "123456",  // BLS occupation code
  keywords: [
    "keyword1",
    "keyword2",
    "search term"
  ],
  aliases: [
    "Common Job Title 1",
    "Common Job Title 2"
  ]
}
```

3. The search engine will automatically pick up the new mappings

## Best Practices

### For Users
- Start with broad terms: "software", "engineer", "analyst"
- Use common job titles: "software engineer" instead of "Sr. Software Engineer II"
- Try related terms if first search doesn't work
- Use the quick suggestion chips for common roles

### For Developers
- Add multiple keywords per occupation for better coverage
- Include common abbreviations (e.g., "qa", "hr", "it")
- Add industry-specific terms
- Keep aliases focused on common variations
- Test searches with real user queries

## Performance

The search engine:
- Initializes on component mount using `useMemo`
- Caches the Fuse.js instance for fast subsequent searches
- Limits results to 100 items by default
- Provides instant results (< 50ms for most queries)

## Future Enhancements

Potential improvements:
1. **Machine Learning**: Use embeddings for even better semantic understanding
2. **User Feedback**: Learn from which results users select
3. **Search Analytics**: Track common searches to improve mappings
4. **Context-Aware**: Consider location or industry for better results
5. **Autocomplete**: Show suggestions dropdown while typing
6. **Recent Searches**: Remember user's previous searches

## Testing

To test the semantic search:

```bash
npm run dev
```

Then try these searches:
- "software engineer"
- "data scientist"
- "devops"
- "ux designer"
- "accountant"
- "nurse"
- "sales"

Each should return relevant BLS occupation categories.

## Files Modified

- `src/data/occupationKeywords.ts` - Keyword mapping database (NEW)
- `src/utils/occupationSearch.ts` - Search engine utility (NEW)
- `src/components/WageForm.tsx` - Integrated semantic search
- `package.json` - Added fuse.js dependency

## Dependencies

- **fuse.js** (v7.0+): Lightweight fuzzy-search library
  - No other dependencies
  - Works entirely client-side
  - ~20KB minified

## Troubleshooting

### Search returns no results
- Check that the occupation exists in `occupations.json`
- Add keywords for that occupation in `occupationKeywords.ts`
- Verify the occupation_code matches between files

### Wrong results appearing
- Adjust keyword mappings to be more specific
- Increase the weight of exact title matches
- Lower the fuzzy search threshold for stricter matching

### Performance issues
- Limit the number of occupations loaded
- Increase the `minMatchCharLength` setting
- Reduce the search distance parameter
