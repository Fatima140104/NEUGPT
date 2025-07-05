import React from "react";
import GalleryItem from "@/components/Chat/Gallery/GalleryItem";
import type { ExtendedFile } from "@/common/types";

const FileGalleryDouble: React.FC<{ files: ExtendedFile[] }> = ({ files }) => (
  <div className="grid grid-cols-2 gap-1 max-w-[260px] max-h-[110px] aspect-[2/1] overflow-hidden">
    {files.map((file, idx) => (
      <GalleryItem key={file.file_id || idx} file={file} />
    ))}
  </div>
);

export default FileGalleryDouble;
