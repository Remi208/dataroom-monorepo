import { ChevronRight, Folder as FolderIcon, File, Download, Upload, Edit2, Trash2, Check, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Folder, FileMetadata } from '../../../types'
import { store } from '../../../store'
import { CONSTANTS } from '../../../shared/constants'

export interface FolderItemProps {
    item: Folder | FileMetadata
    depth: number
    isExpanded: boolean
    isEditing: boolean
    editName: string
    dragOverFolderId: string | null
    expandedFolders: Set<string>
    onToggleFolder: (id: string) => void
    onSelectFile: (id: string) => void
    onRenameItem: (id: string, name: string) => void
    onSaveRename: (id: string) => void
    onEditNameChange: (name: string) => void
    onDeleteItem: (id: string) => void
    onFileUpload: (folderId: string) => (e: React.ChangeEvent<HTMLInputElement>) => void
    onDragStart: (e: React.DragEvent, item: Folder | FileMetadata) => void
    onDragOver: (e: React.DragEvent) => void
    onDragEnter: (e: React.DragEvent, folderId: string) => void
    onDragLeave: (e: React.DragEvent) => void
    onDrop: (e: React.DragEvent, folderId: string) => void
    onEditingChange: (id: string | null) => void
}

export function FolderItem({
    item,
    depth,
    isExpanded,
    isEditing,
    editName,
    dragOverFolderId,
    onToggleFolder,
    onSelectFile,
    onRenameItem,
    onSaveRename,
    onEditNameChange,
    onDeleteItem,
    onFileUpload,
    onDragStart,
    onDragOver,
    onDragEnter,
    onDragLeave,
    onDrop,
    onEditingChange,
}: FolderItemProps) {
    const { t } = useTranslation()
    const isFolder = 'children' in item
    const isFile = !('children' in item)

    return (
        <div
            className={`flex items-center gap-2 px-2 hover:bg-accent/30 rounded group h-8 border-l-2 border-gray-300 ${isFolder && dragOverFolderId === item.id && depth < CONSTANTS.MAX_FOLDER_DEPTH
                    ? 'bg-blue-100/20 border-2 border-blue-500'
                    : ''
                }`}
            style={{ marginLeft: `${depth * 12}px`, paddingLeft: `${depth > 0 ? 8 : 0}px` }}
            draggable={!isEditing}
            onDragStart={(e) => onDragStart(e, item)}
            onDragOver={isFolder && depth < CONSTANTS.MAX_FOLDER_DEPTH ? onDragOver : undefined}
            onDragEnter={isFolder && depth < CONSTANTS.MAX_FOLDER_DEPTH ? (e) => onDragEnter(e, item.id) : undefined}
            onDragLeave={onDragLeave}
            onDrop={isFolder && depth < CONSTANTS.MAX_FOLDER_DEPTH ? (e) => onDrop(e, item.id) : undefined}
        >
            {isFolder && (
                <button
                    onClick={() => onToggleFolder(item.id)}
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
                <File size={18} className="text-red-500 flex-shrink-0" />
            )}

            {isEditing ? (
                <div className="flex-1 flex gap-1" onClick={(e) => e.stopPropagation()}>
                    <input
                        type="text"
                        value={editName}
                        onChange={(e) => onEditNameChange(e.target.value)}
                        className="flex-1 px-2 text-sm border border-input rounded bg-background text-foreground h-6"
                        autoFocus
                        onKeyPress={(e) => {
                            if (e.key === 'Enter') onSaveRename(item.id)
                        }}
                    />
                    <button
                        onClick={() => onSaveRename(item.id)}
                        className="p-1 hover:bg-muted rounded"
                    >
                        <Check size={16} />
                    </button>
                    <button
                        onClick={() => onEditingChange(null)}
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
                                onSelectFile(item.id)
                            } else {
                                onToggleFolder(item.id)
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
                                    onChange={onFileUpload(item.id)}
                                    className="hidden"
                                />
                                <Upload size={16} />
                            </label>
                        )}
                        <button
                            onClick={() => onRenameItem(item.id, item.name)}
                            className="p-1 hover:bg-white/20 rounded"
                            title={t('folder.rename')}
                        >
                            <Edit2 size={16} />
                        </button>
                        <button
                            onClick={() => onDeleteItem(item.id)}
                            className="p-1 hover:bg-destructive/20 text-destructive rounded"
                            title={t('folder.delete')}
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                </>
            )}
        </div>
    )
}
