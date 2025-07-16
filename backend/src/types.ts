export enum EModelEndpoint {
  azureOpenAI = "azureOpenAI",
  openAI = "openAI",
  google = "google",
  anthropic = "anthropic",
  assistants = "assistants",
  azureAssistants = "azureAssistants",
  agents = "agents",
  custom = "custom",
  bedrock = "bedrock",
  /** @deprecated */
  chatGPTBrowser = "chatGPTBrowser",
  /** @deprecated */
  gptPlugins = "gptPlugins",
}

export enum EToolResources {
  file_search = "file_search",
  image_edit = "image_edit",
  ocr = "ocr",
}

export enum FileContext {
  avatar = "avatar",
  unknown = "unknown",
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
