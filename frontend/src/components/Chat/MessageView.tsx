import React, { useState, useEffect } from "react";
import { useChat } from "@/providers/ChatContext";
import useMessageScrolling from "@/hooks/useMessageScrolling";
import type { Message } from "@/providers/MessageContext";
import Markdown from "@/components/Messages/Markdown";
import Container from "@/components/Messages/Container";
import ScrollToBottom from "@/components/Messages/ScrollToBottom";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import HoverButtons from "@/components/Chat/HoverButtons";
import type { HoverButtonConfig, ExtendedFile } from "@/common/types";
import { Check, Copy } from "lucide-react";
import FileGallery from "@/components/Chat/Gallery/FileGallery";

function useCopyToClipboard() {
  const [isCopied, setIsCopied] = useState(false);
  const copy = (text: string) => {
    if (navigator && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 3000);
    }
  };
  return { isCopied, copy };
}

const MessageItem: React.FC<{ message: Message }> = React.memo(
  ({ message }) => {
    const isUser = message.role === "user";
    const { isCopied, copy } = useCopyToClipboard();

    const fileObjects: ExtendedFile[] = message.files
      ? Array.from(message.files.values())
      : [];

    // Button configs
    const copyBtn: HoverButtonConfig = {
      type: "copy",
      tooltip: isCopied ? "Copied!" : "Copy",
      onClick: () => copy(message.content),
      active: isCopied,
      icon: isCopied ? <Check size={18} /> : <Copy size={18} />,
    };
    const editBtn: HoverButtonConfig = {
      type: "edit",
      tooltip: "Edit",
      onClick: () => {},
    };
    const likeBtn: HoverButtonConfig = {
      type: "like",
      tooltip: "Like",
      onClick: () => {},
    };
    const dislikeBtn: HoverButtonConfig = {
      type: "dislike",
      tooltip: "Dislike",
      onClick: () => {},
    };
    const regenerateBtn: HoverButtonConfig = {
      type: "regenerate",
      tooltip: "Regenerate",
      onClick: () => {},
    };
    const shareBtn: HoverButtonConfig = {
      type: "share",
      tooltip: "Share",
      onClick: () => {},
    };

    const assistantButtons = [
      copyBtn,
      likeBtn,
      dislikeBtn,
      editBtn,
      regenerateBtn,
      shareBtn,
    ];
    const userButtons = [copyBtn, editBtn];

    return (
      <div className="max-w-3xl mx-auto w-full flex flex-col gap-2 group">
        {isUser && fileObjects.length > 0 && (
          <div className="flex w-full justify-end">
            <div className="w-1/3 flex-col">
              <FileGallery files={fileObjects} />
            </div>
          </div>
        )}
        <div
          className={cn(
            "flex w-full",
            isUser && "justify-end",
            !isUser && "justify-start"
          )}
        >
          <div
            className={cn(
              "relative rounded-3xl py-2.5 text-base break-words",
              isUser
                ? "max-w-[70%] bg-[#313031] text-white items-end px-5 group"
                : "w-full"
            )}
          >
            {isUser ? (
              <div>{message.content}</div>
            ) : (
              <Container>
                <Markdown content={message.content} isLatestMessage={true} />
              </Container>
            )}
          </div>
        </div>
        {/* HoverButtons */}
        {isUser ? (
          <div className="flex justify-end opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 group-hover:flex transition-all duration-500">
            <HoverButtons buttons={userButtons} />
          </div>
        ) : (
          <div className="flex justify-start">
            <HoverButtons buttons={assistantButtons} />
          </div>
        )}
      </div>
    );
  }
);

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
        {/* {isAwaitingFirstChunk && (
          <div className="max-w-3xl mx-auto w-full flex justify-start translate-x-[-20px]">
            <div className="relative max-w-[70%] rounded-3xl px-5 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100">
              <video
                src={waitingResponseAnimation}
                autoPlay
                loop
                muted
                playsInline
                style={{ width: 30, height: 30, objectFit: "contain" }}
              />
            </div>
          </div>
        )} */}
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
