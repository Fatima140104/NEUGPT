import type { RefObject } from "react";

export type CodeBarProps = {
  lang: string;
  error?: boolean;
  plugin?: boolean;
  codeRef: RefObject<HTMLElement | null>;
};

export type HoverButtonType =
  | "copy"
  | "like"
  | "dislike"
  | "edit"
  | "regenerate"
  | "share";

export interface HoverButtonConfig {
  type: HoverButtonType;
  tooltip: string;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  className?: string;
  icon?: React.ReactNode;
  isVisible?: boolean;
}

/* Assistant */
export enum EToolResources {
  file_search = "file_search",
  image_edit = "image_edit",
  ocr = "ocr",
}

/* File */
export enum FileSources {
  local = "local",
  cloudinary = "cloudinary",
  firebase = "firebase",
  azure = "azure",
  azure_blob = "azure_blob",
  openai = "openai",
  vectordb = "vectordb",
  mistral_ocr = "mistral_ocr",
  azure_mistral_ocr = "azure_mistral_ocr",
  vertexai_mistral_ocr = "vertexai_mistral_ocr",
  text = "text",
}

export interface ExtendedFile {
  file?: File;
  file_id: string;
  temp_file_id?: string;
  type?: string;
  filepath?: string;
  filename?: string;
  width?: number;
  height?: number;
  size: number;
  preview?: string;
  progress: number;
  source?: FileSources;
  attached?: boolean;
  embedded?: boolean;
  tool_resource?: string;
  metadata?: TFile["metadata"];
}

export const checkOpenAIStorage = (source: string) =>
  source === FileSources.openai || source === FileSources.azure;

export type FileSetter = React.Dispatch<
  React.SetStateAction<Map<string, ExtendedFile>>
>;

export enum FileContext {
  avatar = "avatar",
  unknown = "unknown",
  agents = "agents",
  assistants = "assistants",
  image_generation = "image_generation",
  assistants_output = "assistants_output",
  message_attachment = "message_attachment",
  filename = "filename",
  updatedAt = "updatedAt",
  source = "source",
  filterSource = "filterSource",
  context = "context",
  bytes = "bytes",
}

export type EndpointFileConfig = {
  disabled?: boolean;
  fileLimit?: number;
  fileSizeLimit?: number;
  totalSizeLimit?: number;
  supportedMimeTypes?: RegExp[];
};

export type FileConfig = {
  endpoints: {
    [key: string]: EndpointFileConfig;
  };
  serverFileSizeLimit?: number;
  avatarSizeLimit?: number;
  clientImageResize?: {
    enabled?: boolean;
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
  };
  checkType?: (fileType: string, supportedTypes: RegExp[]) => boolean;
};

export type TFile = {
  _id?: string;
  __v?: number;
  user: string;
  conversationId?: string;
  message?: string;
  file_id: string;
  temp_file_id?: string;
  bytes: number;
  embedded: boolean;
  filename: string;
  filepath: string;
  object: "file";
  type: string;
  usage: number;
  context?: FileContext;
  source?: FileSources;
  filterSource?: FileSources;
  width?: number;
  height?: number;
  expiresAt?: string | Date;
  preview?: string;
  metadata?: { fileIdentifier?: string };
  createdAt?: string | Date;
  updatedAt?: string | Date;
};

export type TFileUpload = TFile & {
  temp_file_id: string;
};

export type AvatarUploadResponse = {
  url: string;
};

export type SpeechToTextResponse = {
  text: string;
};

export type VoiceResponse = string[];

export type UploadMutationOptions = {
  onSuccess?: (
    data: TFileUpload,
    variables: FormData,
    context?: unknown
  ) => void;
  onMutate?: (variables: FormData) => void | Promise<unknown>;
  onError?: (error: unknown, variables: FormData, context?: unknown) => void;
};

export type SpeechToTextOptions = {
  onSuccess?: (
    data: SpeechToTextResponse,
    variables: FormData,
    context?: unknown
  ) => void;
  onMutate?: (variables: FormData) => void | Promise<unknown>;
  onError?: (error: unknown, variables: FormData, context?: unknown) => void;
};

export type TextToSpeechOptions = {
  onSuccess?: (
    data: ArrayBuffer,
    variables: FormData,
    context?: unknown
  ) => void;
  onMutate?: (variables: FormData) => void | Promise<unknown>;
  onError?: (error: unknown, variables: FormData, context?: unknown) => void;
};

export type VoiceOptions = {
  onSuccess?: (
    data: VoiceResponse,
    variables: unknown,
    context?: unknown
  ) => void;
  onMutate?: () => void | Promise<unknown>;
  onError?: (error: unknown, variables: unknown, context?: unknown) => void;
};

export type DeleteFilesResponse = {
  message: string;
  result: Record<string, unknown>;
};

export type BatchFile = {
  file_id: string;
  filepath: string;
  embedded: boolean;
  source: FileSources;
  temp_file_id?: string;
  type?: string;
};

export type DeleteFilesBody = {
  files: BatchFile[];
  agent_id?: string;
  assistant_id?: string;
  tool_resource?: EToolResources;
};

export type DeleteMutationOptions = {
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
};

export type GenericSetter<T> = (value: T | ((currentValue: T) => T)) => void;

export type TError = {
  message: string;
  code?: number | string;
  response?: {
    data?: {
      message?: string;
    };
    status?: number;
  };
};

export type TShowToast = {
  message: string;
  severity?: "success" | "error" | "warning" | "info";
  showIcon?: boolean;
  duration?: number;
  status?: "error" | "success" | "warning" | "info";
};

export const codeTypeMapping: { [key: string]: string } = {
  c: "text/x-c",
  cs: "text/x-csharp",
  cpp: "text/x-c++",
  h: "text/x-h",
  md: "text/markdown",
  php: "text/x-php",
  py: "text/x-python",
  rb: "text/x-ruby",
  tex: "text/x-tex",
  js: "text/javascript",
  sh: "application/x-sh",
  ts: "application/typescript",
  tar: "application/x-tar",
  zip: "application/zip",
  yml: "application/x-yaml",
  yaml: "application/x-yaml",
  log: "text/plain",
  tsv: "text/tab-separated-values",
};
