import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { DataRoom, Folder } from '../types'
import { store } from '../store'
import { FolderView } from './FolderView'

interface DataRoomViewProps {
    dataRoom: DataRoom
}

export function DataRoomView({ dataRoom }: DataRoomViewProps) {
    const { t } = useTranslation()
    const [rootFolder, setRootFolder] = useState<Folder | null>(null)

    useEffect(() => {
        loadRootFolder()
    }, [dataRoom])

    const loadRootFolder = () => {
        const folder = store.getFolderStructure(dataRoom.rootFolderId)
        setRootFolder(folder || null)
    }

    const handleFolderUpdate = () => {
        loadRootFolder()
    }

    if (!rootFolder) {
        return <div className="p-4">{t('dataroom.loading')}</div>
    }

    return (
        <div className="flex flex-col h-full">
            <div className="p-4 border-b border-border">
                <h2 className="text-2xl font-semibold">{dataRoom.name}</h2>
                <p className="text-sm text-muted-foreground">
                    {t('dataroom.created')} {new Date(dataRoom.createdAt).toLocaleDateString()}
                </p>
            </div>
            <div className="flex-1 overflow-auto">
                <FolderView
                    folder={rootFolder}
                    onUpdate={handleFolderUpdate}
                />
            </div>
        </div>
    )
}
