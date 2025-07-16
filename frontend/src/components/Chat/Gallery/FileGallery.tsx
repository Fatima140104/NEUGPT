import React from "react";
import FileGallerySingle from "@/components/Chat/Gallery/GallerySingle";
import FileGalleryDouble from "@/components/Chat/Gallery/GalleryDouble";
import FileGalleryTriple from "@/components/Chat/Gallery/GalleryTriple";
import FileGalleryGrid from "@/components/Chat/Gallery/GalleryGrid";
import type { ExtendedFile } from "@/common/types";

interface FileGalleryProps {
  files: ExtendedFile[];
}

const FileGallery: React.FC<FileGalleryProps> = ({ files }) => {
  if (files.length === 0) return null;
  if (files.length === 1) return <FileGallerySingle file={files[0]} />;
  if (files.length === 2) return <FileGalleryDouble files={files} />;
  if (files.length === 3) return <FileGalleryTriple files={files} />;
  return <FileGalleryGrid files={files} />;
};

export default FileGallery;
