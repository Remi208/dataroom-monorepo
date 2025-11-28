# Search and Filtering Guide

Complete guide to using the search and filtering features in Data Room.

## Overview

The Data Room application includes powerful search and filtering capabilities that allow you to quickly find documents based on:
- **File names** - Search for files by their filename
- **File contents** - Search for text within PDF files
- **Recent searches** - Quick access to your previous searches
- **Advanced filters** - Filter results by content type and creation date

## Features

### 1. Quick Search

The search bar is always visible at the top of each Data Room. Simply type your search query to find files.

**How it works:**
- Real-time search with 300ms debounce for performance
- Searches both file names and contents simultaneously
- Results appear instantly as you type
- Recent searches appear as suggestions

**Example:**
```
Search: "budget"
Results:
├── budget-report.pdf (Name match)
├── quarterly-budget.pdf (Name match)
└── Q4-financial-review.pdf (Content match - contains "budget")
```

### 2. Search Filters

Control where the search looks by toggling search filters.

#### Filter Options

**Search in File Names** ✓
- Default: Enabled
- Searches file names for your query
- Fast and efficient
- Matches are highlighted in results

**Search in File Contents** ✓
- Default: Enabled  
- Searches PDF file contents for your query
- Shows context around the match
- Slightly slower than name search

#### How to Use Filters

1. Click the **Filter** button (⚙️ icon) in the search bar
2. Toggle the checkboxes to enable/disable search types
3. Active filters are indicated with a blue highlight on the filter button
4. Click **Reset Filters** to restore defaults

**Example:**
```
Active filters:
├── ✓ Search in File Names
└── ✗ Search in File Contents (disabled)

Behavior: Only searches file names, ignoring PDF content
```

### 3. Recent Searches

Quickly re-run previous searches.

**Features:**
- Automatically saves up to 20 recent searches
- Persists across sessions
- Click a suggestion to re-run that search
- Sorted by most recent first

**How it works:**
1. Click in the search box
2. Recent searches appear as suggestions
3. Click any suggestion to run that search
4. Or type a new search query

### 4. Search Results

Results are displayed in a clean, organized list.

#### Result Information

Each search result shows:
- **File Name** - With highlighting of matched text
- **Data Room** - Which data room contains the file
- **Folder Path** - Location within the data room
- **Match Type** - Whether it's a name or content match
- **Matched Text** - Context around the match (for content matches)
- **File Size** - In human-readable format (B, KB, MB, GB)
- **Created Date** - When the file was uploaded

#### Match Types

**Name Match** (Blue badge)
- File name contains your search query
- Ranked higher in results
- Fast to find

**Content Match** (Green badge)
- File contents contain your search query
- Shows context: `...surrounding text...`
- Useful for finding files by topic or keyword

### 5. Navigating Search Results

**Click a Result:**
- Clicking any search result opens that file's Data Room
- You can then preview or download the file
- Previous search is cleared

**View Result Details:**
- Hover over results to see full information
- File size and date are always visible
- Data room name helps with organization

## Search Examples

### Example 1: Find All Budget Files

```
Query: "budget"
Filters: Both enabled (default)

Results ranked by:
1. Files with "budget" in name
2. Files with "budget" in content
```

### Example 2: Search Only File Names

```
Query: "report"
Filters: ✓ Names only (disable Content search)

Results:
- quarterly-report.pdf
- annual-report.pdf
- status-report.docx (if uploaded)
```

### Example 3: Find Text in Documents

```
Query: "revenue"
Filters: ✓ Content only (disable Name search)

Results:
- Files with "revenue" mentioned inside them
- Content context shown: "...quarterly revenue was up..."
```

## Search Behavior

### Case Sensitivity
- **Search is case-insensitive**
- Query "Budget" matches "budget", "BUDGET", "BuDgEt"
- Results highlight the exact match found

### Partial Matching
- **Matches partial words**
- Query "rep" matches "report", "department", "representative"
- Spaces not required for multi-word search

### Special Characters
- **Most characters are searched literally**
- Search for "Q&A" finds "Q&A" in files
- Search handles punctuation correctly

### Empty Results
- If no matches found, you see: "No results found"
- Try different keywords
- Check your filter settings
- Verify file format is supported (PDF)

## Performance Tips

### For Faster Searches

1. **Be specific**
   - Search "Q4-budget" instead of "budget"
   - Reduces search results and noise

2. **Disable unnecessary filters**
   - If you only need names, disable content search
   - Significantly faster on large PDFs

3. **Use recent searches**
   - Re-running recent searches is instant
   - Suggestions appear immediately

### Supported File Formats

**Searchable by name:** All file types
**Searchable by content:** PDF files only

Text extraction from PDFs:
- Readable text is extracted from PDFs
- Scanned images in PDFs are not searchable
- Format doesn't affect file size limit

## Search History

### Automatic History

Search terms are automatically saved:
- Up to 20 most recent searches
- Stored in browser localStorage
- Persists across browser sessions

### Clearing History

To clear search history:
1. Open browser DevTools (F12)
2. Go to Storage/Application tab
3. Find "localStorage"
4. Search for "dataroom_search_history"
5. Delete the entry

Or programmatically:
```javascript
// In browser console
localStorage.removeItem('dataroom_search_history')
```

### Privacy

- Search history stored locally on your device
- Not sent to server
- Cleared when you clear browser data

## Keyboard Shortcuts

Currently available:
- **Focus search box**: Click the search input

Future shortcuts:
- `/` - Focus search box (coming soon)
- `Escape` - Clear search results (coming soon)
- `↑/↓` - Navigate suggestions (coming soon)

## Troubleshooting

### Search Returns No Results

**Possible causes:**

1. **File format not supported**
   - Only PDFs searchable by content
   - Check filter settings

2. **Search term too specific**
   - Try shorter search terms
   - Remove special characters

3. **Files recently uploaded**
   - Search index updates immediately
   - Refresh page if needed

4. **Filters disabled**
   - Check both filter checkboxes are enabled
   - Click "Reset Filters" to restore defaults

### Search is Slow

**Possible causes:**

1. **Large number of files**
   - Content search slower on many large PDFs
   - Try disabling content search
   - Be more specific with query

2. **Complex PDF files**
   - Some PDFs take longer to process
   - Content search is slower than name search
   - Consider waiting or narrowing results

### Searched Text Not Highlighted

This might happen if:
- The text is in a scanned image (not searchable)
- Special formatting in PDF
- Text extracted differently than displayed

### Recent Searches Not Appearing

**Solutions:**

1. Check browser localStorage is enabled
2. Verify localStorage hasn't been cleared
3. Try performing a new search
4. Check that search terms are at least 1 character

## Advanced Usage

### Search with Folder Navigation

After finding a file:
1. Click the search result
2. Data Room opens with folder containing file
3. File is visible in its folder location
4. You can browse related files

### Multiple Searches

Each search clears the previous one:
- New search starts fresh
- Previous results are discarded
- No search history in results view

### Empty Data Rooms

Searching in empty data rooms:
- Returns "No results found"
- No errors or warnings
- Can still add files and search after

## Limitations

### Current Limitations

- **PDF content only** - Text files and images not searchable by content
- **20 search limit** - History keeps only 20 most recent
- **Single search** - Can't combine multiple searches
- **No advanced operators** - No AND, OR, NOT operators
- **No date range filter UI** - Date filtering API exists but not in UI

### Future Enhancements

- [ ] Image OCR for scanned PDFs
- [ ] Advanced search operators
- [ ] Saved search queries
- [ ] Search result bookmarking
- [ ] Full-text indexing for performance
- [ ] Search analytics and trending
- [ ] Bulk actions on search results
- [ ] Export search results

## API Reference

### Search Functions (for developers)

**searchByName(query, files, folders, dataRooms)**
- Searches file names
- Returns: SearchResult[]

**searchByContent(query, files, folders, dataRooms)**
- Searches PDF contents
- Returns: SearchResult[]

**performSearch(filters, files, folders, dataRooms)**
- Combined search with all filters
- Returns: SearchResult[]

**getSearchSuggestions(query, recentSearches, fileNames)**
- Returns search suggestions
- Returns: string[]

See `src/search.ts` for implementation details.

## Examples in Code

### Component Usage

```tsx
import SearchBar from './components/SearchBar'
import SearchResults from './components/SearchResults'

<SearchBar
    onSearch={handleSearch}
    recentSearches={recentSearches}
    onClearSearch={handleClearSearch}
    isSearching={isSearching}
/>

<SearchResults
    results={searchResults}
    isLoading={isSearching}
    query={searchQuery}
    onFileClick={handleNavigateToFile}
/>
```

### Search Hook

```tsx
const handleSearch = (query: string, filters) => {
    const results = performSearch(
        { query, ...filters },
        filesMap,
        foldersMap,
        dataRooms
    )
    setSearchResults(results)
}
```

## Language Support

Search is available in:
- **English** - Default language
- **Spanish** - Full translation

To switch languages:
1. Click the language selector (top right)
2. Select "English" or "Español"
3. All search UI updates immediately

Search indices update when switching languages.

## Support & Feedback

### Getting Help

1. Check this guide for common issues
2. Review troubleshooting section
3. Check browser console for errors
4. Clear cache and try again

### Reporting Issues

If you find search not working:
1. Open browser DevTools (F12)
2. Check Console for errors
3. Note exact search query
4. Note exact error message

### Feature Requests

Want to suggest new search features? Consider:
- Advanced search operators (AND, OR, NOT)
- Search result filtering
- Saved searches
- Search scheduling/alerts

---

**Last Updated**: November 28, 2025  
**Search Version**: 1.0  
**Supported Languages**: English, Spanish  
**Browser Support**: All modern browsers with localStorage support
