import { Request } from "express";
import { v4 as uuidv4 } from "uuid";
import { getBufferMetadata } from "../../utils/files";
import File from "../../models/file";
import LocalFiles from "./Local/crud";
import fs from "fs/promises";
import { createFile, deleteFiles } from "../../controllers/fileController";

/**
 * Save an uploaded file, create a DB record, and return file info.
 */
export async function processFileUpload({
  req,
  metadata,
}: {
  req: Request;
  metadata: any;
}) {
  const { file_id: _file_id, temp_file_id: _temp_file_id } = metadata;
  const file = req.file;

  if (!file) throw new Error("No file uploaded");

  // Save file to user directory
  const {
    filepath,
    bytes: _bytes,
    dimensions,
  } = await LocalFiles.uploadLocalFile({
    req,
    file,
    file_id: _file_id ?? uuidv4(),
  });

  // Create DB record
  const dbFile = await createFile(
    {
      user: (req as any).user?.id,
      file_id: _file_id,
      temp_file_id: _temp_file_id,
      bytes: _bytes,
      filepath,
      filename: file.originalname,
      type: file.mimetype,
      width: dimensions?.width,
      height: dimensions?.height,
      object: "file",
      usage: 1,
      source: "local",
    },
    true
  );

  return dbFile;
}

/**
 * Delete a file by file_id (DB and local).
 */
export async function processFileDelete(file_id: string, userId: string) {
  const file = await File.findOneAndDelete({ file_id, user: userId });
  if (file) {
    await fs.unlink(file.filepath);
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

// Dummy helpers for remote deletion
// async function deleteRemoteFile(file: any, req: Request) {
//   // Implement OpenAI/Azure/Agent deletion here
//   // Example: await openai.beta.assistants.files.del(...)
//   return Promise.resolve();
// }

export async function processDeleteRequest({
  req,
  files,
}: {
  req: Request;
  files: Array<{ file_id: string; source?: string; filepath?: string }>;
}) {
  const resolvedFileIds: string[] = [];
  const promises: Promise<any>[] = [];

  for (const file of files) {
    // const source = file.source ?? FileSources.local;

    // Example: handle remote deletion
    // if (source !== FileSources.local) {
    //   promises.push(deleteRemoteFile(file, req));
    //   resolvedFileIds.push(file.file_id);
    //   continue;
    // }

    // Local file: delete from DB and disk
    const dbFile = await File.findOneAndDelete({
      file_id: file.file_id,
      user: (req as any).user?.id,
    });

    if (dbFile && dbFile.filepath) {
      promises.push(fs.unlink(dbFile.filepath).catch(() => {}));
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
