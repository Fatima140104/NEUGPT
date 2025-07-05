// import { useCallback } from "react";
// import {
//   resizeImage,
//   type ResizeOptions,
//   type ResizeResult,
// } from "@/utils/imageResize";

// /**
//  * Minimal hook for client-side image resizing
//  */
// const useClientResize = () => {
//   /**
//    * Always attempts to resize the image using provided options
//    * @param file - The image file to resize
//    * @param options - Optional resize options
//    * @returns Promise resolving to either the resized file result or original file if resizing fails
//    */
//   const resizeImageIfNeeded = useCallback(
//     async (
//       file: File,
//       options?: Partial<ResizeOptions>
//     ): Promise<{ file: File; resized: boolean; result?: ResizeResult }> => {
//       let afterProcessing = file;
//       try {
//         const result = await resizeImage(file, options);
//         return { file: result.file, resized: true, result };
//       } catch (error) {
//         console.warn("Image resizing failed:", error);
//         return { file, resized: false };
//       }
//     },
//     []
//   );

//   return { resizeImageIfNeeded };
// };

// export default useClientResize;
