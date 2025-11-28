import { DataRoom, Folder, StoreFile } from './types'

interface StorageState {
    dataRooms: DataRoom[];
    folders: Map<string, Folder>;
    files: Map<string, StoreFile>;
}

const generateId = (): string => Math.random().toString(36).substring(2, 11)

// Helper functions to convert ArrayBuffer to/from base64
const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
    const bytes = new Uint8Array(buffer)
    let binary = ''
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i])
    }
    return btoa(binary)
}

const base64ToArrayBuffer = (base64: string): ArrayBuffer => {
    const binary = atob(base64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i)
    }
    return bytes.buffer
}

// Helper function to check for duplicate names in a folder and generate unique name if needed
const getUniqueFolderName = (folderName: string, parentFolder: Folder | null): string => {
    if (!parentFolder || !parentFolder.children || parentFolder.children.length === 0) {
        return folderName
    }

    // Get all sibling folder names
    const siblingNames = parentFolder.children
        .filter((child) => 'parentFolderId' in child) // It's a folder, not a file
        .map((child) => child.name)

    // If the name is not taken, return it as is
    if (!siblingNames.includes(folderName)) {
        return folderName
    }

    // Generate unique name with (new) suffix
    let uniqueName = `${folderName} (new)`
    let counter = 1
    while (siblingNames.includes(uniqueName)) {
        uniqueName = `${folderName} (new ${counter})`
        counter++
    }

    return uniqueName
}

class DataRoomStore {
    private state: StorageState = {
        dataRooms: [],
        folders: new Map(),
        files: new Map(),
    }

    private storageKey = 'dataroom_store'

    constructor() {
        this.loadFromStorage()
    }

    private loadFromStorage(): void {
        const stored = localStorage.getItem(this.storageKey)
        if (stored) {
            try {
                const data = JSON.parse(stored)
                this.state.dataRooms = data.dataRooms || []
                this.state.folders = new Map(data.folders || [])
                // Convert base64 data back to ArrayBuffer
                this.state.files = new Map(
                    (data.files || []).map((f: any) => [
                        f.id,
                        {
                            ...f,
                            data: f.data ? base64ToArrayBuffer(f.data) : null,
                        },
                    ])
                )
            } catch (e) {
                console.error('Failed to load storage', e)
            }
        }
    }

    private saveToStorage(): void {
        const data = {
            dataRooms: this.state.dataRooms,
            folders: Array.from(this.state.folders.entries()),
            files: Array.from(this.state.files.entries()).map(([_, file]) => ({
                ...file,
                data: file.data ? arrayBufferToBase64(file.data) : null,
            })),
        }
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(data))
        } catch (error) {
            if (error instanceof Error && error.name === 'QuotaExceededError') {
                throw new Error('Storage quota exceeded. Please delete some files or data rooms to continue.')
            }
            throw error
        }
    }

    createDataRoom(name: string): DataRoom {
        const id = generateId()
        const rootFolderId = generateId()
        const now = Date.now()

        const rootFolder: Folder = {
            id: rootFolderId,
            name: 'root',
            parentFolderId: null,
            createdAt: now,
            updatedAt: now,
            children: [],
        }

        const dataRoom: DataRoom = {
            id,
            name,
            createdAt: now,
            updatedAt: now,
            rootFolderId,
        }

        this.state.dataRooms.push(dataRoom)
        this.state.folders.set(rootFolderId, rootFolder)
        this.saveToStorage()
        return dataRoom
    }

    getDataRoom(id: string): DataRoom | undefined {
        return this.state.dataRooms.find((dr) => dr.id === id)
    }

    getAllDataRooms(): DataRoom[] {
        return this.state.dataRooms
    }

    updateDataRoomName(id: string, name: string): void {
        const room = this.state.dataRooms.find((dr) => dr.id === id)
        if (room) {
            room.name = name
            room.updatedAt = Date.now()
            this.saveToStorage()
        }
    }

    deleteDataRoom(id: string): void {
        const room = this.getDataRoom(id)
        if (room) {
            this.deleteFolderRecursive(room.rootFolderId)
            this.state.dataRooms = this.state.dataRooms.filter((dr) => dr.id !== id)
            this.saveToStorage()
        }
    }

    createFolder(
        parentFolderId: string | null,
        name: string
    ): Folder {
        const id = generateId()
        const now = Date.now()

        // Get parent folder to check for duplicate names
        const parentFolder = parentFolderId ? this.state.folders.get(parentFolderId) || null : null
        const uniqueName = getUniqueFolderName(name, parentFolder)

        const folder: Folder = {
            id,
            name: uniqueName,
            parentFolderId,
            createdAt: now,
            updatedAt: now,
            children: [],
        }

        this.state.folders.set(id, folder)

        if (parentFolderId) {
            const parentFolder = this.state.folders.get(parentFolderId)
            if (parentFolder) {
                parentFolder.children.push(folder)
                parentFolder.updatedAt = now
            }
        }

        this.saveToStorage()
        return folder
    }

    getFolder(id: string): Folder | undefined {
        return this.state.folders.get(id)
    }

    updateFolderName(id: string, name: string): void {
        const folder = this.state.folders.get(id)
        if (folder) {
            folder.name = name
            folder.updatedAt = Date.now()
            this.saveToStorage()
        }
    }

    deleteFolderRecursive(id: string): void {
        const folder = this.state.folders.get(id)
        if (!folder) return

        // Delete all children
        folder.children.forEach((child) => {
            if ('parentFolderId' in child && child.parentFolderId !== null) {
                // It's a folder
                if (this.state.folders.has(child.id)) {
                    this.deleteFolderRecursive(child.id)
                }
            } else if ('data' in child) {
                // It's a file
                this.state.files.delete(child.id)
            }
        })

        // Delete the folder itself
        if (folder.parentFolderId) {
            const parentFolder = this.state.folders.get(folder.parentFolderId)
            if (parentFolder) {
                parentFolder.children = parentFolder.children.filter(
                    (c) => c.id !== id
                )
            }
        }

        this.state.folders.delete(id)
        this.saveToStorage()
    }

    uploadFile(
        parentFolderId: string,
        name: string,
        data: ArrayBuffer,
        type: string
    ): StoreFile {
        const id = generateId()
        const now = Date.now()

        const file: StoreFile = {
            id,
            name,
            parentFolderId,
            size: data.byteLength,
            type,
            createdAt: now,
            updatedAt: now,
            data,
        }

        this.state.files.set(id, file)

        const parentFolder = this.state.folders.get(parentFolderId)
        if (parentFolder) {
            parentFolder.children.push({
                id,
                name,
                parentFolderId,
                size: data.byteLength,
                type,
                createdAt: now,
                updatedAt: now,
            })
            parentFolder.updatedAt = now
        }

        this.saveToStorage()
        return file
    }

    getFile(id: string): StoreFile | undefined {
        return this.state.files.get(id)
    }

    updateFileName(id: string, name: string): void {
        const file = this.state.files.get(id)
        if (file) {
            file.name = name
            file.updatedAt = Date.now()

            if (file.parentFolderId) {
                const parentFolder = this.state.folders.get(file.parentFolderId)
                if (parentFolder) {
                    const fileInFolder = parentFolder.children.find((c) => c.id === id)
                    if (fileInFolder) {
                        fileInFolder.name = name
                        fileInFolder.updatedAt = Date.now()
                    }
                }
            }

            this.saveToStorage()
        }
    }

    deleteFile(id: string): void {
        const file = this.state.files.get(id)
        if (file) {
            if (file.parentFolderId) {
                const parentFolder = this.state.folders.get(file.parentFolderId)
                if (parentFolder) {
                    parentFolder.children = parentFolder.children.filter((c) => c.id !== id)
                    parentFolder.updatedAt = Date.now()
                }
            }

            this.state.files.delete(id)
            this.saveToStorage()
        }
    }

    getFilesInFolder(folderId: string): string[] {
        const folder = this.state.folders.get(folderId)
        if (!folder) return []

        return folder.children
            .filter((child) => !('children' in child))
            .map((child) => (child as any).name)
    }

    moveFile(fileId: string, newParentFolderId: string): void {
        const file = this.state.files.get(fileId)
        if (!file) return

        // Remove from old parent
        if (file.parentFolderId) {
            const oldParent = this.state.folders.get(file.parentFolderId)
            if (oldParent) {
                oldParent.children = oldParent.children.filter((c) => c.id !== fileId)
                oldParent.updatedAt = Date.now()
            }
        }

        // Update file's parent
        file.parentFolderId = newParentFolderId
        file.updatedAt = Date.now()

        // Add to new parent
        const newParent = this.state.folders.get(newParentFolderId)
        if (newParent) {
            newParent.children.push({
                id: file.id,
                name: file.name,
                parentFolderId: file.parentFolderId,
                size: file.size,
                type: file.type,
                createdAt: file.createdAt,
                updatedAt: file.updatedAt,
            })
            newParent.updatedAt = Date.now()
        }

        this.saveToStorage()
    }

    moveFolder(folderId: string, newParentFolderId: string): void {
        const folder = this.state.folders.get(folderId)
        if (!folder) return

        // Can't move folder into itself or its children
        if (folderId === newParentFolderId) return

        // Get the new parent folder to check for duplicate names
        const newParent = this.state.folders.get(newParentFolderId)
        if (!newParent) return

        // Check if a folder with the same name already exists at the destination
        const uniqueName = getUniqueFolderName(folder.name, newParent)

        // Remove from old parent
        if (folder.parentFolderId) {
            const oldParent = this.state.folders.get(folder.parentFolderId)
            if (oldParent) {
                oldParent.children = oldParent.children.filter((c) => c.id !== folderId)
                oldParent.updatedAt = Date.now()
            }
        }

        // Update folder's parent and name if needed
        folder.parentFolderId = newParentFolderId
        folder.name = uniqueName
        folder.updatedAt = Date.now()

        // Add to new parent
        newParent.children.push({
            id: folder.id,
            name: folder.name,
            parentFolderId: folder.parentFolderId,
            createdAt: folder.createdAt,
            updatedAt: folder.updatedAt,
            children: [],
        })
        newParent.updatedAt = Date.now()

        this.saveToStorage()
    }

    getFolderStructure(folderId: string): Folder | undefined {
        const folder = this.state.folders.get(folderId)
        if (!folder) return undefined

        return this.buildFolderStructure(folder)
    }

    private buildFolderStructure(folder: Folder): Folder {
        const children = folder.children.map((child) => {
            if ('data' in child) {
                // It's a file
                return child
            } else {
                // It's a folder
                const childFolder = this.state.folders.get(child.id)
                if (childFolder) {
                    return this.buildFolderStructure(childFolder)
                }
                return child
            }
        })

        return {
            ...folder,
            children,
        }
    }

    // Search and history methods
    private searchHistoryKey = 'dataroom_search_history'

    getAllFiles(): StoreFile[] {
        return Array.from(this.state.files.values())
    }

    getAllFolders(): Folder[] {
        return Array.from(this.state.folders.values())
    }

    /**
     * Collect all files from a data room (recursively from root folder)
     */
    getFilesFromDataRoom(rootFolderId: string): Map<string, StoreFile> {
        const filesMap = new Map<string, StoreFile>()

        const collectFilesFromFolder = (folder: Folder) => {
            if (folder.children) {
                for (const child of folder.children) {
                    // Check if it's a folder by seeing if it exists in folders map
                    const childFolder = this.state.folders.get(child.id)
                    if (childFolder) {
                        // It's a folder - recurse
                        collectFilesFromFolder(childFolder)
                    } else {
                        // It's a file - get it from the files map
                        const file = this.getFile(child.id)
                        if (file) {
                            filesMap.set(file.id, file)
                        }
                    }
                }
            }
        }

        const rootFolder = this.state.folders.get(rootFolderId)
        if (rootFolder) {
            collectFilesFromFolder(rootFolder)
        }

        return filesMap
    }

    getSearchHistory(): string[] {
        try {
            const history = localStorage.getItem(this.searchHistoryKey)
            return history ? JSON.parse(history) : []
        } catch {
            return []
        }
    }

    saveSearchTerm(term: string): void {
        if (!term.trim()) return

        try {
            let history = this.getSearchHistory()
            // Remove duplicate if exists
            history = history.filter((h) => h !== term)
            // Add to front
            history.unshift(term)
            // Keep only last 20 searches
            history = history.slice(0, 20)
            localStorage.setItem(this.searchHistoryKey, JSON.stringify(history))
        } catch (e) {
            console.error('Failed to save search history', e)
        }
    }

    clearSearchHistory(): void {
        try {
            localStorage.removeItem(this.searchHistoryKey)
        } catch (e) {
            console.error('Failed to clear search history', e)
        }
    }
}

export const store = new DataRoomStore()
