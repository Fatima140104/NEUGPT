import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { UseMutationResult } from "@tanstack/react-query";
import type {
  DeleteFilesBody,
  DeleteFilesResponse,
  TFile,
  TFileUpload,
} from "@/common/types";
import { getToken } from "@/lib/auth";

function getAuthHeader(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// TODO: refactor/ migrate to appropriate position
const dataService = {
  uploadFile: async (
    body: FormData,
    signal?: AbortSignal | null
  ): Promise<TFileUpload> => {
    const response = await fetch("/api/files/upload", {
      method: "POST",
      body,
      signal,
      headers: {
        ...(getAuthHeader() ?? {}),
      },
    });

    if (response.status !== 200) {
      // Optionally parse error details from response
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "File upload failed");
    }

    // TODO: Adjust this to match backend's response structure
    const data = await response.json();
    return data as TFileUpload;
  },
  deleteFiles: async (body: DeleteFilesBody): Promise<DeleteFilesResponse> => {
    const response = await fetch("/api/files/delete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(getAuthHeader() ?? {}),
      },
      body: JSON.stringify(body),
    });

    if (response.status !== 200) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "File delete failed");
    }

    // TODO: Adjust this to match backend's response structure
    const data = await response.json();
    return data as DeleteFilesResponse;
  },
};

export const useUploadFileMutation = (
  _options?: {
    onSuccess?: (
      data: TFileUpload,
      variables: FormData,
      context?: unknown
    ) => void;
    onMutate?: (variables: FormData) => void | Promise<unknown>;
    onError?: (error: unknown, variables: FormData, context?: unknown) => void;
  },
  signal?: AbortSignal | null
): UseMutationResult<
  TFileUpload, // response data
  unknown, // error
  FormData, // request
  unknown // context
> => {
  const queryClient = useQueryClient();
  const { onSuccess, ...options } = _options || {};
  return useMutation({
    mutationFn: (body: FormData) => dataService.uploadFile(body, signal),
    ...options,
    onSuccess: (data, formData, context) => {
      queryClient.setQueryData<TFile[] | undefined>(["files"], (_files) => [
        data,
        ...(_files ?? []),
      ]);
      onSuccess?.(data, formData, context);
    },
  });
};

export const useDeleteFilesMutation = (_options?: {
  onSuccess?: (
    data: DeleteFilesResponse,
    variables: DeleteFilesBody,
    context?: unknown
  ) => void;
  onMutate?: (variables: DeleteFilesBody) => void | Promise<unknown>;
  onError?: (
    error: unknown,
    variables: DeleteFilesBody,
    context?: unknown
  ) => void;
}): UseMutationResult<
  DeleteFilesResponse, // response data
  unknown, // error
  DeleteFilesBody, // request
  unknown // context
> => {
  const queryClient = useQueryClient();
  const { onSuccess, ...options } = _options || {};
  return useMutation({
    mutationFn: (body: DeleteFilesBody) => {
      return dataService.deleteFiles(body);
    },
    ...options,
    onSuccess: (data, vars, context) => {
      queryClient.setQueryData<TFile[] | undefined>(["files"], (cachefiles) => {
        const deletedIds = new Set(data.result.deleted as string[]);
        return (cachefiles ?? []).filter(
          (file) => !deletedIds.has(file.file_id)
        );
      });
      onSuccess?.(data, vars, context);
    },
  });
};
