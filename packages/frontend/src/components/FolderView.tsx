import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Folder, FileMetadata } from '../types'
import { store } from '../store'
import { CONSTANTS } from '../shared/constants/app'
import { ChevronRight, Folder as FolderIcon, File, Plus, Trash2, Edit2, Check, X, Download, Upload } from 'lucide-react'
import { Button } from './ui/Button'
import { FilePreview } from '../features/files/components'

interface FolderViewProps {
    folder: Folder
    onUpdate: () => void
}

export function FolderView({ folder, onUpdate }: FolderViewProps) {
    const { t } = useTranslation()
    const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set([folder.id]))
    const [showNewFolderForm, setShowNewFolderForm] = useState<string | null>(null)
    const [newFolderName, setNewFolderName] = useState('')
    const [editingItemId, setEditingItemId] = useState<string | null>(null)
    const [editName, setEditName] = useState('')
    const [selectedFileId, setSelectedFileId] = useState<string | null>(null)
    const [dragOverFolderId, setDragOverFolderId] = useState<string | null>(null)

    // Calculate folder nesting depth
    const calculateFolderDepth = (folderId: string, currentDepth: number = 0): number => {
        const folderStruct = store.getFolderStructure(folderId)
        if (!folderStruct || !folderStruct.parentFolderId) return currentDepth
        return calculateFolderDepth(folderStruct.parentFolderId, currentDepth + 1)
    }

    const toggleFolder = (folderId: string) => {
        setExpandedFolders((prevExpanded) => {
            const newExpanded = new Set(prevExpanded)
            if (newExpanded.has(folderId)) {
                newExpanded.delete(folderId)
            } else {
                newExpanded.add(folderId)
            }
            return newExpanded
        })
    }

    const handleCreateFolder = (parentFolderId: string) => {
        // Check max nesting depth (max 5 levels)
        const currentDepth = calculateFolderDepth(parentFolderId)
        if (currentDepth >= CONSTANTS.MAX_FOLDER_DEPTH) {
            alert(t('messages.maxNestingDepth'))
            return
        }

        if (newFolderName.trim()) {
            store.createFolder(parentFolderId, newFolderName)
            setNewFolderName('')
            setShowNewFolderForm(null)
            onUpdate()
        }
    }

    const isFileAllowed = (file: File): boolean => {
        const mimeType = file.type
        const fileName = file.name.toLowerCase()

        const hasValidType = CONSTANTS.ALLOWED_FILE_TYPES.some(type => mimeType === type || mimeType.includes('pdf'))
        const hasValidExtension = CONSTANTS.ALLOWED_FILE_EXTENSIONS.some(ext => fileName.endsWith(ext))

        return hasValidType || hasValidExtension
    }

    const getFileIcon = () => {
        // All files are PDFs
        return <File size={18} className="text-red-500 flex-shrink-0" />
    }

    const getUniqueFileName = (fileName: string, parentFolderId: string): string => {
        const existingFiles = store.getFilesInFolder(parentFolderId)
        const lowerCaseExisting = existingFiles.map(f => f.toLowerCase())

        if (!lowerCaseExisting.includes(fileName.toLowerCase())) {
            return fileName
        }

        // Find the next available counter - append after the full filename
        let counter = 1
        // eslint-disable-next-line no-constant-condition
        while (true) {
            const newName = `${fileName} (${counter})`
            if (!lowerCaseExisting.includes(newName.toLowerCase())) {
                return newName
            }
            counter++
        }
    }

    const handleFileUpload = (parentFolderId: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.currentTarget.files
        if (files) {
            Array.from(files).forEach((file) => {
                if (isFileAllowed(file)) {
                    const reader = new FileReader()
                    reader.onload = (event) => {
                        if (event.target?.result instanceof ArrayBuffer) {
                            const uniqueName = getUniqueFileName(file.name, parentFolderId)
                            store.uploadFile(parentFolderId, uniqueName, event.target.result, file.type)
                            onUpdate()
                        }
                    }
                    reader.readAsArrayBuffer(file)
                } else {
                    alert(`File type not supported: ${file.name}\nSupported format: PDF`)
                }
            })
        }
        // Reset input value so the same file can be uploaded again
        e.currentTarget.value = ''
    }

    const processDraggedFiles = (files: FileList, parentFolderId: string) => {
        Array.from(files).forEach((file) => {
            if (isFileAllowed(file)) {
                const reader = new FileReader()
                reader.onload = (event) => {
                    if (event.target?.result instanceof ArrayBuffer) {
                        const uniqueName = getUniqueFileName(file.name, parentFolderId)
                        store.uploadFile(parentFolderId, uniqueName, event.target.result, file.type)
                        onUpdate()
                    }
                }
                reader.readAsArrayBuffer(file)
            } else {
                alert(`${t('file.invalidFileFormat')}: ${file.name}`)
            }
        })
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
    }

    const handleDragEnter = (e: React.DragEvent, folderId: string) => {
        e.preventDefault()
        e.stopPropagation()
        setDragOverFolderId(folderId)
    }

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setDragOverFolderId(null)
    }

    const handleDrop = (e: React.DragEvent, parentFolderId: string) => {
        e.preventDefault()
        e.stopPropagation()
        setDragOverFolderId(null)

        // Check if it's a dragged item (file or folder)
        const draggedItemData = e.dataTransfer.getData('application/json')
        if (draggedItemData) {
            try {
                const item = JSON.parse(draggedItemData)
                if (item.id && item.type) {
                    // For folders, check max depth restriction
                    if (item.type === 'folder') {
                        const targetDepth = calculateFolderDepth(parentFolderId)
                        if (targetDepth >= 5) {
                            alert(t('messages.cannotMoveFolderDepth'))
                            return
                        }
                    }

                    // Move the item
                    if (item.type === 'file') {
                        store.moveFile(item.id, parentFolderId)
                    } else if (item.type === 'folder') {
                        store.moveFolder(item.id, parentFolderId)
                    }
                    onUpdate()
                    return
                }
            } catch (e) {
                // Not a valid item transfer, fall through to file upload
            }
        }

        // Otherwise, process as file upload
        const files = e.dataTransfer.files
        if (files && files.length > 0) {
            processDraggedFiles(files, parentFolderId)
        }
    }

    const handleRenameItem = (itemId: string, itemName: string) => {
        setEditingItemId(itemId)
        setEditName(itemName)
    }

    const handleSaveRename = (itemId: string) => {
        if (editName.trim()) {
            const file = store.getFile(itemId)
            if (file) {
                store.updateFileName(itemId, editName)
            } else {
                store.updateFolderName(itemId, editName)
            }
            setEditingItemId(null)
            setEditName('')
            onUpdate()
        }
    }

    const handleDeleteItem = (itemId: string) => {
        if (confirm(t('messages.confirmDelete'))) {
            const file = store.getFile(itemId)
            if (file) {
                store.deleteFile(itemId)
            } else {
                store.deleteFolderRecursive(itemId)
            }
            onUpdate()
        }
    }

    const renderItem = (item: Folder | FileMetadata, depth: number) => {
        const isFolder = 'children' in item
        const isFile = !('children' in item)
        const isExpanded = expandedFolders.has(item.id)
        const isEditing = editingItemId === item.id

        return (
            <div key={item.id}>
                <div
                    className={`flex items-center gap-2 px-2 hover:bg-accent/30 rounded group h-8 border-l-2 border-gray-300 ${isFolder && dragOverFolderId === item.id && depth < 5 ? 'bg-blue-100/20 border-2 border-blue-500' : ''
                        }`}
                    style={{ marginLeft: `${depth * 12}px`, paddingLeft: `${depth > 0 ? 8 : 0}px` }}
                    draggable={!isEditing}
                    onDragStart={(e) => {
                        e.dataTransfer.effectAllowed = 'move'
                        e.dataTransfer.setData('application/json', JSON.stringify({ id: item.id, type: isFolder ? 'folder' : 'file' }))
                    }}
                    onDragEnd={() => {
                        // Drag end - cleanup if needed
                    }}
                    onDragOver={isFolder && depth < 5 ? handleDragOver : undefined}
                    onDragEnter={isFolder && depth < 5 ? (e) => handleDragEnter(e, item.id) : undefined}
                    onDragLeave={handleDragLeave}
                    onDrop={isFolder && depth < 5 ? (e) => handleDrop(e, item.id) : undefined}
                >
                    {isFolder && (
                        <button
                            onClick={() => toggleFolder(item.id)}
                            className="p-1 hover:bg-white/20 rounded"
                            aria-label={isExpanded ? 'Collapse folder' : 'Expand folder'}
                        >
                            <ChevronRight
                                size={18}
                                style={{
                                    transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                                    transition: 'transform 0.2s',
                                }}
                            />
                        </button>
                    )}

                    {isFolder ? (
                        <FolderIcon size={18} className="text-blue-500 flex-shrink-0" />
                    ) : (
                        getFileIcon()
                    )}

                    {isEditing ? (
                        <div className="flex-1 flex gap-1" onClick={(e) => e.stopPropagation()}>
                            <input
                                type="text"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="flex-1 px-2 text-sm border border-input rounded bg-background text-foreground h-6"
                                autoFocus
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') handleSaveRename(item.id)
                                }}
                            />
                            <button
                                onClick={() => handleSaveRename(item.id)}
                                className="p-1 hover:bg-muted rounded"
                            >
                                <Check size={16} />
                            </button>
                            <button
                                onClick={() => setEditingItemId(null)}
                                className="p-1 hover:bg-muted rounded"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    ) : (
                        <>
                            <span
                                className="flex-1 text-sm truncate cursor-pointer hover:underline"
                                onClick={() => {
                                    if (isFile) {
                                        setSelectedFileId(item.id)
                                    } else {
                                        toggleFolder(item.id)
                                    }
                                }}
                            >
                                {item.name}
                            </span>
                            <div className="hidden group-hover:flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                {isFile && (
                                    <button
                                        onClick={() => {
                                            const file = store.getFile(item.id)
                                            if (file?.data) {
                                                const blob = new Blob([file.data], { type: file.type })
                                                const url = URL.createObjectURL(blob)
                                                window.open(url, '_blank')
                                            }
                                        }}
                                        className="p-1 hover:bg-white/20 rounded"
                                        title={t('file.download')}
                                    >
                                        <Download size={16} />
                                    </button>
                                )}
                                {isFolder && (
                                    <label
                                        className="p-1 hover:bg-white/20 rounded cursor-pointer"
                                        title={t('file.upload')}
                                    >
                                        <input
                                            type="file"
                                            multiple
                                            accept=".pdf"
                                            onChange={handleFileUpload(item.id)}
                                            className="hidden"
                                        />
                                        <Upload size={16} />
                                    </label>
                                )}
                                <button
                                    onClick={() => handleRenameItem(item.id, item.name)}
                                    className="p-1 hover:bg-white/20 rounded"
                                    title={t('folder.rename')}
                                >
                                    <Edit2 size={16} />
                                </button>
                                <button
                                    onClick={() => handleDeleteItem(item.id)}
                                    className="p-1 hover:bg-destructive/20 text-destructive rounded"
                                    title={t('folder.delete')}
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </>
                    )}
                </div>

                {isFolder && isExpanded && 'children' in item && (
                    <div style={{ marginLeft: `${(depth + 1) * 12}px` }} className="border-l-2 border-gray-300 pl-2">
                        <div className="flex gap-2 py-2 px-2">
                            <button
                                onClick={() => {
                                    const currentDepth = calculateFolderDepth(item.id)
                                    if (currentDepth >= 5) {
                                        alert(t('messages.maxNestingDepth'))
                                        return
                                    }
                                    setShowNewFolderForm(showNewFolderForm === item.id ? null : item.id)
                                }}
                                disabled={calculateFolderDepth(item.id) >= 5}
                                className="text-xs px-2 py-1 hover:bg-accent/30 rounded border border-input disabled:opacity-50 disabled:cursor-not-allowed"
                                title={t('folder.newFolder')}
                            >
                                <Plus size={12} className="inline mr-1" />
                                {t('folder.newFolder')}
                            </button>
                            {calculateFolderDepth(item.id) >= 5 && (
                                <span className="text-xs text-amber-600 px-2 py-1">{t('folder.maxDepthReached')}</span>
                            )}
                        </div>

                        {showNewFolderForm === item.id && (
                            <div className="p-2 mx-2 mb-2 border border-input rounded-md space-y-2 bg-accent/10">
                                <input
                                    type="text"
                                    placeholder={t('folder.folderName')}
                                    value={newFolderName}
                                    onChange={(e) => setNewFolderName(e.target.value)}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') handleCreateFolder(item.id)
                                    }}
                                    className="w-full px-2 py-1 border border-input rounded text-sm bg-background"
                                    autoFocus
                                />
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleCreateFolder(item.id)}
                                        disabled={!newFolderName.trim()}
                                        className="flex-1 px-2 py-1 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50"
                                    >
                                        {t('buttons.create')}
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowNewFolderForm(null)
                                            setNewFolderName('')
                                        }}
                                        className="flex-1 px-2 py-1 text-sm border border-input rounded hover:bg-accent/30"
                                    >
                                        {t('buttons.cancel')}
                                    </button>
                                </div>
                            </div>
                        )}

                        {item.children
                            .sort((a, b) => {
                                const aIsFolder = 'children' in a
                                const bIsFolder = 'children' in b
                                if (aIsFolder && !bIsFolder) return -1
                                if (!aIsFolder && bIsFolder) return 1
                                return a.name.localeCompare(b.name)
                            })
                            .map((child) => renderItem(child, depth + 1))}
                    </div>
                )}
            </div>
        )
    }

    return (
        <div className="p-4">
            <div className="flex gap-2 mb-4">
                <Button
                    size="sm"
                    onClick={() => setShowNewFolderForm(showNewFolderForm === folder.id ? null : folder.id)}
                    className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                    <Plus size={16} />
                    New Folder
                </Button>
                <input
                    type="file"
                    id="root-file-upload"
                    multiple
                    accept=".pdf"
                    onChange={handleFileUpload(folder.id)}
                    className="hidden"
                />
                <Button
                    size="sm"
                    onClick={() => document.getElementById('root-file-upload')?.click()}
                    className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                    <Plus size={16} />
                    {t('file.upload')}
                </Button>
            </div>

            {showNewFolderForm === folder.id && (
                <div className="mb-4 p-3 border border-input rounded-md space-y-2 bg-accent/10">
                    <input
                        type="text"
                        placeholder={t('folder.folderName')}
                        value={newFolderName}
                        onChange={(e) => setNewFolderName(e.target.value)}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter') handleCreateFolder(folder.id)
                        }}
                        className="w-full px-3 py-2 border border-input rounded text-sm bg-background"
                        autoFocus
                    />
                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            onClick={() => handleCreateFolder(folder.id)}
                            disabled={!newFolderName.trim()}
                            className="flex-1"
                        >
                            {t('buttons.create')}
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                                setShowNewFolderForm(null)
                                setNewFolderName('')
                            }}
                            className="flex-1"
                        >
                            {t('buttons.cancel')}
                        </Button>
                    </div>
                </div>
            )}

            <div
                className="space-y-1"
                onDragOver={handleDragOver}
                onDragEnter={(e) => handleDragEnter(e, folder.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, folder.id)}
            >
                {folder.children && folder.children.length > 0 ? (
                    folder.children
                        .sort((a, b) => {
                            const aIsFolder = 'children' in a
                            const bIsFolder = 'children' in b
                            if (aIsFolder && !bIsFolder) return -1
                            if (!aIsFolder && bIsFolder) return 1
                            return a.name.localeCompare(b.name)
                        })
                        .map((item) => renderItem(item, 0))
                ) : (
                    <p className="text-sm text-muted-foreground py-4">
                        {t('folder.empty')}
                    </p>
                )}
            </div>

            <div
                className={`mt-4 p-4 border-2 border-dashed rounded-md transition-colors ${dragOverFolderId === folder.id
                    ? 'border-blue-500 bg-blue-50/20'
                    : 'border-gray-300 bg-gray-50/20'
                    }`}
                onDragOver={handleDragOver}
                onDragEnter={(e) => handleDragEnter(e, folder.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, folder.id)}
            >
                <p className="text-sm text-gray-600 text-center">
                    {t('folder.dragHere')}
                </p>
            </div>

            {selectedFileId && (
                <FilePreview
                    fileId={selectedFileId}
                    onClose={() => setSelectedFileId(null)}
                />
            )}
        </div>
    )
}
