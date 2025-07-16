import React from "react";
import GalleryItem from "@/components/Chat/Gallery/GalleryItem";
import type { ExtendedFile } from "@/common/types";

const FileGalleryTriple: React.FC<{ files: ExtendedFile[] }> = ({ files }) => (
  <div className="grid grid-cols-3 gap-1 aspect-[3/2] w-full overflow-hidden">
    <GalleryItem file={files[0]} />
    <GalleryItem file={files[1]} />
    <GalleryItem file={files[2]} />
  </div>
);

export default FileGalleryTriple;
