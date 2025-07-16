import { Request } from "express";
import { v4 as uuidv4 } from "uuid";
import { getBufferMetadata } from "../../utils/files";
import File from "../../models/file";
import { FileStrategies } from "./strategies";
import fs from "fs/promises";
import { createFile, deleteFiles } from "../../controllers/fileController";
import CloudinaryCrud from "./Cloudinary/crud";
import path from "path";
/**
 * Save an uploaded file, create a DB record, and return file info.
 */
function mapMimeToType(mimetype: string): "image" | "video" | "raw" {
  if (mimetype.startsWith("image/")) return "image";
  if (mimetype.startsWith("video/")) return "video";
  return "raw";
}

export async function processFileUpload({
  req,
  metadata,
  storage = metadata.storage ?? "local",
}: {
  req: Request;
  metadata: any;
  storage?: "local" | "cloudinary";
}) {
  const { file_id: _file_id, temp_file_id: _temp_file_id } = metadata;
  const file = req.file;

  if (!file) throw new Error("No file uploaded");
  const filename = Buffer.from(file.originalname, "latin1").toString("utf8");

  // Use strategy
  const strategy = FileStrategies[storage];
  const uploadResult = await strategy.uploadFile({
    req,
    file,
    file_id: _file_id ?? uuidv4(),
  });

  // Normalize output fields
  const {
    filepath = uploadResult.filepath || uploadResult.url,
    url = uploadResult.url || uploadResult.filepath,
    bytes: _bytes,
    dimensions,
    width = dimensions?.width || uploadResult.width,
    height = dimensions?.height || uploadResult.height,
    public_id = uploadResult.public_id,
    mimetype = file.mimetype,
    local_path = uploadResult.local_path,
  } = uploadResult;

  const type = mapMimeToType(mimetype);

  // Create DB record (remove 'format', 'url')
  const dbFile = await createFile(
    {
      user: (req as any).user?.id,
      file_id: _file_id || public_id,
      temp_file_id: _temp_file_id,
      bytes: _bytes,
      filepath: filepath,
      local_path: local_path,
      filename: filename,
      type, // platform category
      mimetype, // always the MIME type
      width,
      height,
      object: "file",
      usage: 1,
      source: storage,
    },
    true
  );

  return dbFile;
}

/**
 * Delete a file by file_id (DB and local).
 */
export async function processFileDelete(
  file_id: string,
  userId: string,
  storage: "local" | "cloudinary" = "local",
  req?: Request
) {
  const file = await File.findOneAndDelete({ file_id, user: userId });
  if (file) {
    const strategy = FileStrategies[storage];
    await strategy.deleteFile(file.filepath, req);
  }
  return file;
}

/**
 * Increment file usage.
 */
export async function updateFileUsage(file_id: string) {
  return await File.findOneAndUpdate(
    { file_id },
    { $inc: { usage: 1 } },
    { new: true }
  );
}

// Helpers for remote deletion
async function deleteRemoteFile(file: any, req: Request) {
  // file.filepath is usually the Cloudinary public_id
  try {
    if (file.source === "cloudinary" && file.filepath) {
      // Determine resource type: prefer file.type/category, fallback to 'raw'
      let resource_type: "raw" | "image" = "raw";
      if (file.type === "image") resource_type = "image";
      let public_id = CloudinaryCrud.extractCloudinaryPublicId(file.filepath);
      console.log("[deleteRemoteFile] Deleting from Cloudinary:", public_id);
      const res = await CloudinaryCrud.deleteCloudinaryFile(
        public_id,
        resource_type
      );
      console.log("[deleteRemoteFile] Cloudinary delete result:", res);
    }
    // Add more remote providers here if needed
    return true;
  } catch (err) {
    console.error("[deleteRemoteFile] Cloudinary delete error:", err);
    return false;
  }
}

export async function processDeleteRequest({
  req,
  files,
}: {
  req: Request;
  files: Array<{
    file_id: string;
    source?: string;
    filepath?: string;
    type?: string;
  }>;
}) {
  const resolvedFileIds: string[] = [];
  const promises: Promise<any>[] = [];

  for (const file of files) {
    const source = file.source ?? "local";
    // handle remote deletion
    if (source !== "local") {
      promises.push(deleteRemoteFile(file, req));
      resolvedFileIds.push(file.file_id);
      continue;
    }

    // Local file: delete from DB and disk
    const dbFile = await File.findOneAndDelete({
      file_id: file.file_id,
      user: (req as any).user?.id,
    });

    if (dbFile && dbFile.filepath) {
      const storage = dbFile.source === "cloudinary" ? "cloudinary" : "local";
      const strategy = FileStrategies[storage];
      promises.push(strategy.deleteFile(dbFile.filepath, req).catch(() => {}));
      resolvedFileIds.push(file.file_id);
    }
  }

  await Promise.allSettled(promises);

  // Clean up any remaining DB records (if not already deleted)
  if (resolvedFileIds.length > 0) {
    await deleteFiles(resolvedFileIds, (req as any).user?.id);
  }
  return resolvedFileIds;
}
