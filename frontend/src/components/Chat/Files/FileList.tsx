// frontend/src/components/Chat/Files/FileList.tsx
import React from "react";
import type { ExtendedFile } from "@/common/types";
import FileContainer from "./FileContainer";

const FileList: React.FC<{ files: ExtendedFile[] }> = ({ files }) => (
  <div className="flex flex-col gap-2">
    {files.map((file, idx) => (
      <FileContainer
        key={file.file_id || idx}
        buttonClassName="w-full"
        file={file}
      />
    ))}
  </div>
);

export default FileList;
