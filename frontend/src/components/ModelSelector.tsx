import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Settings2 } from "lucide-react";
import type { AIModel } from "@/config/models";

interface ModelSelectorProps {
  selectedModel: AIModel | null;
  setSelectedModel: (model: AIModel) => void;
  availableModels: AIModel[];
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  selectedModel,
  setSelectedModel,
  availableModels,
}) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button
        type="button"
        variant="ghost"
        className="rounded-full px-3 h-8 text-xs flex items-center gap-2"
      >
        <Settings2 className="h-4 w-4" />
        <span className="hidden sm:inline">
          {selectedModel?.name || "Model"}
        </span>
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="start">
      <DropdownMenuLabel>Model</DropdownMenuLabel>
      {availableModels.map((model) => (
        <DropdownMenuItem
          key={model.id}
          onClick={() => setSelectedModel(model)}
          className={selectedModel?.id === model.id ? "bg-accent" : ""}
        >
          <div className="flex flex-col">
            <p className="font-medium">{model.name}</p>
            {model.description && (
              <p className="text-xs text-muted-foreground">
                {model.description}
              </p>
            )}
          </div>
        </DropdownMenuItem>
      ))}
    </DropdownMenuContent>
  </DropdownMenu>
);
