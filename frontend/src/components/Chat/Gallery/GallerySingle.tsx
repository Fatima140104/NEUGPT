import React from "react";
import GalleryItem from "@/components/Chat/Gallery/GalleryItem";
import type { ExtendedFile } from "@/common/types";

const FileGallerySingle: React.FC<{ file: ExtendedFile }> = ({ file }) => (
  <div className="w-full aspect-square overflow-hidden">
    <GalleryItem file={file} />
  </div>
);

export default FileGallerySingle;
