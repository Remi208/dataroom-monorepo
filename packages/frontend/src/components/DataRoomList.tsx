import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { DataRoom } from '../types'
import { Plus, Trash2, Edit2, Check, X } from 'lucide-react'
import { Button } from './ui/Button'

interface DataRoomListProps {
    dataRooms: DataRoom[]
    currentDataRoom: DataRoom | null
    onSelectDataRoom: (room: DataRoom) => void
    onCreateDataRoom: (name: string) => void
    onDeleteDataRoom: (id: string) => void
    onUpdateDataRoomName: (id: string, name: string) => void
}

export function DataRoomList({
    dataRooms,
    currentDataRoom,
    onSelectDataRoom,
    onCreateDataRoom,
    onDeleteDataRoom,
    onUpdateDataRoomName,
}: DataRoomListProps) {
    const { t } = useTranslation()
    const [showNewForm, setShowNewForm] = useState(false)
    const [newName, setNewName] = useState('')
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editName, setEditName] = useState('')

    const handleCreate = () => {
        if (newName.trim()) {
            // Check if a data room with this name already exists
            const nameExists = dataRooms.some(
                room => room.name.toLowerCase() === newName.trim().toLowerCase()
            )

            if (nameExists) {
                alert(t('dataroom.duplicateNameError', { name: newName }))
                return
            }

            onCreateDataRoom(newName)
            setNewName('')
            setShowNewForm(false)
        }
    }

    const handleUpdate = (id: string) => {
        if (editName.trim()) {
            // Check if a data room with this name already exists (excluding the current one being edited)
            const nameExists = dataRooms.some(
                room => room.id !== id && room.name.toLowerCase() === editName.trim().toLowerCase()
            )

            if (nameExists) {
                alert(t('dataroom.duplicateNameError', { name: editName }))
                return
            }

            onUpdateDataRoomName(id, editName)
            setEditingId(null)
            setEditName('')
        }
    }

    const startEdit = (id: string, name: string) => {
        setEditingId(id)
        setEditName(name)
    }

    return (
        <div className="w-80 bg-card border-r border-border flex flex-col">
            <div className="p-4 border-b border-border">
                <h1 className="text-xl font-semibold mb-4">{t('dataroom.title')}</h1>
                <Button
                    onClick={() => setShowNewForm(true)}
                    className="w-full gap-2 bg-slate-600 hover:bg-slate-700 text-white"
                >
                    <Plus size={18} />
                    {t('dataroom.newDataRoom')}
                </Button>
            </div>

            {showNewForm && (
                <div className="p-4 border-b border-border space-y-2">
                    <input
                        type="text"
                        placeholder={t('dataroom.dataroomName')}
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter') handleCreate()
                        }}
                        className="w-full px-3 py-2 border border-input rounded-md text-sm bg-background"
                        autoFocus
                    />
                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            onClick={handleCreate}
                            disabled={!newName.trim()}
                            className="flex-1"
                        >
                            Create
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                                setShowNewForm(false)
                                setNewName('')
                            }}
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            )}

            <div className="flex-1 overflow-y-auto">
                {dataRooms.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground text-sm">
                        {t('dataroom.noDataRooms')}
                    </div>
                ) : (
                    <div className="space-y-1 p-2">
                        {dataRooms.map((room) => (
                            <div
                                key={room.id}
                                className={`group flex items-center gap-2 p-3 rounded-md cursor-pointer transition-colors h-12 ${currentDataRoom?.id === room.id
                                    ? 'bg-slate-500 text-white'
                                    : 'hover:bg-slate-100 hover:text-slate-900'
                                    }`}
                                onClick={() => !editingId && onSelectDataRoom(room)}
                            >
                                {editingId === room.id ? (
                                    <div className="flex-1 flex gap-1" onClick={(e) => e.stopPropagation()}>
                                        <input
                                            type="text"
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                            className="flex-1 px-2 text-sm border border-input rounded bg-background text-foreground h-7"
                                            autoFocus
                                            onKeyPress={(e) => {
                                                if (e.key === 'Enter') handleUpdate(room.id)
                                            }}
                                        />
                                        <button
                                            onClick={() => handleUpdate(room.id)}
                                            className="p-1 hover:bg-white/20 rounded"
                                        >
                                            <Check size={16} />
                                        </button>
                                        <button
                                            onClick={() => setEditingId(null)}
                                            className="p-1 hover:bg-white/20 rounded"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium truncate">{room.name}</p>
                                        </div>
                                        <div
                                            className="hidden group-hover:flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    startEdit(room.id, room.name)
                                                }}
                                                className="p-1 hover:bg-white/20 rounded"
                                                title={t('folder.rename')}
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    if (
                                                        confirm(
                                                            t('dataroom.deleteConfirm', { name: room.name })
                                                        )
                                                    ) {
                                                        onDeleteDataRoom(room.id)
                                                    }
                                                }}
                                                className="p-1 hover:bg-destructive/20 text-destructive rounded"
                                                title={t('folder.delete')}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
