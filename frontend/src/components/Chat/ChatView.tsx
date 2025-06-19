import React, { useEffect, useState } from "react";
import { MessageView } from "./MessageView";
import { ChatForm } from "./ChatForm";
import { useChat } from "../../providers/ChatContext";
import { useChatSession } from "../../providers/ChatSessionContext";
import { fetchWithAuth } from "@/lib/fetchWithAuth";

export const ChatView: React.FC = () => {
  const { state: chatState, dispatch } = useChat();
  const { state: sessionState } = useChatSession();
  const { messages } = chatState;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionState.selectedSessionId) {
      dispatch({ type: "SET_MESSAGES", payload: [] });
      return;
    }
    setLoading(true);
    setError(null);
    fetchWithAuth(`/api/chats/session/${sessionState.selectedSessionId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch messages");
        return res.json();
      })
      .then((data) => {
        dispatch({ type: "SET_MESSAGES", payload: data });
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [sessionState.selectedSessionId, dispatch]);

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center h-full relative">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold mb-2">What's up Homie?</h2>
          <p className="text-muted-foreground text-base">
            Tôi có thể giúp gì cho bạn?
          </p>
        </div>
        <div className="w-full flex justify-center bg-transparent">
          <ChatForm />
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex-1 h-full">
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
        <div className="absolute bottom-0 left-0 right-0 z-10 bg-transparent flex justify-center">
          <ChatForm />
        </div>
      </div>
    </div>
  );
};
