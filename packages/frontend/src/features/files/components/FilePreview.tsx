import { useState, useRef, useEffect } from 'react'
import { X } from 'lucide-react'
import { store } from '../../../store'

export interface FilePreviewProps {
    fileId: string
    onClose: () => void
}

export function FilePreview({ fileId, onClose }: FilePreviewProps) {
    const file = store.getFile(fileId)
    const blobUrlRef = useRef<string | null>(null)
    const [isReady, setIsReady] = useState(false)

    // Create blob URL once and cleanup on unmount
    useEffect(() => {
        if (!file || !file.data) {
            setIsReady(false)
            return
        }

        const blob = new Blob([file.data], { type: file.type })
        blobUrlRef.current = URL.createObjectURL(blob)
        setIsReady(true)

        return () => {
            // Cleanup blob URL when component unmounts
            if (blobUrlRef.current) {
                URL.revokeObjectURL(blobUrlRef.current)
                blobUrlRef.current = null
            }
            setIsReady(false)
        }
    }, [file, fileId])

    if (!file || !file.data || !isReady) {
        return null
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
            <div
                className="bg-background rounded-lg shadow-lg w-4/5 h-4/5 flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-4 border-b border-border">
                    <h3 className="font-semibold truncate">{file.name}</h3>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-red-100/20 rounded flex-shrink-0"
                    >
                        <X size={20} />
                    </button>
                </div>
                <div className="flex-1 overflow-auto flex items-center justify-center p-4 bg-muted/20">
                    <iframe
                        src={blobUrlRef.current || ''}
                        className="w-full h-full"
                        title={file.name}
                    />
                </div>
            </div>
        </div>
    )
}
