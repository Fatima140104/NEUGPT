import React from "react";
import { useChat } from "../../providers/ChatContext";
import useMessageScrolling from "@/hooks/useMessageScrolling";
import type { Message } from "../../providers/ChatContext";
import Markdown from "../Messages/Markdown";
import Container from "../Messages/Container";
import ScrollToBottom from "../Messages/ScrollToBottom";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import { AnimatePresence, motion } from "framer-motion";

const MessageItem: React.FC<{ message: Message }> = ({ message }) => {
  const isUser = message.role === "user";
  return (
    <div className="max-w-3xl mx-auto w-full flex">
      <div
        className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}
      >
        <div
          className={`
            relative  rounded-3xl px-5 py-2.5 text-base break-words whitespace-pre-wrap
            ${isUser ? "max-w-[70%] bg-[#313031] text-white items-end" : ""}
          `}
        >
          <Container>
            <Markdown content={message.content} isLatestMessage={true} />
          </Container>
        </div>
      </div>
    </div>
  );
};

export const MessageView: React.FC = () => {
  const { state } = useChat();
  const { messageTree: messages, isLoading } = state;

  const { scrollableRef, messagesEndRef, showScrollButton, handleSmoothToRef } =
    useMessageScrolling(messages, isLoading);

  // Get scrollButtonPreference from Redux store
  const scrollButtonPreference = useSelector(
    (state: RootState) => state.settings.scrollButtonPreference
  );

  return (
    <div
      className="relative flex-1 overflow-hidden overflow-y-auto"
      ref={scrollableRef}
    >
      <div className="space-y-4 p-4">
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
          <div className="max-w-3xl mx-auto w-full flex justify-start">
            <div className="relative max-w-[70%] rounded-3xl px-5 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100">
              <span>...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <AnimatePresence>
        {showScrollButton && scrollButtonPreference && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.8 }}
            style={{
              position: "sticky",
              bottom: 0,
              right: 20,
              zIndex: 10,
              display: "flex",
              justifyContent: "flex-end",
            }}
            className="scroll-animation"
          >
            <ScrollToBottom scrollHandler={handleSmoothToRef} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
