export interface AIModel {
  id: string;
  name: string;
  description?: string;
  isAvailable?: boolean;
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
  return AI_MODELS.filter(model => model.isAvailable !== false);
}; 