import { excelMimeTypes, fileConfig } from "@/config/fileConfig";
import {
  codeTypeMapping,
  type EndpointFileConfig,
  type ExtendedFile,
} from "@/common/types";
import TextPaths from "@/components/svg/TextPaths";
import SheetPaths from "@/components/svg/SheetPaths";
import CodePaths from "@/components/svg/CodePath";
import FilePaths from "@/components/svg/FilePath";

export const partialTypes = ["text/x-"];

const textDocument = {
  paths: TextPaths,
  fill: "#FF5588",
  title: "Document",
};

const spreadsheet = {
  paths: SheetPaths,
  fill: "#10A37F",
  title: "Spreadsheet",
};

const codeFile = {
  paths: CodePaths,
  fill: "#FF6E3C",
  // TODO: make this dynamic to the language
  title: "Code",
};

const artifact = {
  paths: CodePaths,
  fill: "#2D305C",
  title: "Code",
};

export const fileTypes: {
  [key: string]: {
    paths: React.FC;
    fill: string;
    title: string;
  };
} = {
  /* Category matches */
  file: {
    paths: FilePaths,
    fill: "#0000FF",
    title: "File",
  },
  text: textDocument,
  txt: textDocument,
  // application:,

  /* Partial matches */
  csv: spreadsheet,
  "application/pdf": textDocument,
  pdf: textDocument,
  "text/x-": codeFile,
  artifact: artifact,

  /* Exact matches */
  // 'application/json':,
  // 'text/html':,
  // 'text/css':,
  // image,
};

const partialMimeTypeMap: {
  [key: string]: { paths: React.FC; fill: string; title: string };
} = {
  wordprocessingml: textDocument, // docx
  msword: textDocument, // doc
  pdf: textDocument, // pdf
  spreadsheetml: spreadsheet, // xlsx
  "ms-excel": spreadsheet, // xls
  xml: spreadsheet, // xlsm
  csv: spreadsheet, // csv
  presentationml: fileTypes.file, // pptx (default file icon)
  "ms-powerpoint": fileTypes.file, // ppt (default file icon)
};

// export const getFileType = (type = '') => {
//   let fileType = fileTypes.file;
//   const exactMatch = fileTypes[type];
//   const partialMatch = !exactMatch && partialTypes.find((type) => type.includes(type));
//   const category = (!partialMatch && (type.split('/')[0] ?? 'text') || 'text');

//   if (exactMatch) {
//     fileType = exactMatch;
//   } else if (partialMatch) {
//     fileType = fileTypes[partialMatch];
//   } else if (fileTypes[category]) {
//     fileType = fileTypes[category];
//   }

//   if (!fileType) {
//     fileType = fileTypes.file;
//   }

//   return fileType;
// };

export const getFileType = (
  type = ""
): {
  paths: React.FC;
  fill: string;
  title: string;
} => {
  // Direct match check
  if (fileTypes[type]) {
    return fileTypes[type];
  }

  if (excelMimeTypes.test(type)) {
    return spreadsheet;
  }

  if (type === "raw" || type === "application") {
    return textDocument;
  }

  // Partial match check (new logic)
  for (const partial in partialMimeTypeMap) {
    if (type.toLowerCase().includes(partial)) {
      return partialMimeTypeMap[partial];
    }
  }

  // Category check
  const category = type.split("/")[0] || "text";
  if (fileTypes[category]) {
    return fileTypes[category];
  }

  // Default file type
  return fileTypes.file;
};

const megabyte = 1024 * 1024;
const { checkType } = fileConfig;

export const validateFiles = ({
  files,
  fileList,
  setError,
  endpointFileConfig,
}: {
  fileList: File[];
  files: Map<string, ExtendedFile>;
  setError: (error: string) => void;
  endpointFileConfig: EndpointFileConfig;
}) => {
  const { fileLimit, fileSizeLimit, totalSizeLimit, supportedMimeTypes } =
    endpointFileConfig;
  const existingFiles = Array.from(files.values());
  const incomingTotalSize = fileList.reduce(
    (total, file) => total + file.size,
    0
  );
  if (incomingTotalSize === 0) {
    setError("Empty files");
    return false;
  }
  const currentTotalSize = existingFiles.reduce(
    (total, file) => total + file.size,
    0
  );

  if (fileLimit && fileList.length + files.size > fileLimit) {
    setError(`You can only upload up to ${fileLimit} files at a time.`);
    return false;
  }

  for (let i = 0; i < fileList.length; i++) {
    let originalFile = fileList[i];
    let fileType = originalFile.type;
    const extension = originalFile.name.split(".").pop() ?? "";
    const knownCodeType = codeTypeMapping[extension];

    // Infer MIME type for Known Code files when the type is empty or a mismatch
    if (knownCodeType && (!fileType || fileType !== knownCodeType)) {
      fileType = knownCodeType;
    }

    // Check if the file type is still empty after the extension check
    if (!fileType) {
      setError("Unable to determine file type for: " + originalFile.name);
      return false;
    }

    // Replace empty type with inferred type
    if (originalFile.type !== fileType) {
      const newFile = new File([originalFile], originalFile.name, {
        type: fileType,
      });
      originalFile = newFile;
      fileList[i] = newFile;
    }

    // Always set mimetype for upload payloads
    // (Assume downstream code will use originalFile.type as mimetype)
    // If you build a FormData or JSON payload, include both type and mimetype
    // Example: formData.append('mimetype', originalFile.type);

    if (!checkType(originalFile.type, supportedMimeTypes)) {
      setError("Currently, unsupported file type: " + originalFile.type);
      return false;
    }

    if (fileSizeLimit && originalFile.size >= fileSizeLimit) {
      setError(`File size exceeds ${fileSizeLimit / megabyte} MB.`);
      return false;
    }
  }

  if (totalSizeLimit && currentTotalSize + incomingTotalSize > totalSizeLimit) {
    setError(
      `The total size of the files cannot exceed ${
        totalSizeLimit / megabyte
      } MB.`
    );
    return false;
  }

  const combinedFilesInfo = [
    ...existingFiles.map(
      (file) =>
        `${file.file?.name ?? file.filename}-${file.size}-${
          file.type?.split("/")[0] ?? "file"
        }`
    ),
    ...fileList.map(
      (file: File | undefined) =>
        `${file?.name}-${file?.size}-${file?.type.split("/")[0] ?? "file"}`
    ),
  ];

  const uniqueFilesSet = new Set(combinedFilesInfo);

  if (uniqueFilesSet.size !== combinedFilesInfo.length) {
    setError("Duplicate files");
    return false;
  }

  return true;
};
