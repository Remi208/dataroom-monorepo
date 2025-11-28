export interface FileMetadata {
    id: string;
    name: string;
    parentFolderId: string | null;
    size: number;
    type: string;
    createdAt: number;
    updatedAt: number;
}

export interface Folder {
    id: string;
    name: string;
    parentFolderId: string | null;
    createdAt: number;
    updatedAt: number;
    children: (Folder | FileMetadata)[];
}

export interface DataRoom {
    id: string;
    name: string;
    createdAt: number;
    updatedAt: number;
    rootFolderId: string;
}

export interface StoreFile extends FileMetadata {
    data: ArrayBuffer | null;
}
