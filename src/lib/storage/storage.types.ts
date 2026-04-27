export type FileVisibility = 'public' | 'private';

export const MAX_UPLOAD_FILE_SIZE_BYTES = 8 * 1024 * 1024;

export type UploadFileInput = {
  buffer: Buffer;
  originalName: string;
  mimeType: string;
  size: number;
  visibility: FileVisibility;
  uploadedById?: string;
  folder?: string;
};

export type UploadedFileResult = {
  storageDriver: 'local' | 's3';
  bucket?: string;
  fileKey: string;
  originalName: string;
  mimeType: string;
  size: number;
  visibility: FileVisibility;
  uploadedById?: string;
};

export type DeleteFileInput =
  | string
  | {
      fileKey: string;
      bucket?: string;
    };

export type PublicFileReference = {
  fileKey: string;
  bucket?: string;
  visibility: 'public';
};

export type PrivateFileReference = {
  fileKey: string;
  bucket?: string;
  visibility: 'private';
};

export type StoredFileReference = PublicFileReference | PrivateFileReference;

export interface StorageService {
  uploadFile(input: UploadFileInput): Promise<UploadedFileResult>;
  deleteFile(input: DeleteFileInput): Promise<void>;
  getPublicUrl(input: PublicFileReference): string;
}
