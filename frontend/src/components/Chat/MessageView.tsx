import React, { useState, useEffect } from "react";
import { useChat } from "@/providers/ChatContext";
import useMessageScrolling from "@/hooks/useMessageScrolling";
import ScrollToBottom from "@/components/Messages/ScrollToBottom";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import { AnimatePresence, motion } from "framer-motion";
import { MessageItem } from "@/components/Chat/Message";

export const MessageView: React.FC = () => {
  const { state } = useChat();
  const { messageTree: messages, isLoading } = state;

  const { scrollableRef, messagesEndRef, showScrollButton, handleSmoothToRef } =
    useMessageScrolling(messages, isLoading);

  // Get scrollButtonPreference from Redux store
  const scrollButtonPreference = useSelector(
    (state: RootState) => state.settings.scrollButtonPreference
  );

  // Fade-in animation state
  const [animateIn, setAnimateIn] = useState(false);
  useEffect(() => {
    if (!isLoading && messages.length > 0) {
      setAnimateIn(false);
      setTimeout(() => setAnimateIn(true), 50);
    }
  }, [isLoading, messages.length]);

  return (
    <div
      className="relative flex-1 overflow-hidden overflow-y-auto -mb-(--composer-overlap-px) [--composer-overlap-px:24px] z-10"
      ref={scrollableRef}
    >
      <div className="space-y-4 pt-5 pb-20 px-4">
        {messages.map((message, idx) => (
          <div
            key={(message as any)._id || message.id}
            className={`transition-opacity duration-700 ${
              animateIn ? "opacity-100" : "opacity-0"
            }`}
            style={{ transitionDelay: `${idx * 40}ms` }}
          >
            <MessageItem
              message={{
                ...message,
                timestamp:
                  message.timestamp instanceof Date
                    ? message.timestamp
                    : new Date(message.timestamp),
              }}
            />
          </div>
        ))}
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
