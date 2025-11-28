import * as pdfjs from 'pdfjs-dist'
import { Folder, DataRoom } from '../../types'

// Initialize PDF.js worker
let workerInitialized = false
const initPdfWorker = () => {
    if (workerInitialized) return
    
    if (typeof window !== 'undefined') {
        try {
            // Use the bundled worker from node_modules - this is more reliable on Vercel
            console.log('[PDF] Initializing worker from bundled distribution')
            pdfjs.GlobalWorkerOptions.workerSrc = new URL(
                'pdfjs-dist/build/pdf.worker.min.mjs',
                import.meta.url
            ).href
            console.log('[PDF] Worker URL:', pdfjs.GlobalWorkerOptions.workerSrc)
            workerInitialized = true
        } catch (bundledError) {
            console.error('[PDF] Bundled worker setup failed:', bundledError)
            try {
                // Fallback: Try CDN with .mjs extension (ES module version)
                console.log('[PDF] Trying CDN with ES module')
                pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.mjs`
                workerInitialized = true
            } catch (cdnError) {
                console.error('[PDF] CDN worker also failed:', cdnError)
            }
        }
    }
}

export interface SearchResult {
    fileId: string
    fileName: string
    parentFolderPath: string
    dataRoomId: string
    dataRoomName: string
    matchType: 'name' | 'content'
    matchedText?: string
    createdAt: number
    size: number
}

export interface SearchFilters {
    query: string
    fileType?: string
    searchInContent?: boolean
    searchInNames?: boolean
    dateFrom?: number
    dateTo?: number
    sizeMin?: number
    sizeMax?: number
}

/**
 * Extract text content from a PDF file using pdf.js library
 * This properly parses PDF structure and extracts readable text
 */
export const extractPDFText = async (buffer: ArrayBuffer): Promise<string> => {
    try {
        initPdfWorker()

        if (!buffer || buffer.byteLength === 0) {
            console.warn('[PDF] Buffer is empty')
            return ''
        }

        console.log(`[PDF] Processing buffer of ${(buffer.byteLength / 1024).toFixed(2)}KB`)

        // Create a copy of the buffer to avoid "detached ArrayBuffer" errors on subsequent calls
        const bufferCopy = buffer.slice(0)

        console.log('[PDF] Loading PDF document...')
        const pdf = await pdfjs.getDocument({ data: bufferCopy }).promise

        console.log(`[PDF] PDF loaded, ${pdf.numPages} pages found`)
        let fullText = ''

        // Extract text from all pages
        for (let i = 1; i <= pdf.numPages; i++) {
            try {
                const page = await pdf.getPage(i)
                const textContent = await page.getTextContent()

                const pageText = textContent.items
                    .filter((item: any) => item.str !== undefined && item.str !== null)
                    .map((item: any) => item.str)
                    .join(' ')

                console.log(`[PDF] Page ${i}: extracted ${pageText.length} chars`)
                fullText += pageText + '\n'
            } catch (pageError) {
                console.warn(`[PDF] Failed to extract text from page ${i}:`, pageError)
                continue
            }
        }

        const result = fullText.trim()

        if (!result) {
            console.warn('[PDF] PDF extraction returned empty result - PDF may be scanned image')
        } else {
            console.log(`[PDF] Total text extracted: ${result.length} chars`)
        }

        return result
    } catch (e) {
        console.error('[PDF] Text extraction failed:', e)
        if (e instanceof Error) {
            console.error('[PDF] Error details:', e.message, e.stack)
        }
        return ''
    }
}

/**
 * Search files by name (case-insensitive)
 */
export const searchByName = (
    query: string,
    files: Map<string, any>,
    folders: Map<string, Folder>,
    dataRooms: DataRoom[]
): SearchResult[] => {
    if (!query.trim()) return []

    const results: SearchResult[] = []
    const queryLower = query.toLowerCase()

    // Get the first data room (usually there's only one passed)
    const dataRoom = dataRooms[0]
    if (!dataRoom) return []

    files.forEach((file) => {
        if (file.name.toLowerCase().includes(queryLower)) {
            results.push({
                fileId: file.id,
                fileName: file.name,
                parentFolderPath: getFilePath(file.parentFolderId, folders),
                dataRoomId: dataRoom.id,
                dataRoomName: dataRoom.name,
                matchType: 'name',
                matchedText: file.name,
                createdAt: file.createdAt,
                size: file.size,
            })
        }
    })

    return results.sort((a, b) => b.createdAt - a.createdAt)
}

/**
 * Search file contents (for PDFs)
 * This is an async function because PDF extraction requires async operations
 */
export const searchByContent = async (
    query: string,
    files: Map<string, any>,
    folders: Map<string, Folder>,
    dataRooms: DataRoom[]
): Promise<SearchResult[]> => {
    if (!query.trim()) return []

    const results: SearchResult[] = []
    const queryLower = query.toLowerCase()

    // Get the first data room (usually there's only one passed)
    const dataRoom = dataRooms[0]
    if (!dataRoom) return []

    console.log(`[Search] Starting content search for "${query}" in ${files.size} files`)

    for (const file of Array.from(files.values())) {
        // Check if file is PDF by type or extension (handles macOS MIME type issues)
        const isPDF = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')

        if (!isPDF) {
            continue
        }
        if (!file.data) {
            console.warn(`[Search] File ${file.name} has no data`)
            continue
        }

        try {
            console.log(`[Search] Extracting text from ${file.name}...`)
            const text = await extractPDFText(file.data)

            if (!text) {
                console.warn(`[Search] No text extracted from ${file.name}`)
                continue
            }

            const textLower = text.toLowerCase()

            if (textLower.includes(queryLower)) {
                // Find the context around the match
                const index = textLower.indexOf(queryLower)
                const start = Math.max(0, index - 50)
                const end = Math.min(text.length, index + query.length + 50)
                const matchedText = text.substring(start, end).trim()

                console.log(`[Search] Found match in ${file.name}`)

                results.push({
                    fileId: file.id,
                    fileName: file.name,
                    parentFolderPath: getFilePath(file.parentFolderId, folders),
                    dataRoomId: dataRoom.id,
                    dataRoomName: dataRoom.name,
                    matchType: 'content',
                    matchedText: `...${matchedText}...`,
                    createdAt: file.createdAt,
                    size: file.size,
                })
            } else {
                console.log(`[Search] No match found in ${file.name}`)
            }
        } catch (error) {
            console.error(`[Search] Error searching content in file ${file.name}:`, error)
        }
    }

    console.log(`[Search] Content search completed. Found ${results.length} results`)
    return results.sort((a, b) => b.createdAt - a.createdAt)
}/**
 * Filter search results by date range
 */
export const filterByDateRange = (
    results: SearchResult[],
    dateFrom?: number,
    dateTo?: number
): SearchResult[] => {
    return results.filter((result) => {
        if (dateFrom && result.createdAt < dateFrom) return false
        if (dateTo && result.createdAt > dateTo) return false
        return true
    })
}

/**
 * Filter search results by file size
 */
export const filterBySize = (
    results: SearchResult[],
    minSize?: number,
    maxSize?: number
): SearchResult[] => {
    return results.filter((result) => {
        if (minSize && result.size < minSize) return false
        if (maxSize && result.size > maxSize) return false
        return true
    })
}

/**
 * Perform comprehensive search with all filters
 */
export const performSearch = async (
    filters: SearchFilters,
    files: Map<string, any>,
    folders: Map<string, Folder>,
    dataRooms: DataRoom[]
): Promise<SearchResult[]> => {
    if (!filters.query.trim()) return []

    // Search by name and content based on filter flags
    const nameResults = filters.searchInNames !== false
        ? searchByName(filters.query, files, folders, dataRooms)
        : []

    // Search by content if enabled
    const contentResults = filters.searchInContent !== false
        ? await searchByContent(filters.query, files, folders, dataRooms)
        : []

    const allResults = [...nameResults, ...contentResults]

    // Deduplicate results (keep first occurrence which is by name if found)
    const uniqueResults = Array.from(
        new Map(allResults.map((r) => [r.fileId, r])).values()
    )

    // Apply filters
    let filtered = uniqueResults

    if (filters.dateFrom || filters.dateTo) {
        filtered = filterByDateRange(filtered, filters.dateFrom, filters.dateTo)
    }

    if (filters.sizeMin || filters.sizeMax) {
        filtered = filterBySize(filtered, filters.sizeMin, filters.sizeMax)
    }

    // Sort by match type (name matches first) then by date
    filtered.sort((a, b) => {
        if (a.matchType !== b.matchType) {
            return a.matchType === 'name' ? -1 : 1
        }
        return b.createdAt - a.createdAt
    })

    return filtered
}

/**
 * Get the full folder path for a file
 */
const getFilePath = (folderId: string | null, folders: Map<string, Folder>): string => {
    if (!folderId) return '/'

    const path: string[] = []
    let currentId: string | null = folderId

    while (currentId) {
        const folder = folders.get(currentId)
        if (!folder) break
        if (folder.name !== 'root') {
            path.unshift(folder.name)
        }
        currentId = folder.parentFolderId
    }

    return path.length > 0 ? '/' + path.join('/') : '/'
}

/**
 * Highlight search query in text
 * Returns HTML with highlighted matches
 */
export const highlightText = (text: string, query: string): string => {
    if (!query) return text

    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    return text.replace(regex, '<mark class="bg-yellow-200 font-semibold">$1</mark>')
}

/**
 * Get search suggestions based on query
 */
export const getSearchSuggestions = (
    query: string,
    recentSearches: string[],
    fileNames: string[]
): string[] => {
    if (!query.trim()) {
        return recentSearches.slice(0, 5)
    }

    const queryLower = query.toLowerCase()
    const suggestions = new Set<string>()

    // Add recent searches that match
    recentSearches.forEach((search) => {
        if (search.toLowerCase().includes(queryLower)) {
            suggestions.add(search)
        }
    })

    // Add file names that match
    fileNames.forEach((name) => {
        if (name.toLowerCase().includes(queryLower)) {
            suggestions.add(name)
        }
    })

    return Array.from(suggestions).slice(0, 10)
}
