import { FileText, Folder, Calendar, HardDrive } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { SearchResult } from '../features/search'

export interface SearchResultsProps {
    results: SearchResult[]
    isLoading?: boolean
    query: string
}

const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp)
    return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    })
}

const highlightMatch = (text: string, query: string): React.ReactNode => {
    if (!query) return text

    const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'))

    return parts.map((part, idx) =>
        part.toLowerCase() === query.toLowerCase() ? (
            <mark key={idx} className="bg-yellow-200 font-semibold">
                {part}
            </mark>
        ) : (
            part
        )
    )
}

export default function SearchResults({
    results,
    isLoading = false,
    query,
}: SearchResultsProps) {
    const { t } = useTranslation()

    if (isLoading) {
        return (
            <div className="p-8 text-center">
                <div className="inline-block animate-spin text-2xl">⟳</div>
                <p className="mt-2 text-muted-foreground">{t('searching') || 'Searching...'}</p>
            </div>
        )
    }

    if (results.length === 0 && query) {
        return (
            <div className="p-8 text-center">
                <FileText size={48} className="mx-auto text-muted-foreground mb-4 opacity-50" />
                <p className="text-lg font-semibold mb-2">
                    {t('no_results') || 'No results found'}
                </p>
                <p className="text-muted-foreground">
                    {t('no_results_description') || `Try different keywords or check the filters`}
                </p>
            </div>
        )
    }

    return (
        <div className="flex-1 overflow-y-auto">
            {results.length > 0 && (
                <div className="p-4">
                    <p className="text-sm text-muted-foreground mb-4">
                        {t('found_results', { count: results.length }) ||
                            `Found ${results.length} result${results.length !== 1 ? 's' : ''}`}
                    </p>
                </div>
            )}

            <div className="space-y-2 px-4 pb-4">
                {results.map((result, idx) => (
                    <div
                        key={`${result.fileId}-${idx}`}
                        className="p-4 border border-border rounded-lg hover:bg-accent/10 transition-colors"
                    >
                        {/* Header: File Name and Type Badge */}
                        <div className="flex items-start justify-between mb-2">
                            <div className="flex items-start gap-3 flex-1 min-w-0">
                                <FileText
                                    size={20}
                                    className="text-blue-500 flex-shrink-0 mt-0.5"
                                />
                                <div className="min-w-0 flex-1">
                                    <h3 className="font-semibold text-foreground break-words">
                                        {result.matchType === 'name'
                                            ? highlightMatch(result.fileName, query)
                                            : result.fileName}
                                    </h3>
                                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                                        <Folder size={12} />
                                        {result.parentFolderPath}
                                    </p>
                                </div>
                            </div>

                            {/* Match Type Badge */}
                            <span
                                className={`text-xs font-medium px-2 py-1 rounded whitespace-nowrap flex-shrink-0 ml-2 ${result.matchType === 'name'
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'bg-green-100 text-green-700'
                                    }`}
                            >
                                {result.matchType === 'name'
                                    ? t('name_match') || 'Name'
                                    : t('content_match') || 'Content'}
                            </span>
                        </div>

                        {/* Matched Text (for content matches) */}
                        {result.matchType === 'content' && result.matchedText && (
                            <div className="mb-3 p-2 bg-accent/20 rounded text-sm text-muted-foreground italic border-l-2 border-primary">
                                {highlightMatch(result.matchedText, query)}
                            </div>
                        )}

                        {/* Data Room */}
                        <div className="mb-3 text-sm">
                            <span className="font-medium">{t('dataroom.label')}:</span>
                            <span className="text-muted-foreground ml-1">{result.dataRoomName}</span>
                        </div>

                        {/* Footer: Metadata */}
                        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                                <Calendar size={14} />
                                <span>{formatDate(result.createdAt)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <HardDrive size={14} />
                                <span>{formatFileSize(result.size)}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
