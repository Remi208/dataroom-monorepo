import { useState, useCallback, useEffect, useRef } from 'react'
import { Search, X, Filter } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { CONSTANTS } from '../shared/constants/app'

export interface SearchBarProps {
    onSearch: (query: string, filters: SearchFilters) => void
    recentSearches: string[]
    onClearSearch: () => void
    initialQuery?: string
    initialFilters?: Partial<SearchFilters>
}

export interface SearchFilters {
    query: string
    searchInContent: boolean
    searchInNames: boolean
    dateFrom?: number
    dateTo?: number
}

export default function SearchBar({
    onSearch,
    recentSearches,
    onClearSearch,
    initialQuery = '',
    initialFilters = {},
}: SearchBarProps) {
    const { t } = useTranslation()
    const [query, setQuery] = useState(initialQuery)
    const [showFilters, setShowFilters] = useState(false)
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [filters, setFilters] = useState<SearchFilters>({
        query: initialQuery,
        searchInContent: initialFilters.searchInContent !== false,
        searchInNames: initialFilters.searchInNames !== false,
    })
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)
    const suggestionsRef = useRef<HTMLDivElement>(null)

    // Debounced search - use useRef instead of useState for timer
    useEffect(() => {
        debounceTimerRef.current = setTimeout(() => {
            // Call search for both empty and non-empty queries
            onSearch(query, filters)
        }, CONSTANTS.DEBOUNCE_DELAY)

        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current)
            }
        }
    }, [query, filters, onSearch])

    // Close suggestions when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
                setShowSuggestions(false)
            }
        }

        if (showSuggestions) {
            document.addEventListener('mousedown', handleClickOutside)
            return () => {
                document.removeEventListener('mousedown', handleClickOutside)
            }
        }
    }, [showSuggestions])

    const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setQuery(value)
        setShowSuggestions(value.length > 0)
    }

    const handleClearSearch = useCallback(() => {
        setQuery('')
        setShowSuggestions(false)
        onClearSearch()
    }, [onClearSearch])

    const handleSuggestionClick = (suggestion: string) => {
        setQuery(suggestion)
        setShowSuggestions(false)
    }

    const handleFilterChange = (key: keyof SearchFilters, value: string | number | boolean) => {
        setFilters((prev) => ({
            ...prev,
            [key]: value,
        }))
    }

    const handleToggleFilter = (key: 'searchInContent' | 'searchInNames') => {
        handleFilterChange(key, !filters[key])
    }

    const hasActiveFilters = !filters.searchInContent || !filters.searchInNames

    return (
        <div className="w-full bg-white border-b border-border p-4 space-y-3">
            {/* Search Input */}
            <div className="relative flex gap-2">
                <div className="flex-1 relative">
                    <div className="absolute left-3 top-3 text-muted-foreground">
                        <Search size={18} />
                    </div>
                    <input
                        type="text"
                        value={query}
                        onChange={handleQueryChange}
                        onFocus={() => query.length > 0 && setShowSuggestions(true)}
                        placeholder={t('search_placeholder')}
                        className="w-full pl-10 pr-10 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    {query && (
                        <button
                            onClick={handleClearSearch}
                            className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                        >
                            <X size={18} />
                        </button>
                    )}

                    {/* Search Suggestions */}
                    {showSuggestions && recentSearches.length > 0 && (
                        <div
                            ref={suggestionsRef}
                            className="absolute top-full left-0 right-0 mt-1 bg-white border border-border rounded-md shadow-lg z-50 max-h-48 overflow-y-auto"
                        >
                            <div className="p-2">
                                <p className="text-xs text-muted-foreground px-2 py-1 font-semibold">
                                    {t('recent_searches')}
                                </p>
                                {recentSearches.map((search, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleSuggestionClick(search)}
                                        className="w-full text-left px-3 py-2 hover:bg-accent rounded text-sm transition-colors"
                                    >
                                        <Search size={14} className="inline mr-2 text-muted-foreground" />
                                        {search}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Filter Button */}
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`p-2 rounded-md border transition-colors ${hasActiveFilters
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border hover:bg-accent/20'
                        }`}
                    title={t('filter_results')}
                >
                    <Filter size={18} />
                </button>
            </div>

            {/* Filter Options */}
            {showFilters && (
                <div className="bg-accent/20 border border-border rounded-md p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                        {/* Search in Names */}
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={filters.searchInNames}
                                onChange={() => handleToggleFilter('searchInNames')}
                                className="w-4 h-4 rounded border-border"
                            />
                            <span className="text-sm">{t('search_in_names')}</span>
                        </label>

                        {/* Search in Content */}
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={filters.searchInContent}
                                onChange={() => handleToggleFilter('searchInContent')}
                                className="w-4 h-4 rounded border-border"
                            />
                            <span className="text-sm">
                                {t('search_in_content')}
                            </span>
                        </label>
                    </div>

                    {/* Reset Filters */}
                    <button
                        onClick={() => {
                            setFilters({
                                query: '',
                                searchInContent: true,
                                searchInNames: true,
                            })
                        }}
                        className="text-sm text-primary hover:underline"
                    >
                        {t('reset_filters')}
                    </button>
                </div>
            )}

            {/* Active Filters Indicator */}
            {hasActiveFilters && !showFilters && (
                <div className="flex gap-2 text-xs text-muted-foreground">
                    {!filters.searchInNames && (
                        <span className="px-2 py-1 bg-accent/50 rounded">
                            {t('names_disabled')}
                        </span>
                    )}
                    {!filters.searchInContent && (
                        <span className="px-2 py-1 bg-accent/50 rounded">
                            {t('content_disabled')}
                        </span>
                    )}
                </div>
            )}
        </div>
    )
}
