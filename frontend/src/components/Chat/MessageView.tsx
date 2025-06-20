import React, { memo } from "react";
import { useChat } from "../../providers/ChatContext";
import type { Message } from "../../providers/ChatContext";
import { Avatar } from "@/components/ui/avatar";
import { User, Bot } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import Markdown from "../Messages/Markdown";

const MessageItem: React.FC<{ message: Message }> = ({ message }) => {
  return (
    <div
      className={`flex gap-4 p-4 ${
        message.role === "assistant" ? "bg-muted/50" : ""
      }`}
    >
      <Avatar className="h-8 w-8">
        {message.role === "user" ? (
          <User className="h-4 w-4" />
        ) : (
          <Bot className="h-4 w-4" />
        )}
      </Avatar>
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <span className="font-medium">
            {message.role === "user" ? "You" : "AI Assistant"}
          </span>
          <span className="text-xs text-muted-foreground">
            {message.timestamp.toLocaleTimeString()}
          </span>
        </div>
        <div className="prose prose-sm max-w-none dark:prose-invert">
          {message.role === "assistant" ? (
            <Markdown content={message.content} isLatestMessage={true} />
          ) : (
            message.content
          )}
        </div>
      </div>
    </div>
  );
};

export const MessageView: React.FC = () => {
  const { state } = useChat();
  const { messages, isLoading } = state;

  return (
    <div className="flex-1 overflow-y-auto">
      {messages.length === 0 ? (
        <div className="h-full flex items-center justify-center text-muted-foreground">
          No messages yet. Start a conversation!
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((message) => (
            <MessageItem
              key={(message as any)._id || message.id}
              message={{
                ...message,
                timestamp:
                  message.timestamp instanceof Date
                    ? message.timestamp
                    : new Date(message.timestamp),
              }}
            />
          ))}
          {isLoading && (
            <div className="flex gap-4 p-4 bg-muted/50">
              <Avatar className="h-8 w-8">
                <Bot className="h-4 w-4" />
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">AI Assistant</span>
                </div>
                <div className="mt-2">
                  <div className="flex gap-2">
                    <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" />
                    <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:0.2s]" />
                    <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
