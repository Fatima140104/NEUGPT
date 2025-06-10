import React from "react";
import { MessageView } from "./MessageView";
import { ChatForm } from "./ChatForm";
import { useChat } from "../../providers/ChatContext";

export const ChatView: React.FC = () => {
  const { state } = useChat();
  const { messages } = state;

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
