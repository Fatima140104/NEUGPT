import sharp from "sharp";

/**
 * Determines the file type of a buffer
 * @param {Buffer} dataBuffer
 * @param {boolean} [returnFileType=false] - Optional. If true, returns the file type instead of the file extension.
 * @returns {Promise<string|null|import('file-type').FileTypeResult>} - Returns the file extension if found, else null
 * */
const determineFileType = async (
  dataBuffer: Buffer,
  returnFileType: boolean
) => {
  const fileType = require("file-type");
  const type = await fileType.fromBuffer(dataBuffer);
  if (returnFileType) {
    return type;
  }
  return type ? type.ext : null; // Returns extension if found, else null
};

/**
 * Get buffer metadata
 * @param {Buffer} buffer
 * @returns {Promise<{ bytes: number, type: string, dimensions: Record<string, number>, extension: string}>}
 */
const getBufferMetadata = async (buffer: Buffer) => {
  const fileType = await determineFileType(buffer, true);
  const bytes = buffer.length;
  let extension =
    typeof fileType === "object" && fileType !== null
      ? fileType.ext
      : "unknown";

  /** @type {Record<string, number>} */
  let dimensions = {
    width: 0,
    height: 0,
  };

  if (
    typeof fileType === "object" &&
    fileType !== null &&
    fileType.mime?.startsWith("image/") &&
    extension !== "unknown"
  ) {
    const imageMetadata = await sharp(buffer).metadata();
    dimensions = {
      width: imageMetadata.width,
      height: imageMetadata.height,
    };
  }

  console.log("extension", extension);
  return {
    bytes,
    type:
      typeof fileType === "object" && fileType !== null
        ? fileType.mime
        : "unknown",
    dimensions,
    extension,
  };
};

export { determineFileType, getBufferMetadata };
