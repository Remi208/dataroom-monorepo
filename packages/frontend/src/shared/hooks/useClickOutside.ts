/**
 * useClickOutside - Detect clicks outside an element
 */
import { useEffect, useRef } from 'react'

export const useClickOutside = (callback: () => void): React.RefObject<HTMLDivElement> => {
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                callback()
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [callback])

    return ref
}
