/**
 * URL parameter utilities
 */

export const getURLParams = (): URLSearchParams => {
    return new URLSearchParams(window.location.search)
}

export const getURLParam = (key: string): string | null => {
    return getURLParams().get(key)
}

export const setURLParams = (params: Record<string, string | null>): void => {
    const searchParams = new URLSearchParams()

    Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
            searchParams.set(key, value)
        }
    })

    const newUrl = searchParams.toString() ? `?${searchParams.toString()}` : window.location.pathname
    window.history.replaceState(null, '', newUrl)
}

export const appendURLParam = (key: string, value: string): void => {
    const params = getURLParams()
    params.set(key, value)
    const newUrl = params.toString() ? `?${params.toString()}` : window.location.pathname
    window.history.replaceState(null, '', newUrl)
}

export const removeURLParam = (key: string): void => {
    const params = getURLParams()
    params.delete(key)
    const newUrl = params.toString() ? `?${params.toString()}` : window.location.pathname
    window.history.replaceState(null, '', newUrl)
}

export const clearURLParams = (): void => {
    window.history.replaceState(null, '', window.location.pathname)
}
