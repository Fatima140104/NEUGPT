export interface AIModel {
  id: string;
  name: string;
  description?: string;
  isAvailable: boolean;
  maxTokens?: number;
  costPer1kTokens?: number;
}

export const AI_MODELS: AIModel[] = [
  {
    id: "gpt-4o-mini",
    name: "GPT-4o-mini",
    description: "Fast and cost-effective model for everyday tasks",
    isAvailable: true,
  },
  {
    id: "gpt-4o",
    name: "GPT-4o",
    description: "Advanced multimodal model with high capability",
    isAvailable: true,
  },
  {
    id: "o1-mini",
    name: "o1-mini",
    description: "Reasoning model optimized for coding and math",
    isAvailable: true,
  },
];

export const getAvailableModels = (): AIModel[] => {
  return AI_MODELS.filter(model => model.isAvailable);
};

export const getModelById = (modelId: string): AIModel | null => {
  return AI_MODELS.find(model => model.id === modelId) || null;
};

export const isModelValid = (modelId: string): boolean => {
  const model = getModelById(modelId);
  return model !== null && model.isAvailable;
};

export const getDefaultModel = (): AIModel => {
  const availableModels = getAvailableModels();
  return availableModels[0] || AI_MODELS[0];
}; 