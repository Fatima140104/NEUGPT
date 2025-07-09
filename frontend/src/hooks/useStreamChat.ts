import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useChat } from "@/providers/ChatContext";
import { useChatSession } from "@/providers/ChatSessionContext";
import { getAvailableModels, type AIModel } from "@/config/models";
import { streamChat } from "@/lib/streamChat";
import { useAuthFetch } from "@/hooks/useAuthFetch";
import { useChatForm } from "@/providers/ChatFormContext";
import useToast from "@/hooks/useToast";
import { NotificationSeverity } from "@/common/types";

export function useStreamChat() {
  const [message, setMessage] = useState("");
  const [selectedModel, setSelectedModel] = useState<AIModel | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { state, dispatch } = useChat();
  const { state: formState, files, setFiles } = useChatForm();
  const {
    state: sessionState,
    addSession,
    selectSession,
    refreshSession,
  } = useChatSession();
  const availableModels = getAvailableModels();
  const abortControllerRef = useRef<AbortController | null>(null);
  const navigate = useNavigate();
  const authFetch = useAuthFetch();
  const { showToast } = useToast();
  // Initialize selected model
  if (!selectedModel && availableModels.length > 0) {
    setSelectedModel(availableModels[0]);
  }

  const handleSubmit = async (e: React.FormEvent | React.KeyboardEvent) => {
    e.preventDefault();

    if (!message.trim() || state.isLoading || formState.filesLoading) return;

    if (!selectedModel?.canProcessFiles && files.size > 0) {
      showToast({
        message: "Model does not support file processing",
        severity: NotificationSeverity.WARNING,
      });
      return;
    }

    let currentSessionId = sessionState.selectedSessionId;
    let isNewSession = false;

    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    try {
      const file_ids = Array.from(files.values()).map((f) => f._id);
      if (!currentSessionId || currentSessionId === "new") {
        const newSession = await addSession("Cuộc trò chuyện mới");
        if (!newSession || !newSession._id) {
          throw new Error("Không thể tạo hoặc lấy ID của cuộc trò chuyện mới.");
        }
        currentSessionId = newSession._id;
        isNewSession = true;
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
        files: files,
      };
      dispatch({ type: "ADD_MESSAGE", payload: userMessage });
      // Clear message
      setMessage("");
      // Clear files when message is sent
      setFiles(new Map());
      let assistantId = (Date.now() + 1).toString();
      let accumulated = "";
      const assistantMessage = {
        id: assistantId,
        role: "assistant" as const,
        content: "",
        timestamp: new Date(),
      };
      dispatch({ type: "ADD_MESSAGE", payload: assistantMessage });

      // Stream chat
      await streamChat({
        url: "/api/ai/chat",
        body: {
          sessionId: currentSessionId,
          message: userMessage.content,
          model: selectedModel?.id || "gpt-3.5-turbo",
          file_ids: file_ids,
        },
        onMessage: (chunk) => {
          accumulated += chunk;
          const updatedMessages = [
            ...state.messageTree,
            userMessage,
            { ...assistantMessage, content: accumulated },
          ];
          dispatch({ type: "SET_MESSAGES", payload: updatedMessages });
        },
        onDone: () => {
          // dispatch({ type: "SET_LOADING", payload: false });
        },
        onError: (err) => {
          console.error("Streaming error: " + (err?.message || err));
          // dispatch({ type: "SET_LOADING", payload: false });
        },
        signal,
      });

      if (isNewSession && currentSessionId) {
        setTimeout(() => {
          refreshSession(currentSessionId as string);
        }, 3000);
      }
    } catch (error: any) {
      if (error.name === "CanceledError" || error.name === "AbortError") {
        // setError("Đã dừng phản hồi.");
      } else {
        setError(error.message);
      }
    } finally {
      abortControllerRef.current = null;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleStop = async () => {
    const currentSessionId = sessionState.selectedSessionId;
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    // Notify the backend to abort
    try {
      await authFetch("/ai/abort", {
        method: "POST",
        data: { sessionId: currentSessionId },
      });
    } catch (err) {
      console.error("Error aborting request:", err);
    }
  };

  return {
    message,
    setMessage,
    handleSubmit,
    handleKeyDown,
    isLoading: state.isLoading,
    error,
    handleStop,
    selectedModel,
    setSelectedModel,
    availableModels,
  };
}
