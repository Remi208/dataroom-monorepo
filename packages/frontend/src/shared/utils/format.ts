/**
 * Format utilities
 */

export const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp)
    return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    })
}

export const highlightText = (text: string, query: string): string => {
    if (!query) return text

    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    return text.replace(regex, '<mark class="bg-yellow-200 font-semibold">$1</mark>')
}

export const truncateText = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
}

export const getContextAroundMatch = (text: string, query: string, contextLength: number = 50): string => {
    const index = text.toLowerCase().indexOf(query.toLowerCase())
    if (index === -1) return text

    const start = Math.max(0, index - contextLength)
    const end = Math.min(text.length, index + query.length + contextLength)
    return text.substring(start, end).trim()
}
