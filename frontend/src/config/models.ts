export interface AIModel {
  id: string;
  name: string;
  description?: string;
  isAvailable?: boolean;
  canProcessFiles?: boolean;
}

export const AI_MODELS: AIModel[] = [
  {
    id: "gpt-4o-mini",
    name: "GPT-4o-mini",
    description: "Fast and cost-effective model for everyday tasks",
    isAvailable: true,
    canProcessFiles: false,
  },
  {
    id: "gpt-4o",
    name: "GPT-4o",
    description: "Advanced multimodal model with high capability",
    isAvailable: true,
    canProcessFiles: true,
  },
  {
    id: "o1-mini",
    name: "o1-mini",
    description: "Reasoning model optimized for coding and math",
    isAvailable: true,
    canProcessFiles: false,
  },
];

export const getAvailableModels = (): AIModel[] => {
  return AI_MODELS.filter((model) => model.isAvailable !== false);
};
