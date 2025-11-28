/**
 * Application-wide constants
 */

export const CONSTANTS = {
    // Folder constraints
    MAX_FOLDER_DEPTH: 5,

    // File constraints
    ALLOWED_FILE_TYPES: ['application/pdf'],
    ALLOWED_FILE_EXTENSIONS: ['.pdf'],
    MAX_FILE_SIZE: 100 * 1024 * 1024, // 100MB

    // Search
    DEBOUNCE_DELAY: 300,
    SEARCH_SUGGESTION_LIMIT: 10,
    RECENT_SEARCHES_LIMIT: 5,

    // UI
    MODAL_Z_INDEX: 50,
    TOAST_DURATION: 3000,

    // Storage keys
    STORAGE_KEYS: {
        SELECTED_DATA_ROOM: 'selectedDataRoomId',
        SEARCH_HISTORY: 'searchHistory',
        FILTERS: 'searchFilters',
    },

    // URL parameters
    URL_PARAMS: {
        SEARCH: 'search',
        SEARCH_IN_CONTENT: 'searchInContent',
        SEARCH_IN_NAMES: 'searchInNames',
        DATA_ROOM: 'dataRoom',
    },

    // Error messages
    ERRORS: {
        MAX_NESTING_DEPTH: 'messages.maxNestingDepth',
        FILE_TYPE_NOT_SUPPORTED: 'file.invalidFileFormat',
        CANNOT_MOVE_FOLDER_DEPTH: 'messages.cannotMoveFolderDepth',
        CONFIRM_DELETE: 'messages.confirmDelete',
    },

    // Drag & drop
    DRAG_MIME_TYPE: 'application/json',
} as const
