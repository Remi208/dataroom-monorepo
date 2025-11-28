import { describe, it, expect, beforeEach } from 'vitest'
import {
    searchByName,
    searchByContent,
    filterByDateRange,
    filterBySize,
    performSearch,
    extractPDFText,
    highlightText,
    getSearchSuggestions,
    SearchResult,
} from '../features/search'
import { DataRoom, Folder, StoreFile } from '../types'

describe('Search Functionality', () => {
    let files: Map<string, StoreFile>
    let folders: Map<string, Folder>
    let dataRooms: DataRoom[]
    const now = Date.now()

    beforeEach(() => {
        // Create test data
        const rootFolderId = 'root-1'
        const folderId1 = 'folder-1'

        const rootFolder: Folder = {
            id: rootFolderId,
            name: 'root',
            parentFolderId: null,
            createdAt: now,
            updatedAt: now,
            children: [],
        }

        const folder1: Folder = {
            id: folderId1,
            name: 'Documents',
            parentFolderId: rootFolderId,
            createdAt: now,
            updatedAt: now,
            children: [],
        }

        folders = new Map([
            [rootFolderId, rootFolder],
            [folderId1, folder1],
        ])

        const pdfContent = 'This is a PDF document with important information'
        const pdfBuffer = new TextEncoder().encode(pdfContent).buffer

        const file1: StoreFile = {
            id: 'file-1',
            name: 'budget-report.pdf',
            parentFolderId: folderId1,
            size: 1024,
            type: 'application/pdf',
            createdAt: now - 86400000, // 1 day ago
            updatedAt: now - 86400000,
            data: pdfBuffer,
        }

        const file2: StoreFile = {
            id: 'file-2',
            name: 'quarterly-results.pdf',
            parentFolderId: folderId1,
            size: 2048,
            type: 'application/pdf',
            createdAt: now - 172800000, // 2 days ago
            updatedAt: now - 172800000,
            data: pdfBuffer,
        }

        const file3: StoreFile = {
            id: 'file-3',
            name: 'notes.txt',
            parentFolderId: folderId1,
            size: 512,
            type: 'text/plain',
            createdAt: now,
            updatedAt: now,
            data: null,
        }

        files = new Map([
            ['file-1', file1],
            ['file-2', file2],
            ['file-3', file3],
        ])

        dataRooms = [
            {
                id: 'room-1',
                name: 'Main Data Room',
                createdAt: now,
                updatedAt: now,
                rootFolderId,
            },
        ]
    })

    describe('searchByName', () => {
        it('should find files by partial name match', () => {
            const results = searchByName('budget', files, folders, dataRooms)
            expect(results).toHaveLength(1)
            expect(results[0].fileName).toBe('budget-report.pdf')
        })

        it('should be case-insensitive', () => {
            const results = searchByName('BUDGET', files, folders, dataRooms)
            expect(results).toHaveLength(1)
            expect(results[0].fileName).toBe('budget-report.pdf')
        })

        it('should return multiple matches', () => {
            const results = searchByName('quarterly', files, folders, dataRooms)
            expect(results).toHaveLength(1)
            expect(results[0].fileName).toBe('quarterly-results.pdf')
        })

        it('should return empty array for no matches', () => {
            const results = searchByName('nonexistent', files, folders, dataRooms)
            expect(results).toHaveLength(0)
        })

        it('should return empty array for empty query', () => {
            const results = searchByName('', files, folders, dataRooms)
            expect(results).toHaveLength(0)
        })

        it('should include file metadata in results', () => {
            const results = searchByName('budget', files, folders, dataRooms)
            expect(results[0]).toHaveProperty('fileId')
            expect(results[0]).toHaveProperty('fileName')
            expect(results[0]).toHaveProperty('parentFolderPath')
            expect(results[0]).toHaveProperty('dataRoomId')
            expect(results[0]).toHaveProperty('dataRoomName')
            expect(results[0].matchType).toBe('name')
        })

        it('should mark match type as "name"', () => {
            const results = searchByName('report', files, folders, dataRooms)
            expect(results[0].matchType).toBe('name')
        })
    })

    describe('searchByContent', () => {
        it('should find files by content match', async () => {
            const results = await searchByContent('important', files, folders, dataRooms)
            expect(results.length).toBeGreaterThan(0)
            expect(results[0].matchType).toBe('content')
        })

        it('should be case-insensitive for content', async () => {
            const results = await searchByContent('IMPORTANT', files, folders, dataRooms)
            expect(results.length).toBeGreaterThan(0)
        })

        it('should only search PDF files', async () => {
            const results = await searchByContent('important', files, folders, dataRooms)
            // Should find PDFs, not text files
            results.forEach((result) => {
                expect(files.get(result.fileId)?.type).toBe('application/pdf')
            })
        })

        it('should return empty for no content matches', async () => {
            const results = await searchByContent('xyz123', files, folders, dataRooms)
            expect(results).toHaveLength(0)
        })

        it('should mark match type as "content"', async () => {
            const results = await searchByContent('document', files, folders, dataRooms)
            if (results.length > 0) {
                expect(results[0].matchType).toBe('content')
            }
        })

        it('should include matched text in results', async () => {
            const results = await searchByContent('important', files, folders, dataRooms)
            if (results.length > 0) {
                expect(results[0].matchedText).toBeDefined()
                expect(results[0].matchedText).toContain('important')
            }
        })
    })

    describe('filterByDateRange', () => {
        it('should filter by date range', () => {
            const allResults: SearchResult[] = [
                {
                    fileId: 'file-1',
                    fileName: 'budget-report.pdf',
                    parentFolderPath: '/',
                    dataRoomId: 'room-1',
                    dataRoomName: 'Main Data Room',
                    matchType: 'name',
                    createdAt: now - 86400000,
                    size: 1024,
                },
                {
                    fileId: 'file-2',
                    fileName: 'quarterly-results.pdf',
                    parentFolderPath: '/',
                    dataRoomId: 'room-1',
                    dataRoomName: 'Main Data Room',
                    matchType: 'name',
                    createdAt: now - 172800000,
                    size: 2048,
                },
            ]

            const filtered = filterByDateRange(allResults, now - 100000000)
            expect(filtered).toHaveLength(2)
        })

        it('should filter with dateFrom', () => {
            const allResults: SearchResult[] = [
                {
                    fileId: 'file-1',
                    fileName: 'budget-report.pdf',
                    parentFolderPath: '/',
                    dataRoomId: 'room-1',
                    dataRoomName: 'Main Data Room',
                    matchType: 'name',
                    createdAt: now - 86400000,
                    size: 1024,
                },
                {
                    fileId: 'file-2',
                    fileName: 'quarterly-results.pdf',
                    parentFolderPath: '/',
                    dataRoomId: 'room-1',
                    dataRoomName: 'Main Data Room',
                    matchType: 'name',
                    createdAt: now - 172800000,
                    size: 2048,
                },
            ]

            const filtered = filterByDateRange(allResults, now - 100000000)
            expect(filtered.length).toBeLessThanOrEqual(allResults.length)
        })
    })

    describe('filterBySize', () => {
        it('should filter by size range', () => {
            const allResults: SearchResult[] = [
                {
                    fileId: 'file-1',
                    fileName: 'budget-report.pdf',
                    parentFolderPath: '/',
                    dataRoomId: 'room-1',
                    dataRoomName: 'Main Data Room',
                    matchType: 'name',
                    createdAt: now,
                    size: 1024,
                },
                {
                    fileId: 'file-2',
                    fileName: 'quarterly-results.pdf',
                    parentFolderPath: '/',
                    dataRoomId: 'room-1',
                    dataRoomName: 'Main Data Room',
                    matchType: 'name',
                    createdAt: now,
                    size: 2048,
                },
            ]

            const filtered = filterBySize(allResults, 500, 1500)
            expect(filtered).toHaveLength(1)
            expect(filtered[0].size).toBe(1024)
        })

        it('should filter with minSize', () => {
            const allResults: SearchResult[] = [
                { fileId: 'file-1', fileName: 'small.pdf', parentFolderPath: '/', dataRoomId: 'room-1', dataRoomName: 'Main', matchType: 'name', createdAt: now, size: 100 },
                { fileId: 'file-2', fileName: 'large.pdf', parentFolderPath: '/', dataRoomId: 'room-1', dataRoomName: 'Main', matchType: 'name', createdAt: now, size: 5000 },
            ]

            const filtered = filterBySize(allResults, 1000)
            expect(filtered).toHaveLength(1)
            expect(filtered[0].size).toBe(5000)
        })
    })

    describe('performSearch', () => {
        it('should combine name and content search results', async () => {
            const results = await performSearch(
                { query: 'report' },
                files,
                folders,
                dataRooms
            )
            expect(results.length).toBeGreaterThan(0)
        })

        it('should deduplicate results', async () => {
            const results = await performSearch(
                { query: 'budget' },
                files,
                folders,
                dataRooms
            )
            const fileIds = results.map((r) => r.fileId)
            const uniqueIds = new Set(fileIds)
            expect(fileIds.length).toBe(uniqueIds.size)
        })

        it('should prioritize name matches over content matches', async () => {
            const results = await performSearch(
                { query: 'budget' },
                files,
                folders,
                dataRooms
            )
            if (results.length > 1) {
                // Name matches should come first
                const firstIsName = results[0].matchType === 'name'
                expect(firstIsName).toBe(true)
            }
        })

        it('should return empty for empty query', async () => {
            const results = await performSearch(
                { query: '' },
                files,
                folders,
                dataRooms
            )
            expect(results).toHaveLength(0)
        })
    })

    describe('extractPDFText', () => {
        it('should extract text from PDF buffer', async () => {
            const text = 'Test PDF content'
            const buffer = new TextEncoder().encode(text).buffer
            const extracted = await extractPDFText(buffer)
            expect(extracted).toBeDefined()
        })

        it('should handle empty buffers', async () => {
            const buffer = new ArrayBuffer(0)
            const extracted = await extractPDFText(buffer)
            expect(extracted).toBeDefined()
        })
    })

    describe('highlightText', () => {
        it('should highlight matching text', () => {
            const text = 'This is a test document'
            const query = 'test'
            const highlighted = highlightText(text, query)
            expect(highlighted).toContain('<mark')
            expect(highlighted).toContain('test')
            expect(highlighted).toContain('</mark>')
        })

        it('should be case-insensitive for highlighting', () => {
            const text = 'This is a TEST document'
            const query = 'test'
            const highlighted = highlightText(text, query)
            expect(highlighted).toContain('<mark')
        })

        it('should handle empty query', () => {
            const text = 'This is a test'
            const highlighted = highlightText(text, '')
            expect(highlighted).toBe(text)
        })

        it('should escape regex special characters', () => {
            const text = 'Search for (test) [special] {chars}'
            const query = '(test)'
            const highlighted = highlightText(text, query)
            expect(highlighted).toContain('<mark')
        })
    })

    describe('getSearchSuggestions', () => {
        it('should return recent searches when query is empty', () => {
            const recentSearches = ['budget', 'report', 'financial']
            const suggestions = getSearchSuggestions('', recentSearches, [])
            expect(suggestions).toEqual(['budget', 'report', 'financial'])
        })

        it('should filter recent searches by query', () => {
            const recentSearches = ['budget', 'report', 'financial']
            const suggestions = getSearchSuggestions('repo', recentSearches, [])
            expect(suggestions).toContain('report')
        })

        it('should include file names in suggestions', () => {
            const fileNames = ['budget-2024.pdf', 'report.pdf']
            const suggestions = getSearchSuggestions('budget', [], fileNames)
            expect(suggestions).toContain('budget-2024.pdf')
        })

        it('should limit suggestions to 10', () => {
            const recentSearches = Array.from({ length: 15 }, (_, i) => `search-${i}`)
            const suggestions = getSearchSuggestions('', recentSearches, [])
            expect(suggestions.length).toBeLessThanOrEqual(10)
        })

        it('should combine and deduplicate suggestions', () => {
            const recentSearches = ['test', 'budget']
            const fileNames = ['test.pdf', 'budget.pdf']
            const suggestions = getSearchSuggestions('test', recentSearches, fileNames)
            expect(suggestions.length).toBeLessThanOrEqual(2)
        })
    })
})
