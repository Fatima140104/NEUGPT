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
    id: "gpt-3.5-turbo",
    name: "3.5 Turbo",
    description: "Fast and efficient for most tasks",
    isAvailable: true,
  },
  {
    id: "gpt-4o",
    name: "4o",
    description: "The latest and greatest model from OpenAI",
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