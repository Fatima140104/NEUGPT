import React, { useEffect, useState } from "react";
import { MessageView } from "./MessageView";
import { ChatForm } from "./ChatForm";
import { useChat } from "../../providers/ChatContext";
import { useChatSession } from "../../providers/ChatSessionContext";

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
    fetch(`/api/chats/session/${sessionState.selectedSessionId}`)
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

  if (loading) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center h-full text-muted-foreground">
        Đang tải tin nhắn...
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center h-full text-red-500">
        {error}
      </div>
    );
  }
  if (messages.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center h-full">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold mb-2">What's up Homie?</h2>
          <p className="text-muted-foreground text-base">
            Tôi có thể giúp gì cho bạn?
          </p>
        </div>
        <div className="w-full flex justify-center">
          <ChatForm />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        <MessageView />
      </div>
      <ChatForm />
    </div>
  );
};
