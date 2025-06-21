import React, { useEffect, useState } from "react";
import { MessageView } from "./MessageView";
import { ChatForm } from "./ChatForm";
import { useChat } from "../../providers/ChatContext";
import { useChatSession } from "../../providers/ChatSessionContext";
import { useAuthFetch } from "@/hooks/useAuthFetch";
import { cn } from "@/lib/utils";

export const ChatView: React.FC = () => {
  const { state: chatState, dispatch } = useChat();
  const { state: sessionState } = useChatSession();
  const { messages } = chatState;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const authFetch = useAuthFetch();

  useEffect(() => {
    if (!sessionState.selectedSessionId) {
      dispatch({ type: "SET_MESSAGES", payload: [] });
      return;
    }
    setLoading(true);
    setError(null);
    authFetch(`/chats/session/${sessionState.selectedSessionId}`)
      .then((res) => {
        dispatch({ type: "SET_MESSAGES", payload: res.data });
      })
      .catch((err) => {
        if (err.response?.status !== 401) {
          setError(err.message || "Failed to fetch messages");
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, [sessionState.selectedSessionId, dispatch, authFetch]);

  return (
    <div
      className={cn(
        "flex-1 h-0",
        messages.length > 0
          ? "relative"
          : "flex flex-1 flex-col items-center justify-center"
      )}
    >
      {messages.length === 0 ? (
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold mb-2">What's up Homie?</h2>
          <p className="text-muted-foreground text-base">
            Tôi có thể giúp gì cho bạn?
          </p>
        </div>
      ) : (
        <div className="absolute inset-0 flex flex-col">
          <div className="flex-1 overflow-y-auto pb-36">
            <div className="w-full max-w-3xl mx-auto flex items-center justify-center">
              {loading ? (
                <div className="flex flex-1 flex-col items-center justify-center h-full text-muted-foreground">
                  Đang tải tin nhắn...
                </div>
              ) : error ? (
                <div className="flex flex-1 flex-col items-center justify-center h-full text-red-500">
                  {error}
                </div>
              ) : (
                <MessageView />
              )}
            </div>
          </div>
        </div>
      )}
      <div
        className={cn(
          "w-full bg-transparent flex justify-center",
          messages.length > 0 &&
            "absolute bottom-0 left-0 right-0 z-10 transition-all duration-200"
        )}
      >
        <ChatForm />
      </div>
    </div>
  );
};
