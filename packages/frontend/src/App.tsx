import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { DataRoom } from './types'
import { store } from './store'
import { DataRoomList } from './components/DataRoomList'
import { DataRoomView } from './components/DataRoomView'
import { LanguageSwitcher } from './components/LanguageSwitcher'
import SearchBar from './components/SearchBar'
import SearchResults from './components/SearchResults'
import { performSearch, SearchResult } from './features/search'

interface SearchFilters {
    searchInContent: boolean
    searchInNames: boolean
}

export default function App() {
    const { t } = useTranslation()
    const [currentDataRoom, setCurrentDataRoom] = useState<DataRoom | null>(null)
    const [dataRooms, setDataRooms] = useState<DataRoom[]>([])
    const [searchResults, setSearchResults] = useState<SearchResult[]>([])
    const [isSearching, setIsSearching] = useState(false)
    const [showSearchResults, setShowSearchResults] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [searchFilters, setSearchFilters] = useState<SearchFilters>(() => {
        // Initialize filters from URL params
        const params = new URLSearchParams(window.location.search)
        return {
            searchInContent: params.get('searchInContent') !== 'false',
            searchInNames: params.get('searchInNames') !== 'false'
        }
    })
    const [recentSearches, setRecentSearches] = useState<string[]>([])

    useEffect(() => {
        loadDataRooms()
        restoreSelectedDataRoom()
        loadSearchHistory()

        // Restore search query from URL and perform search
        const params = new URLSearchParams(window.location.search)
        const query = params.get('search') || ''
        if (query) {
            setSearchQuery(query)
        }
    }, [])

    // Sync search query and filters to URL
    useEffect(() => {
        const params = new URLSearchParams()

        if (searchQuery) {
            params.set('search', searchQuery)
        }

        if (!searchFilters.searchInContent) {
            params.set('searchInContent', 'false')
        }
        if (!searchFilters.searchInNames) {
            params.set('searchInNames', 'false')
        }

        const newUrl = params.toString() ? `?${params.toString()}` : window.location.pathname
        window.history.replaceState(null, '', newUrl)
    }, [searchQuery, searchFilters])

    const loadSearchHistory = () => {
        setRecentSearches(store.getSearchHistory())
    }

    const handleSearch = useCallback(async (query: string, filters: SearchFilters) => {
        setSearchQuery(query)
        setSearchFilters(filters)

        // If query is empty, clear results
        if (!query.trim()) {
            setSearchResults([])
            setShowSearchResults(false)
            return
        }

        // If no data room is selected, don't search
        if (!currentDataRoom) {
            setSearchResults([])
            setShowSearchResults(false)
            return
        }

        setIsSearching(true)

        // Get all files from the current data room using the new store method
        const filesMap = store.getFilesFromDataRoom(currentDataRoom.rootFolderId)

        const foldersMap = new Map()
        store.getAllFolders().forEach((folder) => {
            foldersMap.set(folder.id, folder)
        })

        // Perform search
        const results = await performSearch(
            { query, searchInContent: filters.searchInContent, searchInNames: filters.searchInNames },
            filesMap,
            foldersMap,
            [currentDataRoom]
        )

        setSearchResults(results)
        setShowSearchResults(true)
        setIsSearching(false)

        // Save to history
        store.saveSearchTerm(query)
        loadSearchHistory()
    }, [currentDataRoom])

    // Trigger search when query is restored from URL
    useEffect(() => {
        if (searchQuery && currentDataRoom && !showSearchResults) {
            handleSearch(searchQuery, searchFilters)
        }
    }, [searchQuery, currentDataRoom, handleSearch, searchFilters, showSearchResults])

    const handleClearSearch = useCallback(() => {
        setShowSearchResults(false)
        setSearchResults([])
        setSearchQuery('')
    }, [])

    const loadDataRooms = () => {
        setDataRooms(store.getAllDataRooms())
    }

    const restoreSelectedDataRoom = () => {
        const savedDataRoomId = localStorage.getItem('selectedDataRoomId')
        if (savedDataRoomId) {
            const room = store.getDataRoom(savedDataRoomId)
            if (room) {
                setCurrentDataRoom(room)
            }
        }
    }

    const handleCreateDataRoom = (name: string) => {
        const newRoom = store.createDataRoom(name)
        loadDataRooms()
        setCurrentDataRoom(newRoom)
        localStorage.setItem('selectedDataRoomId', newRoom.id)
    }

    const handleSelectDataRoom = (room: DataRoom) => {
        setCurrentDataRoom(room)
        localStorage.setItem('selectedDataRoomId', room.id)
    }

    const handleDeleteDataRoom = (id: string) => {
        store.deleteDataRoom(id)
        loadDataRooms()

        // If the deleted data room has search results, clear them
        const hasResultsFromDeletedRoom = searchResults.some(result => result.dataRoomId === id)
        if (hasResultsFromDeletedRoom) {
            setSearchResults([])
            setShowSearchResults(false)
            setSearchQuery('')
        }

        if (currentDataRoom?.id === id) {
            setCurrentDataRoom(null)
            localStorage.removeItem('selectedDataRoomId')
        }
    }

    const handleUpdateDataRoomName = (id: string, name: string) => {
        store.updateDataRoomName(id, name)
        if (currentDataRoom?.id === id) {
            setCurrentDataRoom({ ...currentDataRoom, name })
        }
        loadDataRooms()
    }

    return (
        <div className="flex h-screen bg-background">
            <DataRoomList
                dataRooms={dataRooms}
                currentDataRoom={currentDataRoom}
                onSelectDataRoom={handleSelectDataRoom}
                onCreateDataRoom={handleCreateDataRoom}
                onDeleteDataRoom={handleDeleteDataRoom}
                onUpdateDataRoomName={handleUpdateDataRoomName}
            />
            <div className="flex-1 flex flex-col">
                <div className="p-4 border-b border-border flex justify-end">
                    <LanguageSwitcher />
                </div>

                {showSearchResults ? (
                    <>
                        <SearchBar
                            onSearch={handleSearch}
                            recentSearches={recentSearches}
                            onClearSearch={handleClearSearch}
                            initialQuery={searchQuery}
                            initialFilters={searchFilters}
                        />
                        <SearchResults
                            results={searchResults}
                            isLoading={isSearching}
                            query={searchQuery}
                        />
                    </>
                ) : currentDataRoom ? (
                    <>
                        <SearchBar
                            onSearch={handleSearch}
                            recentSearches={recentSearches}
                            onClearSearch={handleClearSearch}
                            initialQuery={searchQuery}
                            initialFilters={searchFilters}
                        />
                        <DataRoomView dataRoom={currentDataRoom} />
                    </>
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                            <h2 className="text-2xl font-semibold mb-2">{t('app.noDataRoomSelected')}</h2>
                            <p className="text-muted-foreground">
                                {t('app.noDataRoomDescription')}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
