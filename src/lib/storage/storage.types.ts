export type FileVisibility = 'public' | 'private';

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

export interface StorageService {
  uploadFile(input: UploadFileInput): Promise<UploadedFileResult>;
  deleteFile(input: DeleteFileInput): Promise<void>;
  getPublicUrl(fileKey: string): string;
}
