import { useEffect, useMemo } from "react";
import { EToolResources } from "@/common/types";
import type { ExtendedFile } from "@/common/types";
import { useDeleteFilesMutation } from "@/providers/mutations";
import useFileDeletion from "@/hooks/File/useFileDeletion";
import FileContainer from "@/components/Chat/Files/FileContainer";
import Image from "@/components/Chat/Files/Image";

export default function FileRow({
  files: _files,
  setFiles,
  abortUpload,
  setFilesLoading,
  tool_resource,
  fileFilter,
  isRTL = false,
  Wrapper,
}: {
  files: Map<string, ExtendedFile> | undefined;
  abortUpload?: () => void;
  setFiles: React.Dispatch<React.SetStateAction<Map<string, ExtendedFile>>>;
  setFilesLoading: React.Dispatch<React.SetStateAction<boolean>>;
  fileFilter?: (file: ExtendedFile) => boolean;
  tool_resource?: EToolResources;
  isRTL?: boolean;
  Wrapper?: React.FC<{ children: React.ReactNode }>;
}) {
  const files = useMemo(
    () =>
      Array.from(_files?.values() ?? []).filter((file) =>
        fileFilter ? fileFilter(file) : true
      ),
    [_files, fileFilter]
  );

  const { mutateAsync } = useDeleteFilesMutation({
    // onMutate: async () =>
    //   console.log("Deleting files: tool_resource", tool_resource),
    // onSuccess: () => {
    //   console.log("Files deleted");
    // },
    // onError: (error) => {
    //   console.log("Error deleting files:", error);
    // },
  });

  const { deleteFile } = useFileDeletion({
    mutateAsync,
    tool_resource,
  });

  useEffect(() => {
    if (files.length === 0) {
      return;
    }

    if (files.some((file) => file.progress < 1)) {
      return;
    }

    if (files.every((file) => file.progress === 1)) {
      setFilesLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files]);

  if (files.length === 0) {
    return null;
  }

  const renderFiles = () => {
    const rowStyle = isRTL
      ? {
          display: "flex",
          flexDirection: "row-reverse",
          flexWrap: "wrap",
          gap: "4px",
          width: "100%",
          maxWidth: "100%",
        }
      : {
          display: "flex",
          flexWrap: "wrap",
          gap: "4px",
          width: "100%",
          maxWidth: "100%",
        };

    return (
      <div style={rowStyle as React.CSSProperties}>
        {files
          .reduce(
            (acc, current) => {
              if (!acc.map.has(current.file_id)) {
                acc.map.set(current.file_id, true);
                acc.uniqueFiles.push(current);
              }
              return acc;
            },
            { map: new Map(), uniqueFiles: [] as ExtendedFile[] }
          )
          .uniqueFiles.map((file: ExtendedFile, index: number) => {
            const handleDelete = () => {
              if (abortUpload && file.progress < 1) {
                abortUpload();
              }
              deleteFile({ file, setFiles });
            };
            const isImage = file.type?.startsWith("image") ?? false;
            return (
              <div
                key={index}
                style={{
                  flexBasis: "70px",
                  flexGrow: 0,
                  flexShrink: 0,
                }}
              >
                {isImage ? (
                  <Image
                    url={file.preview ?? file.filepath}
                    onDelete={handleDelete}
                    progress={file.progress}
                  />
                ) : (
                  <FileContainer file={file} onDelete={handleDelete} />
                )}
              </div>
            );
          })}
      </div>
    );
  };

  if (Wrapper) {
    return <Wrapper>{renderFiles()}</Wrapper>;
  }

  return renderFiles();
}
