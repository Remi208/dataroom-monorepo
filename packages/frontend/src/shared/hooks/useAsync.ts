/**
 * useAsync - Handle async operations with loading, error, and data states
 */
import { useState, useEffect, useCallback } from 'react'

interface UseAsyncState<T> {
    data: T | null
    loading: boolean
    error: Error | null
}

export const useAsync = <T,>(
    asyncFunction: () => Promise<T>,
    immediate: boolean = true
): UseAsyncState<T> & { execute: () => Promise<void> } => {
    const [state, setState] = useState<UseAsyncState<T>>({
        data: null,
        loading: immediate,
        error: null,
    })

    const execute = useCallback(async () => {
        setState({ data: null, loading: true, error: null })
        try {
            const response = await asyncFunction()
            setState({ data: response, loading: false, error: null })
        } catch (error) {
            setState({ data: null, loading: false, error: error as Error })
        }
    }, [asyncFunction])

    useEffect(() => {
        if (immediate) {
            execute()
        }
    }, [execute, immediate])

    return { ...state, execute }
}
