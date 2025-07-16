import debounce from "lodash/debounce";
import { FileSources, EToolResources } from "@/common/types";
import { useCallback, useState, useEffect } from "react";
import type { UseMutateAsyncFunction } from "@tanstack/react-query";
import type {
  DeleteFilesBody,
  DeleteFilesResponse,
  ExtendedFile,
  GenericSetter,
  BatchFile,
  TFile,
} from "@/common/types";
import useSetFilesToDelete from "@/hooks/File/useSetFilesToDelete";

type FileMapSetter = GenericSetter<Map<string, ExtendedFile>>;

export function removeNullishValues<T extends Record<string, unknown>>(
  obj: T,
  removeEmptyStrings?: boolean
): Partial<T> {
  const newObj: Partial<T> = { ...obj };

  (Object.keys(newObj) as Array<keyof T>).forEach((key) => {
    const value = newObj[key];
    if (value === undefined || value === null) {
      delete newObj[key];
    }
    if (removeEmptyStrings && typeof value === "string" && value === "") {
      delete newObj[key];
    }
  });

  return newObj;
}

const useFileDeletion = ({
  mutateAsync,
  tool_resource,
}: {
  mutateAsync: UseMutateAsyncFunction<
    DeleteFilesResponse,
    unknown,
    DeleteFilesBody,
    unknown
  >;
  tool_resource?: EToolResources;
}) => {
  const [_batch, setFileDeleteBatch] = useState<BatchFile[]>([]);
  const setFilesToDelete = useSetFilesToDelete();

  const executeBatchDelete = useCallback(
    ({
      filesToDelete,
      tool_resource,
    }: {
      filesToDelete: BatchFile[];
      tool_resource?: EToolResources;
    }) => {
      const payload = removeNullishValues({
        tool_resource,
      });
      mutateAsync({ files: filesToDelete, ...payload });
      setFileDeleteBatch([]);
    },
    [mutateAsync]
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedDelete = useCallback(debounce(executeBatchDelete, 1000), []);

  useEffect(() => {
    // Cleanup function for debouncedDelete when component unmounts or before re-render
    return () => debouncedDelete.cancel();
  }, [debouncedDelete]);

  const deleteFile = useCallback(
    ({
      file: _file,
      setFiles,
    }: {
      file: ExtendedFile | TFile;
      setFiles?: FileMapSetter;
    }) => {
      const {
        file_id,
        temp_file_id = "",
        filepath = "",
        source = FileSources.cloudinary,
        embedded,
        attached = false,
        type,
      } = _file as TFile & { attached?: boolean };

      const progress = (_file as ExtendedFile)?.progress ?? 1;

      if (progress < 1) {
        return;
      }
      const file: BatchFile = {
        file_id,
        embedded,
        filepath,
        source,
        type,
      };

      if (setFiles) {
        setFiles((currentFiles) => {
          const updatedFiles = new Map(currentFiles);
          updatedFiles.delete(file_id);
          updatedFiles.delete(temp_file_id);
          const files = Object.fromEntries(updatedFiles);
          setFilesToDelete(files);
          return updatedFiles;
        });
      }

      if (attached) {
        return;
      }

      setFileDeleteBatch((prevBatch) => {
        const newBatch = [...prevBatch, file];
        debouncedDelete({
          filesToDelete: newBatch,
          tool_resource,
        });
        return newBatch;
      });
    },
    [debouncedDelete, setFilesToDelete, tool_resource]
  );

  return { deleteFile };
};

export default useFileDeletion;
