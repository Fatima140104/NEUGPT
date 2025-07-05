import { useState } from "react";
import { useToastContext } from "@/providers/ToastContext";

export const useDelayedUploadToast = () => {
  const { showToast } = useToastContext();
  const [uploadTimers, setUploadTimers] = useState<
    Record<string, NodeJS.Timeout>
  >({});

  const determineDelay = (fileSize: number): number => {
    const baseDelay = 5000;
    const additionalDelay = Math.floor(fileSize / 1000000) * 2000;
    return baseDelay + additionalDelay;
  };

  const startUploadTimer = (
    fileId: string,
    fileName: string,
    fileSize: number
  ) => {
    const delay = determineDelay(fileSize);

    if (uploadTimers[fileId]) {
      clearTimeout(uploadTimers[fileId]);
    }

    const timer = setTimeout(() => {
      const message = `Uploading ${fileName}...`;
      showToast({
        message,
        status: "warning",
        duration: 10000,
      });
    }, delay);

    setUploadTimers((prev) => ({ ...prev, [fileId]: timer }));
  };

  const clearUploadTimer = (fileId: string) => {
    if (uploadTimers[fileId]) {
      clearTimeout(uploadTimers[fileId]);
      setUploadTimers((prev) => {
        const { [fileId]: _, ...rest } = prev;
        return rest;
      });
    }
  };

  return { startUploadTimer, clearUploadTimer };
};
