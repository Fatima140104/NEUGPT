import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { v4 } from "uuid";
import debounce from "lodash/debounce";
import { fileConfig } from "@/config/fileConfig";
import {
  type ExtendedFile,
  type FileSetter,
  type TError,
  type EndpointFileConfig,
  FileSources,
} from "@/common/types";
import { useUploadFileMutation } from "@/providers/mutations";
import { useDelayedUploadToast } from "@/hooks/File/useDelayedUploadToast";
import { processFileForUpload } from "@/utils/heicConverter";
import { useToastContext } from "@/providers/ToastContext";
import { validateFiles } from "@/utils/files";
// import useClientResize from "@/hooks/File/useClientResize";
import useUpdateFiles from "@/hooks/File/useUpdateFiles";
import type { TFile } from "@/common/types";
import { useChatForm } from "@/providers/ChatFormContext";
import { useAuthFetch } from "../useAuthFetch";

type UseFileHandling = {
  fileSetter?: FileSetter;
  fileFilter?: (file: File) => boolean;
  additionalMetadata?: Record<string, string | undefined>;
  overrideEndpoint?: string;
  overrideEndpointFileConfig?: EndpointFileConfig;
};

const useFileHandling = (params?: UseFileHandling) => {
  const { showToast } = useToastContext();
  const [errors, setErrors] = useState<string[]>([]);
  const abortControllerRef = useRef<AbortController | null>(null);
  const { startUploadTimer, clearUploadTimer } = useDelayedUploadToast();
  const { files, setFiles, setFilesLoading } = useChatForm();
  const setError = (error: string) =>
    setErrors((prevErrors) => [...prevErrors, error]);
  const { addFile, replaceFile, updateFileById, deleteFileById } =
    useUpdateFiles(params?.fileSetter ?? (setFiles as FileSetter));
  // const { resizeImageIfNeeded } = useClientResize();

  const endpoint = useMemo(
    () => params?.overrideEndpoint ?? "default",
    [params?.overrideEndpoint]
  );

  const displayToast = useCallback(() => {
    if (errors.length > 1) {
      const errorList = Array.from(new Set(errors))
        .map((e, i) => `${i > 0 ? "• " : ""}${e}\n`)
        .join("");
      showToast({
        message: errorList,
        status: "error",
        duration: 5000,
      });
    } else if (errors.length === 1) {
      const message = errors[0];
      showToast({
        message,
        status: "error",
        duration: 5000,
      });
    }

    setErrors([]);
  }, [errors, showToast]);

  const debouncedDisplayToast = debounce(displayToast, 250);

  useEffect(() => {
    if (errors.length > 0) {
      debouncedDisplayToast();
    }

    return () => debouncedDisplayToast.cancel();
  }, [errors, debouncedDisplayToast]);

  const uploadFile = useUploadFileMutation(
    {
      onSuccess: (data: TFile) => {
        clearUploadTimer(data.temp_file_id as string);
        updateFileById(data.temp_file_id as string, {
          progress: 0.9,
          filepath: data.filepath,
        });
        setTimeout(() => {
          updateFileById(data.temp_file_id as string, {
            _id: data._id,
            progress: 1,
            file_id: data.file_id,
            temp_file_id: data.temp_file_id,
            filepath: data.filepath,
            type: data.type,
            height: data.height,
            width: data.width,
            filename: data.filename,
            source: data.source,
            embedded: data.embedded,
          });
        }, 300);
      },
      onError: (_error, body) => {
        const error = _error as TError | undefined;
        const file_id = body.get("file_id");
        clearUploadTimer(file_id as string);
        deleteFileById(file_id as string);
        const errorMessage =
          error?.code === "ERR_CANCELED"
            ? "com_error_files_upload_canceled"
            : error?.response?.data?.message ?? "com_error_files_upload";
        setError(errorMessage);
      },
    },
    abortControllerRef.current?.signal
  );

  const startUpload = async (extendedFile: ExtendedFile) => {
    const filename = extendedFile.file?.name ?? "File";
    startUploadTimer(extendedFile.file_id, filename, extendedFile.size);
    const width = extendedFile.width ?? 0;
    const height = extendedFile.height ?? 0;
    const metadata = params?.additionalMetadata ?? {};

    const formData = new FormData();
    formData.append("endpoint", endpoint);

    // Set file storage for backend processing
    formData.append("storage", FileSources.cloudinary);

    formData.append(
      "file",
      extendedFile.file as File
      // encodeURIComponent(filename)
    );

    formData.append("file_id", extendedFile.file_id);

    if (width) {
      formData.append("width", width.toString());
    }
    if (height) {
      formData.append("height", height.toString());
    }

    if (params?.additionalMetadata) {
      for (const [key, value = ""] of Object.entries(metadata)) {
        if (value) {
          formData.append(key, value);
        }
      }
    }

    uploadFile.mutate(formData);
  };

  const loadImage = (extendedFile: ExtendedFile, preview: string) => {
    const img = new Image();
    img.onload = async () => {
      extendedFile.width = img.width;
      extendedFile.height = img.height;
      extendedFile = {
        ...extendedFile,
        progress: 0.6,
      };
      replaceFile(extendedFile);
      await startUpload(extendedFile);
      URL.revokeObjectURL(preview);
    };
    img.src = preview;
  };

  const handleFiles = async (
    _files: FileList | File[],
    _toolResource?: string
  ) => {
    abortControllerRef.current = new AbortController();
    const fileList = Array.from(_files);
    /* Validate files */
    let filesAreValid: boolean;
    try {
      filesAreValid = validateFiles({
        files,
        fileList,
        setError,
        endpointFileConfig:
          params?.overrideEndpointFileConfig ??
          fileConfig.endpoints[endpoint as keyof typeof fileConfig.endpoints] ??
          fileConfig.endpoints.default,
      });
    } catch (error) {
      console.error("file validation error", error);
      setError("com_error_files_validation");
      return;
    }
    if (!filesAreValid) {
      setFilesLoading(false);
      return;
    }

    /* Process files */
    for (const originalFile of fileList) {
      const file_id = v4();
      try {
        // Create initial preview with original file
        const initialPreview = URL.createObjectURL(originalFile);

        // Create initial ExtendedFile to show immediately
        const initialExtendedFile: ExtendedFile = {
          file_id,
          file: originalFile,
          type: originalFile.type,
          preview: initialPreview,
          progress: 0.1, // Show as processing
          size: originalFile.size,
        };

        // Add file immediately to show in UI
        addFile(initialExtendedFile);

        // Check if HEIC conversion is needed and show toast
        const isHEIC =
          originalFile.type === "image/heic" ||
          originalFile.type === "image/heif" ||
          originalFile.name.toLowerCase().match(/\.(heic|heif)$/);

        if (isHEIC) {
          showToast({
            message: "HEIC conversion in progress",
            status: "info",
            duration: 3000,
          });
        }

        // Process file for HEIC conversion if needed
        const heicProcessedFile = await processFileForUpload(
          originalFile,
          0.9,
          (conversionProgress) => {
            // Update progress during HEIC conversion (0.1 to 0.5 range for conversion)
            const adjustedProgress = 0.1 + conversionProgress * 0.4;
            replaceFile({
              ...initialExtendedFile,
              progress: adjustedProgress,
            });
          }
        );

        let finalProcessedFile = heicProcessedFile;

        // Apply client-side resizing if available and appropriate
        if (heicProcessedFile.type.startsWith("image/")) {
          try {
            // const resizeResult = await resizeImageIfNeeded(heicProcessedFile);
            // finalProcessedFile = resizeResult.file;
            // Show toast notification if image was resized
            // if (resizeResult.resized && resizeResult.result) {
            //   const { originalSize, newSize, compressionRatio } =
            //     resizeResult.result;
            //   const originalSizeMB = (originalSize / (1024 * 1024)).toFixed(1);
            //   const newSizeMB = (newSize / (1024 * 1024)).toFixed(1);
            //   const savedPercent = Math.round((1 - compressionRatio) * 100);
            //   showToast({
            //     message: `Image resized: ${originalSizeMB}MB → ${newSizeMB}MB (${savedPercent}% smaller)`,
            //     status: "success",
            //     duration: 3000,
            //   });
            // }
          } catch (resizeError) {
            console.warn("Image resize failed, using original:", resizeError);
            // Continue with HEIC processed file if resizing fails
          }
        }

        // If file was processed (HEIC converted or resized), update with new file and preview
        if (finalProcessedFile !== originalFile) {
          URL.revokeObjectURL(initialPreview); // Clean up original preview
          const newPreview = URL.createObjectURL(finalProcessedFile);

          const updatedExtendedFile: ExtendedFile = {
            ...initialExtendedFile,
            file: finalProcessedFile,
            type: finalProcessedFile.type,
            preview: newPreview,
            progress: 0.5, // Processing complete, ready for upload
            size: finalProcessedFile.size,
          };

          replaceFile(updatedExtendedFile);

          const isImage = finalProcessedFile.type.split("/")[0] === "image";
          if (isImage) {
            loadImage(updatedExtendedFile, newPreview);
            continue;
          }

          await startUpload(updatedExtendedFile);
        } else {
          // File wasn't processed, proceed with original
          const isImage = originalFile.type.split("/")[0] === "image";
          // Update progress to show ready for upload
          const readyExtendedFile = {
            ...initialExtendedFile,
            progress: 0.2,
          };
          replaceFile(readyExtendedFile);

          if (isImage) {
            loadImage(readyExtendedFile, initialPreview);
            continue;
          }

          await startUpload(readyExtendedFile);
        }
      } catch (error) {
        deleteFileById(file_id);
        console.log("file handling error", error);
        if (error instanceof Error && error.message.includes("HEIC")) {
          setError("com_error_heic_conversion");
        } else {
          setError("com_error_files_process");
        }
      }
    }
  };

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    _toolResource?: string
  ) => {
    event.stopPropagation();
    if (event.target.files) {
      setFilesLoading(true);
      handleFiles(event.target.files, _toolResource);
      // reset the input
      event.target.value = "";
    }
  };

  const abortUpload = () => {
    if (abortControllerRef.current) {
      console.log("files", "Aborting upload");
      abortControllerRef.current.abort("User aborted upload");
      abortControllerRef.current = null;
    }
  };

  return {
    handleFileChange,
    handleFiles,
    abortUpload,
    setFiles,
    files,
  };
};

export function useFilesByIds(fileIds: string[]) {
  const [files, setFiles] = useState<ExtendedFile[]>([]);
  const authFetch = useAuthFetch();

  useEffect(() => {
    if (!fileIds || fileIds.length === 0) {
      setFiles([]);
      return;
    }
    authFetch("/uploads", {
      params: { ids: fileIds.join(",") },
    })
      .then((res) => setFiles(res.data))
      .catch(() => setFiles([]));
  }, [fileIds.join(",")]);

  return files;
}

export default useFileHandling;
