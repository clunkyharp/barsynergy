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

export interface StorageService {
  uploadFile(input: UploadFileInput): Promise<UploadedFileResult>;
  deleteFile(fileKey: string): Promise<void>;
  getPublicUrl(fileKey: string): string;
}
