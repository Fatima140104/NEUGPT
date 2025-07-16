import React, { useState } from "react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import type { ExtendedFile } from "@/common/types";
import { motion } from "framer-motion";

interface FileGalleryItemProps {
  file: ExtendedFile;
}

const FileGalleryItem: React.FC<FileGalleryItemProps> = ({ file }) => {
  const [loaded, setLoaded] = useState(false);
  if (file.progress < 1) {
    return (
      <div className="relative flex items-center justify-center bg-gray-200 rounded">
        <LoadingSpinner />
      </div>
    );
  }
  if (file.type?.startsWith("image")) {
    const source = file.source || "local";
    let url = file.filepath || "";
    // Path to the file on the server
    // (file.filepath: 'uploads/<userid>/<file_name>.ext')
    if (source === "local") {
      url = file.filepath?.startsWith("/api/uploads")
        ? file.filepath.replace("/api/uploads", "")
        : `/api${file.filepath}`;
    }
    return (
      <div className="relative w-full h-full squircle">
        {/* Skeleton Loader */}
        {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse z-10">
            {/* You can use your own Skeleton component here */}
            <div className="w-full h-full bg-gray-300 dark:bg-gray-600 rounded-lg" />
          </div>
        )}
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full h-full"
          title={`Download ${file.filename}`}
        >
          {/* Animated Image with Lazy Loading */}
          <motion.img
            src={url}
            alt={file.filename}
            className={`object-cover w-full h-full rounded-lg transition-opacity duration-300 ${
              loaded ? "opacity-100" : "opacity-0"
            }`}
            loading="lazy"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={
              loaded ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }
            }
            transition={{ duration: 0.4, ease: "easeOut" }}
            onLoad={() => setLoaded(true)}
          />
        </a>
      </div>
    );
  }
  // fallback for non-image files
  return <div className="p-4">{file.filename}</div>;
};

export default FileGalleryItem;
