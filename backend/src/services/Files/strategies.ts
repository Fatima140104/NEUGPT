import localCrud from "./Local/crud";
import cloudinaryCrud from "./Cloudinary/crud";
import { Readable } from "node:stream";

export type FileHandlerStrategy = {
  uploadFile: (args: any) => Promise<any>;
  uploadBuffer: (args: any) => Promise<any>;
  uploadFromURL: (args: any) => Promise<any>;
  deleteFile: (id: string, ...args: any[]) => Promise<any>;
  getFileURL: (id: string, format?: string) => string;
};

export const LocalFileStrategy: FileHandlerStrategy = {
  uploadFile: localCrud.uploadLocalFile,
  uploadBuffer: localCrud.saveLocalBuffer,
  uploadFromURL: localCrud.saveFileFromURL,
  deleteFile: localCrud.deleteLocalFile,
  getFileURL: localCrud.getLocalFileURL,
};

export const CloudinaryFileStrategy: FileHandlerStrategy = {
  uploadFile: cloudinaryCrud.uploadCloudinaryFile,
  uploadBuffer: cloudinaryCrud.uploadCloudinaryBuffer,
  uploadFromURL: cloudinaryCrud.uploadFileFromURL,
  deleteFile: cloudinaryCrud.deleteCloudinaryFile,
  getFileURL: cloudinaryCrud.getCloudinaryFileURL,
};

export const FileStrategies = {
  local: LocalFileStrategy,
  cloudinary: CloudinaryFileStrategy,
};
