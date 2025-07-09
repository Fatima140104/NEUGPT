import fs from "fs";
import path from "path";
import axios from "axios";
import { Request } from "express";
import { getBufferMetadata } from "../../../utils/files";
import paths from "../../../config/paths";

/**
 * Saves a file to a specified output path with a new filename.
 *
 * @param {Express.Multer.File} file - The file object to be saved. Should contain properties like 'originalname' and 'path'.
 * @param {string} outputPath - The path where the file should be saved.
 * @param {string} outputFilename - The new filename for the saved file (without extension).
 * @returns {Promise<string>} The full path of the saved file.
 * @throws Will throw an error if the file saving process fails.
 */
async function saveLocalFile(
  file: Express.Multer.File,
  outputPath: string,
  outputFilename: string
) {
  try {
    if (!fs.existsSync(outputPath)) {
      fs.mkdirSync(outputPath, { recursive: true });
    }

    const fileExtension = path.extname(file.originalname);
    const filenameWithExt = outputFilename + fileExtension;
    const outputFilePath = path.join(outputPath, filenameWithExt);
    fs.copyFileSync(file.path, outputFilePath);
    fs.unlinkSync(file.path);

    return outputFilePath;
  } catch (error) {
    console.error("[saveFile] Error while saving the file:", error);
    throw error;
  }
}

/**
 * Saves an uploaded image file to a specified directory based on the user's ID and a filename.
 *
 * @param {Express.Request} req - The Express request object, containing the user's information and app configuration.
 * @param {Express.Multer.File} file - The uploaded file object.
 * @param {string} filename - The new filename to assign to the saved image (without extension).
 * @returns {Promise<void>}
 * @throws Will throw an error if the image saving process fails.
 */
const saveLocalImage = async (
  req: Request,
  file: Express.Multer.File,
  filename: string
) => {
  const imagePath = req.app.locals.paths.imageOutput;
  const outputPath = path.join(imagePath, (req as any).user?.id ?? "");
  await saveLocalFile(file, outputPath, filename);
};

/**
 * Saves a buffer to a specified directory on the local file system.
 *
 * @param {Object} params - The parameters object.
 * @param {string} params.userId - The user's unique identifier. This is used to create a user-specific directory.
 * @param {Buffer} params.buffer - The buffer to be saved.
 * @param {string} params.fileName - The name of the file to be saved.
 * @param {string} [params.basePath='images'] - Optional. The base path where the file will be stored.
 *                                          Defaults to 'images' if not specified.
 * @returns {Promise<string>} - A promise that resolves to the path of the saved file.
 */
async function saveLocalBuffer({
  userId,
  buffer,
  fileName,
  basePath = "images",
}: {
  userId: string;
  buffer: Buffer;
  fileName: string;
  basePath?: string;
}) {
  try {
    const { publicPath, uploads } = paths;

    const directoryPath = path.join(
      basePath === "images" ? publicPath : uploads,
      basePath,
      userId
    );

    if (!fs.existsSync(directoryPath)) {
      fs.mkdirSync(directoryPath, { recursive: true });
    }

    fs.writeFileSync(path.join(directoryPath, fileName), buffer);

    const filePath = path.posix.join("/", basePath, userId, fileName);

    return filePath;
  } catch (error) {
    console.error("[saveLocalBuffer] Error while saving the buffer:", error);
    throw error;
  }
}

/**
 * Saves a file from a given URL to a local directory. The function fetches the file using the provided URL,
 * determines the content type, and saves it to a specified local directory with the correct file extension.
 * If the specified directory does not exist, it is created. The function returns the name of the saved file
 * or null in case of an error.
 *
 * @param {Object} params - The parameters object.
 * @param {string} params.userId - The user's unique identifier. This is used to create a user-specific path
 *                                 in the local file system.
 * @param {string} params.URL - The URL of the file to be downloaded and saved.
 * @param {string} params.fileName - The desired file name for the saved file. This may be modified to include
 *                                   the correct file extension based on the content type.
 * @param {string} [params.basePath='images'] - Optional. The base directory where the file will be saved.
 *                                              Defaults to 'images' if not specified.
 *
 * @returns {Promise<{ bytes: number, type: string, dimensions: Record<string, number>} | null>}
 *          A promise that resolves to the file metadata if the file is successfully saved, or null if there is an error.
 */
async function saveFileFromURL({
  userId,
  URL,
  fileName,
  basePath = "images",
}: {
  userId: string;
  URL: string;
  fileName: string;
  basePath?: string;
}) {
  try {
    const response = await axios({
      url: URL,
      responseType: "arraybuffer",
    });

    const buffer = Buffer.from(response.data, "binary");
    const {
      bytes,
      type: detectedMimeType,
      dimensions,
      extension,
    } = await getBufferMetadata(buffer);

    // Construct the outputPath based on the basePath and userId
    const outputPath = path.join(paths.publicPath, basePath, userId.toString());

    // Check if the output directory exists, if not, create it
    if (!fs.existsSync(outputPath)) {
      fs.mkdirSync(outputPath, { recursive: true });
    }

    // Replace or append the correct extension
    const extRegExp = new RegExp(path.extname(fileName) + "$");
    fileName = fileName.replace(extRegExp, `.${extension}`);
    if (!path.extname(fileName)) {
      fileName += `.${extension}`;
    }

    // Save the file to the output path
    const outputFilePath = path.join(outputPath, fileName);
    fs.writeFileSync(outputFilePath, buffer);

    return {
      bytes,
      type:
        detectedMimeType && detectedMimeType.startsWith("image/")
          ? "image"
          : detectedMimeType && detectedMimeType.startsWith("video/")
          ? "video"
          : "raw",
      mimetype: detectedMimeType,
      dimensions,
    };
  } catch (error) {
    console.error("[saveFileFromURL] Error while saving the file:", error);
    return null;
  }
}

/**
 * Deletes a file from the filesystem by its relative path.
 *
 * @param {string} id - The relative file path (e.g., "/uploads/userid/filename.ext" or "/images/userid/filename.ext").
 * @param {Request} [req] - (Optional) The Express request object for path validation.
 * @returns {Promise<void>}
 */
const deleteLocalFile = async (id: string, req?: Request) => {
  try {
    // Determine base directory
    let baseDir: string;
    let absPath: string;

    if (id.startsWith("/uploads/")) {
      baseDir = req?.app?.locals?.paths?.uploads || paths.uploads;
      absPath = path.join(baseDir, id.replace("/uploads/", ""));
    } else if (id.startsWith("/images/")) {
      baseDir = req?.app?.locals?.paths?.imageOutput || paths.publicPath;
      absPath = path.join(baseDir, id.replace("/images/", ""));
    } else {
      // fallback: treat as relative to uploads
      baseDir = req?.app?.locals?.paths?.uploads || paths.uploads;
      absPath = path.join(baseDir, id);
    }

    // Security: ensure absPath is within baseDir
    const rel = path.relative(baseDir, absPath);
    if (
      rel.startsWith("..") ||
      path.isAbsolute(rel) ||
      rel.includes(`..${path.sep}`)
    ) {
      throw new Error(`Invalid file path: ${id}`);
    }

    await unlinkFile(absPath);
  } catch (error) {
    console.error("Error deleting file:", error);
    throw error;
  }
};

/**
 * Returns a public URL for a local file.
 *
 * @param {string} id - The relative file path (e.g., "/uploads/userid/filename.ext" or "/images/userid/filename.ext").
 * @param {string} [format] - (Optional) File format/extension (not used for local).
 * @returns {string} - The public URL path.
 */
function getLocalFileURL(id: string, format?: string) {
  // For local, just return the id as the public URL path
  return id;
}

/**
 * Validates if a given filepath is within a specified subdirectory under a base path. This function constructs
 * the expected base path using the base, subfolder, and user id from the request, and then checks if the
 * provided filepath starts with this constructed base path.
 *
 * @param {Express.Request} req - The request object from Express. It should contain a `user` property with an `id`.
 * @param {string} base - The base directory path.
 * @param {string} subfolder - The subdirectory under the base path.
 * @param {string} filepath - The complete file path to be validated.
 *
 * @returns {boolean}
 *          Returns true if the filepath is within the specified base and subfolder, false otherwise.
 */
const isValidPath = (
  req: Request,
  base: string,
  subfolder: string,
  filepath: string
) => {
  const normalizedBase = path.resolve(
    base,
    subfolder,
    (req as any).user?.id ?? ""
  );
  const normalizedFilepath = path.resolve(filepath);
  return normalizedFilepath.startsWith(normalizedBase);
};

/**
 * @param {string} filepath
 */
const unlinkFile = async (filepath: string) => {
  try {
    await fs.promises.unlink(filepath);
  } catch (error) {
    console.error("Error deleting file:", error);
  }
};

/**
 * Deletes a file from the filesystem. This function takes a file object, constructs the full path, and
 * verifies the path's validity before deleting the file. If the path is invalid, an error is thrown.
 *
 * @param {Express.Request} req - The request object from Express. It should have an `app.locals.paths` object with
 *                       a `publicPath` property.
 * @param {MongoFile} file - The file object to be deleted. It should have a `filepath` property that is
 *                           a string representing the path of the file relative to the publicPath.
 *
 * @returns {Promise<void>}
 *          A promise that resolves when the file has been successfully deleted, or throws an error if the
 *          file path is invalid or if there is an error in deletion.
 */
const deleteLocalFileOld = async ({
  req,
  file,
}: {
  req: Request;
  file: Express.Multer.File;
}) => {
  const { publicPath, uploads } = req.app.locals.paths;

  /** Filepath stripped of query parameters (e.g., ?manual=true) */
  const cleanFilepath = file.path.split("?")[0];

  if (cleanFilepath.startsWith(`/uploads/${(req as any).user?.id}`)) {
    const userUploadDir = path.join(uploads, (req as any).user?.id ?? "");
    const basePath = cleanFilepath.split(
      `/uploads/${(req as any).user?.id}/`
    )[1];

    if (!basePath) {
      throw new Error(`Invalid file path: ${cleanFilepath}`);
    }

    const filepath = path.join(userUploadDir, basePath);

    const rel = path.relative(userUploadDir, filepath);
    if (
      rel.startsWith("..") ||
      path.isAbsolute(rel) ||
      rel.includes(`..${path.sep}`)
    ) {
      throw new Error(`Invalid file path: ${cleanFilepath}`);
    }

    await unlinkFile(filepath);
    return;
  }

  const parts = cleanFilepath.split(path.sep);
  const subfolder = parts[1];

  const filepath = path.join(publicPath, cleanFilepath);

  if (!isValidPath(req, publicPath, subfolder, filepath)) {
    throw new Error("Invalid file path");
  }

  await unlinkFile(filepath);
};

/**
 * Uploads a file to the specified upload directory.
 *
 * @param {Object} params - The params object.
 * @param {ServerRequest} params.req - The request object from Express. It should have a `user` property with an `id`
 *                       representing the user, and an `app.locals.paths` object with an `uploads` path.
 * @param {Express.Multer.File} params.file - The file object, which is part of the request. The file object should
 *                                     have a `path` property that points to the location of the uploaded file.
 * @param {string} params.file_id - The file ID.
 *
 * @returns {Promise<{ filepath: string, bytes: number }>}
 *          A promise that resolves to an object containing:
 *            - filepath: The path where the file is saved.
 *            - bytes: The size of the file in bytes.
 */
async function uploadLocalFile({
  req,
  file,
  file_id,
}: {
  req: Request;
  file: Express.Multer.File;
  file_id: string;
}) {
  const inputFilePath = file.path;
  const inputBuffer = await fs.promises.readFile(inputFilePath);
  const bytes = inputBuffer.length;

  const { dimensions, extension } = await getBufferMetadata(inputBuffer);

  const { uploads } = req.app.locals.paths;
  const userPath = path.join(uploads, (req as any).user?.id ?? "");

  if (!fs.existsSync(userPath)) {
    fs.mkdirSync(userPath, { recursive: true });
  }

  const fileName = `${file_id}__${path.basename(inputFilePath)}.${extension}`;
  const newPath = path.join(userPath, fileName);

  await fs.promises.writeFile(newPath, inputBuffer);
  const filepath = path.posix.join(
    "/",
    "uploads",
    (req as any).user?.id ?? "",
    path.basename(newPath)
  );

  await unlinkFile(inputFilePath);
  return { filepath, bytes, dimensions };
}

/**
 * Retrieves a readable stream for a file from local storage.
 *
 * @param {ServerRequest} req - The request object from Express
 * @param {string} filepath - The filepath.
 * @returns {ReadableStream} A readable stream of the file.
 */
function getLocalFileStream(req: Request, filepath: string) {
  try {
    if (filepath.includes("/uploads/")) {
      const basePath = filepath.split("/uploads/")[1];

      if (!basePath) {
        console.warn(`Invalid base path: ${filepath}`);
        throw new Error(`Invalid file path: ${filepath}`);
      }

      const fullPath = path.join(req.app.locals.paths.uploads, basePath);
      const uploadsDir = req.app.locals.paths.uploads;

      const rel = path.relative(uploadsDir, fullPath);
      if (
        rel.startsWith("..") ||
        path.isAbsolute(rel) ||
        rel.includes(`..${path.sep}`)
      ) {
        console.warn(`Invalid relative file path: ${filepath}`);
        throw new Error(`Invalid file path: ${filepath}`);
      }

      return fs.createReadStream(fullPath);
    } else if (filepath.includes("/images/")) {
      const basePath = filepath.split("/images/")[1];

      if (!basePath) {
        console.warn(`Invalid base path: ${filepath}`);
        throw new Error(`Invalid file path: ${filepath}`);
      }

      const fullPath = path.join(req.app.locals.paths.imageOutput, basePath);
      const publicDir = req.app.locals.paths.imageOutput;

      const rel = path.relative(publicDir, fullPath);
      if (
        rel.startsWith("..") ||
        path.isAbsolute(rel) ||
        rel.includes(`..${path.sep}`)
      ) {
        console.warn(`Invalid relative file path: ${filepath}`);
        throw new Error(`Invalid file path: ${filepath}`);
      }

      return fs.createReadStream(fullPath);
    }
    return fs.createReadStream(filepath);
  } catch (error) {
    console.error("Error getting local file stream:", error);
    throw error;
  }
}

export default {
  saveLocalFile,
  saveLocalImage,
  saveLocalBuffer,
  saveFileFromURL,
  getLocalFileURL,
  deleteLocalFile,
  uploadLocalFile,
  getLocalFileStream,
};
