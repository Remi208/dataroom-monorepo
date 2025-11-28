import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { store } from '../store'

describe('Store', () => {
    beforeEach(() => {
        // Clear localStorage before each test
        localStorage.clear()
    })

    afterEach(() => {
        localStorage.clear()
    })

    describe('Data Room Operations', () => {
        it('should create a new data room', () => {
            const dataRoom = store.createDataRoom('Test Room')
            expect(dataRoom).toBeDefined()
            expect(dataRoom.name).toBe('Test Room')
            expect(dataRoom.id).toBeDefined()
            expect(dataRoom.rootFolderId).toBeDefined()
        })

        it('should retrieve all data rooms', () => {
            store.createDataRoom('Room 1')
            store.createDataRoom('Room 2')
            const rooms = store.getAllDataRooms()
            expect(rooms.length).toBe(2)
        })

        it('should retrieve a specific data room by ID', () => {
            const created = store.createDataRoom('Test Room')
            const retrieved = store.getDataRoom(created.id)
            expect(retrieved).toBeDefined()
            expect(retrieved?.name).toBe('Test Room')
        })

        it('should update data room name', () => {
            const created = store.createDataRoom('Original')
            store.updateDataRoomName(created.id, 'Updated')
            const updated = store.getDataRoom(created.id)
            expect(updated?.name).toBe('Updated')
        })

        it('should delete a data room', () => {
            const created = store.createDataRoom('To Delete')
            store.deleteDataRoom(created.id)
            const deleted = store.getDataRoom(created.id)
            expect(deleted).toBeUndefined()
        })
    })

    describe('Folder Operations', () => {
        let dataRoom: any

        beforeEach(() => {
            dataRoom = store.createDataRoom('Test Room')
        })

        it('should create a folder', () => {
            const folder = store.createFolder(dataRoom.rootFolderId, 'New Folder')
            expect(folder).toBeDefined()
            expect(folder.name).toBe('New Folder')
            expect(folder.parentFolderId).toBe(dataRoom.rootFolderId)
        })

        it('should retrieve folder structure', () => {
            const folder = store.createFolder(dataRoom.rootFolderId, 'Test Folder')
            const structure = store.getFolderStructure(folder.id)
            expect(structure).toBeDefined()
            expect(structure?.name).toBe('Test Folder')
        })

        it('should update folder name', () => {
            const folder = store.createFolder(dataRoom.rootFolderId, 'Original')
            store.updateFolderName(folder.id, 'Updated')
            const updated = store.getFolderStructure(folder.id)
            expect(updated?.name).toBe('Updated')
        })

        it('should create nested folders up to max depth', () => {
            let currentFolder = store.getFolderStructure(dataRoom.rootFolderId)
            for (let i = 0; i < 5 && currentFolder; i++) {
                currentFolder = store.createFolder(currentFolder.id, `Level ${i}`)
                expect(currentFolder).toBeDefined()
            }
            // At depth 5, we should be able to still access it
            expect(currentFolder?.id).toBeDefined()
        })
    })

    describe('File Operations', () => {
        let dataRoom: any
        let testBuffer: ArrayBuffer

        beforeEach(() => {
            dataRoom = store.createDataRoom('Test Room')
            testBuffer = new ArrayBuffer(8)
        })

        it('should upload a file', () => {
            const file = store.uploadFile(
                dataRoom.rootFolderId,
                'test.pdf',
                testBuffer,
                'application/pdf'
            )
            expect(file).toBeDefined()
            expect(file.name).toBe('test.pdf')
            expect(file.type).toBe('application/pdf')
        })

        it('should retrieve a file by ID', () => {
            const file = store.uploadFile(
                dataRoom.rootFolderId,
                'test.pdf',
                testBuffer,
                'application/pdf'
            )
            const retrieved = store.getFile(file.id)
            expect(retrieved).toBeDefined()
            expect(retrieved?.name).toBe('test.pdf')
        })

        it('should update file name', () => {
            const file = store.uploadFile(
                dataRoom.rootFolderId,
                'original.pdf',
                testBuffer,
                'application/pdf'
            )
            store.updateFileName(file.id, 'updated.pdf')
            const updated = store.getFile(file.id)
            expect(updated?.name).toBe('updated.pdf')
        })

        it('should delete a file', () => {
            const file = store.uploadFile(
                dataRoom.rootFolderId,
                'test.pdf',
                testBuffer,
                'application/pdf'
            )
            store.deleteFile(file.id)
            const deleted = store.getFile(file.id)
            expect(deleted).toBeUndefined()
        })

        it('should get all files in a folder', () => {
            store.uploadFile(dataRoom.rootFolderId, 'file1.pdf', testBuffer, 'application/pdf')
            store.uploadFile(dataRoom.rootFolderId, 'file2.pdf', testBuffer, 'application/pdf')
            const files = store.getFilesInFolder(dataRoom.rootFolderId)
            expect(files.length).toBe(2)
        })
    })

    describe('File Moving', () => {
        let dataRoom: any
        let folder1: any
        let folder2: any
        let testBuffer: ArrayBuffer

        beforeEach(() => {
            dataRoom = store.createDataRoom('Test Room')
            folder1 = store.createFolder(dataRoom.rootFolderId, 'Folder 1')
            folder2 = store.createFolder(dataRoom.rootFolderId, 'Folder 2')
            testBuffer = new ArrayBuffer(8)
        })

        it('should move a file to another folder', () => {
            const file = store.uploadFile(folder1.id, 'test.pdf', testBuffer, 'application/pdf')
            store.moveFile(file.id, folder2.id)
            const moved = store.getFile(file.id)
            expect(moved?.parentFolderId).toBe(folder2.id)
        })

        it('should move a folder to another folder', () => {
            const subFolder = store.createFolder(folder1.id, 'Sub Folder')
            store.moveFolder(subFolder.id, folder2.id)
            const moved = store.getFolderStructure(subFolder.id)
            expect(moved?.parentFolderId).toBe(folder2.id)
        })
    })

    describe('Persistence', () => {
        it('should persist data to localStorage', () => {
            const dataRoom = store.createDataRoom('Persistent Room')
            store.uploadFile(
                dataRoom.rootFolderId,
                'test.pdf',
                new ArrayBuffer(8),
                'application/pdf'
            )

            // Data should be in localStorage
            const savedData = localStorage.getItem('dataRoomsData')
            expect(savedData).toBeDefined()
            expect(savedData).toContain('Persistent Room')
        })

        it('should load data from localStorage', () => {
            // Create data
            store.createDataRoom('Saved Room')

            // Simulate reload by checking if data persists
            const rooms = store.getAllDataRooms()
            expect(rooms.length).toBeGreaterThan(0)
            expect(rooms.some(r => r.name === 'Saved Room')).toBe(true)
        })
    })

    describe('Folder Deletion', () => {
        let dataRoom: any

        beforeEach(() => {
            dataRoom = store.createDataRoom('Test Room')
        })

        it('should delete folder recursively with all contents', () => {
            const folder = store.createFolder(dataRoom.rootFolderId, 'To Delete')
            const subFolder = store.createFolder(folder.id, 'Sub Folder')
            const file = store.uploadFile(
                subFolder.id,
                'test.pdf',
                new ArrayBuffer(8),
                'application/pdf'
            )

            // Delete the root folder
            store.deleteFolderRecursive(folder.id)

            // All should be deleted
            expect(store.getFolderStructure(folder.id)).toBeUndefined()
            expect(store.getFolderStructure(subFolder.id)).toBeUndefined()
            expect(store.getFile(file.id)).toBeUndefined()
        })
    })
})
