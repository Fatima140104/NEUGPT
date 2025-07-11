import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Mic } from "lucide-react";
import { ModelSelector } from "@/components/ModelSelector";
import { ErrorMessage } from "@/components/ErrorMessage";
import { useStreamChat } from "@/hooks/useStreamChat";
import FileFormChat from "@/components/Chat/Files/FileFormChat";
import AttachFileChat from "@/components/Chat/Files/AttachFileChat";

export const ChatForm: React.FC = () => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const {
    message,
    setMessage,
    handleKeyDown,
    isLoading,
    error,
    handleStop,
    selectedModel,
    setSelectedModel,
    availableModels,
  } = useStreamChat();

  return (
    <form
      className="w-full flex flex-col items-center pr-4 pb-4 pt-2"
      autoComplete="off"
    >
      <div className="shadow-md border-2 border-gray-200 flex w-full max-w-3xl flex-col mx-auto items-center justify-center overflow-clip rounded-[28px] bg-background dark:bg-[#303030]">
        <div className="flex flex-col w-full">
          <FileFormChat />
          <div className="relative flex w-full items-end px-2.5 pt-2.5">
            <div className="flex w-full flex-col">
              <div className="flex min-h-12 items-start">
                <div className="max-w-full min-w-0 flex-1 px-2.5">
                  <Textarea
                    id="chat-input"
                    ref={textareaRef}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Hỏi gì đi"
                    className="text-token-text-primary placeholder:text-token-text-tertiary block w-full resize-none border-0 bg-transparent px-0 py-2 ring-0 placeholder:ps-px font-family-Segoe-UI"
                    disabled={isLoading}
                    autoResize
                    maxHeight={208}
                  />
                </div>
                {isLoading ? (
                  <Button
                    type="button"
                    size="icon"
                    className="ml-2 h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center shadow-md"
                    onClick={handleStop}
                  >
                    <div className="w-4 h-4 bg-black rounded-none" />
                  </Button>
                ) : null}
              </div>
              <ErrorMessage error={error} />
            </div>
          </div>
          {/* Tools/Actions Section */}
          <div className="flex w-full items-center px-4 pb-2 pt-1 gap-2 justify-between">
            <div className="flex gap-1">
              <AttachFileChat disableInputs={isLoading} />
              <ModelSelector
                selectedModel={selectedModel}
                setSelectedModel={setSelectedModel}
                availableModels={availableModels}
              />
            </div>
            <div className="flex gap-1">
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="rounded-full"
              >
                <Mic className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};
