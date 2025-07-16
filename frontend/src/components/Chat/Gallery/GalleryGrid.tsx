import React from "react";
import GalleryItem from "@/components/Chat/Gallery/GalleryItem";
import type { ExtendedFile } from "@/common/types";

const FileGalleryGrid: React.FC<{ files: ExtendedFile[] }> = ({ files }) => (
  <div className="grid grid-cols-2 grid-rows-2 gap-2 w-full aspect-square">
    {files.slice(0, 4).map((file, idx) => (
      <GalleryItem key={file.file_id || idx} file={file} />
    ))}
    {files.length > 4 && (
      <div className="flex items-center text-white justify-center bg-black/70 rounded-lg">
        +{files.length - 4} more
      </div>
    )}
  </div>
);

export default FileGalleryGrid;
