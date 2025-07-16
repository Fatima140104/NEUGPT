import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import path from "path";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

function buildCloudinaryResponse(result: any, mimetype?: string) {
  let category: "image" | "video" | "raw" = "raw";
  if (result.resource_type === "image") category = "image";
  else if (result.resource_type === "video") category = "video";
  const downloadUrl = category === "raw" ? result.secure_url : undefined;
  return {
    url: result.secure_url,
    public_id: result.public_id,
    bytes: result.bytes,
    type: category,
    mimetype: mimetype || result.mimetype || "application/octet-stream",
    width: result.width,
    height: result.height,
    format: result.format,
    category,
    downloadUrl,
    original_filename: result.original_filename,
  };
}

// Upload a file from local path (e.g., after multer saves it)
async function uploadCloudinaryFile({
  file,
  file_id,
  folder = "",
}: {
  file: Express.Multer.File;
  file_id: string;
  folder?: string;
}) {
  try {
    const ext = file.originalname ? path.extname(file.originalname) : "";
    let publicId = file_id;
    const isImage = file.mimetype.startsWith("image/");
    const isVideo = file.mimetype.startsWith("video/");
    const resource_type = isImage ? "image" : isVideo ? "video" : "raw";

    if (ext && publicId.endsWith(ext)) {
      publicId = publicId.slice(0, -ext.length);
    }
    if (!isImage && ext && !publicId.endsWith(ext)) {
      publicId = file_id + ext;
    }
    console.log("[uploadCloudinaryFile] Uploading file:", publicId);

    const uploadOptions: any = {
      public_id: publicId,
      folder,
      resource_type,
      use_filename: true,
      unique_filename: false,
      overwrite: true,
    };
    if (isImage) {
      uploadOptions.format = ext ? ext.slice(1) : undefined;
    }
    const result = await cloudinary.uploader.upload(file.path, uploadOptions);

    // Return both Cloudinary URL and local file path for non-image files
    const response = buildCloudinaryResponse(result, file.mimetype) as any;
    if (!isImage) {
      response.local_path = file.path;
    } else {
      // Remove the multer image file after upload
      try {
        require("fs").unlinkSync(file.path);
      } catch (e) {
        console.warn(
          "[uploadCloudinaryFile] Could not remove multer file(image):",
          e
        );
      }
    }
    return response;
  } catch (error) {
    console.error("[uploadCloudinaryFile] Error:", error);
    throw error;
  }
}

// Upload a buffer (e.g., from a remote URL)
async function uploadCloudinaryBuffer({
  buffer,
  fileName,
  folder = "",
  mimetype = undefined,
}: {
  buffer: Buffer;
  fileName: string;
  folder?: string;
  mimetype?: string;
}) {
  try {
    const uploadStr = `data:${
      mimetype || "application/octet-stream"
    };base64,${buffer.toString("base64")}`;
    const result = await cloudinary.uploader.upload(uploadStr, {
      public_id: fileName,
      folder,
      resource_type: "auto",
      use_filename: true,
      unique_filename: false,
      overwrite: true,
    });
    return buildCloudinaryResponse(result, mimetype);
  } catch (error) {
    console.error("[uploadCloudinaryBuffer] Error:", error);
    throw error;
  }
}

// Upload a file from a remote URL
async function uploadFileFromURL({
  URL,
  fileName,
  folder = "",
  mimetype = undefined,
}: {
  URL: string;
  fileName: string;
  folder?: string;
  mimetype?: string;
}) {
  try {
    const result = await cloudinary.uploader.upload(URL, {
      public_id: fileName,
      folder,
      resource_type: "auto",
      use_filename: true,
      unique_filename: false,
      overwrite: true,
    });
    return buildCloudinaryResponse(result, mimetype);
  } catch (error) {
    console.error("[uploadFileFromURL] Error:", error);
    throw error;
  }
}

// Delete a file from Cloudinary
async function deleteCloudinaryFile(
  public_id: string,
  resource_type: "image" | "raw" = "raw"
) {
  try {
    return await cloudinary.uploader.destroy(public_id, {
      resource_type,
    });
  } catch (error) {
    console.error("[deleteCloudinaryFile] Error:", error);
    throw error;
  }
}

// Get a direct URL for a Cloudinary asset
function getCloudinaryFileURL(public_id: string, format?: string) {
  return cloudinary.url(public_id, { format });
}

function extractCloudinaryPublicId(url: string) {
  // Remove query params
  url = url.split("?")[0];
  // Find the part after /upload/ (or /raw/upload/)
  const uploadIdx = url.indexOf("/upload/");
  if (uploadIdx === -1) return url;
  let publicIdWithVersion = url.substring(uploadIdx + 8); // after '/upload/'
  // Remove version if present (e.g., v123456/)
  publicIdWithVersion = publicIdWithVersion.replace(/^v\d+\//, "");

  // Infer resource type from URL
  let resourceType = "raw";
  if (url.includes("/image/")) resourceType = "image";
  else if (url.includes("/video/")) resourceType = "video";

  if (resourceType === "image" || resourceType === "video") {
    // Remove extension for images/videos
    const lastDot = publicIdWithVersion.lastIndexOf(".");
    if (lastDot !== -1) {
      return publicIdWithVersion.substring(0, lastDot);
    }
    return publicIdWithVersion;
  } else {
    // For raw, keep extension
    return publicIdWithVersion;
  }
}
export default {
  uploadCloudinaryFile,
  uploadCloudinaryBuffer,
  uploadFileFromURL,
  deleteCloudinaryFile,
  getCloudinaryFileURL,
  extractCloudinaryPublicId,
};
