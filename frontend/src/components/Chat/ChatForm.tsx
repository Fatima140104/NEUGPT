import React, { useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Mic, AudioLines } from "lucide-react";
import { ModelSelector } from "@/components/ModelSelector";
import { ErrorMessage } from "@/components/ErrorMessage";
import { useStreamChat } from "@/hooks/useStreamChat";
import useToast from "@/hooks/useToast";
import { NotificationSeverity } from "@/common/types";
import FileFormChat from "@/components/Chat/Files/FileFormChat";
import AttachFileChat from "@/components/Chat/Files/AttachFileChat";
import { useSpeechInput } from "@/hooks/useSpeechInput";

export const ChatForm: React.FC = () => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { showToast } = useToast();
  
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

  // Handle transcript from speech recognition
  const handleTranscript = useCallback((transcript: string) => {
    setMessage(prev => prev + (prev ? ' ' : '') + transcript);
  }, [setMessage]);

  // Use speech input hook
  const { listening, toggleListening } = useSpeechInput({
    onTranscript: handleTranscript
  });

  const handleAudioLinesClick = () => {
    showToast({
      message: "Tính năng đang phát triển!",
      severity: NotificationSeverity.INFO,
      duration: 3000,
      showIcon: false,
    });
  };

  return (
    <form
      className="w-full flex flex-col items-center pr-4 pb-4 pt-2"
      autoComplete="off"
    >
      <div className="shadow-md border-2 border-gray-200 flex w-full max-w-3xl flex-col mx-auto items-center justify-center overflow-visible rounded-[28px] bg-background dark:bg-[#303030]">
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
                    className="text-base font-sans placeholder:text-base placeholder:font-sans placeholder:leading-[1.75] block w-full resize-none border-0 bg-transparent px-0 py-2 ring-0 placeholder:ps-px"
                    disabled={isLoading}
                    autoResize
                    maxHeight={208}
                  />
                </div>
                {isLoading && (
                  <Button
                    type="button"
                    size="icon"
                    className="ml-2 h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center shadow-md hover:bg-gray-400"
                    onClick={handleStop}
                  >
                    <div className="w-3 h-3 bg-black rounded-[3px] " />
                  </Button>
                )}
              </div>
              <ErrorMessage error={error} />
            </div>
          </div>
          {/* Tools/Actions Section */}
          <div className="flex w-full items-center px-4 pb-2 pt-1 gap-2 justify-between">
            <div className="flex gap-1">
              <div className="relative group">
                <AttachFileChat disableInputs={isLoading} />
                <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                  Tải file lên (chỉ hỗ trợ file ảnh)
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                </div>
              </div>

              <div className="relative group">
                <ModelSelector
                  selectedModel={selectedModel}
                  setSelectedModel={setSelectedModel}
                  availableModels={availableModels}
                />
                <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                  Chọn model
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                </div>
              </div>
            </div>
            <div className="flex gap-1">
              <div className="relative group">
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className={`rounded-full transition-all duration-200 ${
                    listening 
                      ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' 
                      : 'hover:bg-gray-100'
                  }`}
                  onClick={toggleListening}
                >
                  <Mic className={`h-5 w-5 ${listening ? 'text-white' : ''}`} />
                </Button>
                <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                  {listening ? 'Đang lắng nghe...' : 'Chép chính tả'}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                </div>
              </div>
              <div className="relative group">
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="rounded-full"
                  onClick={handleAudioLinesClick}
                >
                  <AudioLines className="h-5 w-5" />
                </Button>
                <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                  Sử dụng chế độ thoại
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};
