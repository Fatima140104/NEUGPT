import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useChat } from "../../providers/ChatContext";
import { useChatSession } from "../../providers/ChatSessionContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Paperclip, Settings2, Mic } from "lucide-react";
import { useAuthFetch } from "@/hooks/useAuthFetch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getAvailableModels, type AIModel } from "@/config/models";

export const ChatForm: React.FC = () => {
  const [message, setMessage] = useState("");
  const [selectedModel, setSelectedModel] = useState<AIModel | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { state, dispatch } = useChat();
  const { state: sessionState, addSession, selectSession } = useChatSession();
  const [error, setError] = useState<string | null>(null);
  const authFetch = useAuthFetch();
  const navigate = useNavigate();
  const availableModels = getAvailableModels();

  // Initialize selected model with the first available model
  useEffect(() => {
    if (!selectedModel && availableModels.length > 0) {
      setSelectedModel(availableModels[0]);
    }
  }, [availableModels, selectedModel]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || state.isLoading) return;

    let currentSessionId = sessionState.selectedSessionId;

    try {
      if (!currentSessionId || currentSessionId === "new") {
        const newSession = await addSession("Cuộc trò chuyện mới");
        if (!newSession || !newSession._id) {
          throw new Error("Không thể tạo hoặc lấy ID của cuộc trò chuyện mới.");
        }
        currentSessionId = newSession._id;
        if (typeof currentSessionId === "string") {
          selectSession(currentSessionId);
        }
        navigate(`/c/${currentSessionId}`, { replace: true });
      }

      setError(null);
      const userMessage = {
        id: Date.now().toString(),
        role: "user" as const,
        content: message.trim(),
        timestamp: new Date(),
      };

      dispatch({ type: "ADD_MESSAGE", payload: userMessage });
      dispatch({ type: "SET_LOADING", payload: true });
      setMessage("");

      // Gửi tin nhắn đến server với session ID và model
      const res = await authFetch("/ai/chat", {
        method: "POST",
        data: {
          sessionId: currentSessionId,
          message: userMessage.content,
          model: selectedModel?.id || "gpt-3.5-turbo",
        },
      });

      if (res.status !== 200) throw new Error("Gửi tin nhắn thất bại");

      // Tải lại tin nhắn cho session hiện tại
      const fetchRes = await authFetch(`/chats/session/${currentSessionId}`);
      if (fetchRes.status !== 200)
        throw new Error("Không thể tải lại tin nhắn");
      const messages = fetchRes.data;
      dispatch({ type: "SET_MESSAGES", payload: messages });
    } catch (error: any) {
      setError(error.message);
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        200
      )}px`;
    }
  }, [message]);

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full flex flex-col items-center pr-4 pb-4 pt-2"
      autoComplete="off"
    >
      <div className="shadow-lg flex w-full max-w-3xl flex-col mx-auto items-center justify-center overflow-clip rounded-[28px] bg-background dark:bg-[#303030]">
        <div className="relative flex w-full items-end px-2.5 py-2.5">
          <div className="flex w-full flex-col">
            <div className="flex min-h-12 items-start">
              <div className="max-w-full min-w-0 flex-1 px-2.5">
                <Textarea
                  ref={textareaRef}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Hỏi gì đi"
                  className="text-token-text-primary placeholder:text-token-text-tertiary block h-10 w-full resize-none border-0 bg-transparent px-0 py-2 ring-0 placeholder:ps-px min-h-12 max-h-52 font-family-Segoe-UI"
                  disabled={state.isLoading}
                />
              </div>
              <Button
                type="submit"
                size="icon"
                className="ml-2 h-10 w-10 rounded-full bg-primary text-primary-foreground shadow-md"
                disabled={!message.trim() || state.isLoading}
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
            {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
          </div>
        </div>
        {/* Tools/Actions Section */}
        <div className="flex w-full items-center px-4 pb-2 pt-1 gap-2 justify-between">
          <div className="flex gap-1">
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="rounded-full"
            >
              <Paperclip className="h-5 w-5" />
            </Button>
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
                    className={
                      selectedModel?.id === model.id ? "bg-accent" : ""
                    }
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
    </form>
  );
};
