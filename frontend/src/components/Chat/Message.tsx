import { cn } from "@/lib/utils";
import HoverButtons from "@/components/Chat/HoverButtons";
import type { HoverButtonConfig, ExtendedFile } from "@/common/types";
import { Check, Copy } from "lucide-react";
import FileGallery from "@/components/Chat/Gallery/FileGallery";
import FileList from "@/components/Chat/Files/FileList";
import type { Message } from "@/providers/MessageContext";
import Markdown from "@/components/Messages/Markdown";
import Container from "@/components/Messages/Container";
import { useState } from "react";
import React from "react";

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

export const MessageItem: React.FC<{ message: Message }> = React.memo(
  ({ message }) => {
    const isUser = message.role === "user";
    const { isCopied, copy } = useCopyToClipboard();

    const fileObjects: ExtendedFile[] = message.files
      ? Array.from(message.files.values())
      : [];

    const imageFiles = fileObjects.filter((f) => f.type?.startsWith("image"));
    const nonImageFiles = fileObjects.filter(
      (f) => !f.type?.startsWith("image")
    );

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
      disabled: true,
      onClick: () => {},
    };
    const likeBtn: HoverButtonConfig = {
      type: "like",
      tooltip: "Like",
      disabled: true,
      onClick: () => {},
    };
    const dislikeBtn: HoverButtonConfig = {
      type: "dislike",
      tooltip: "Dislike",
      disabled: true,
      onClick: () => {},
    };
    const regenerateBtn: HoverButtonConfig = {
      type: "regenerate",
      tooltip: "Regenerate",
      disabled: true,
      onClick: () => {},
    };
    const shareBtn: HoverButtonConfig = {
      type: "share",
      tooltip: "Share",
      disabled: true,
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
          <div className="flex flex-col w-full items-end gap-2">
            {imageFiles.length > 0 && (
              <div className="w-1/3 flex-col">
                <FileGallery files={imageFiles} />
              </div>
            )}
            {nonImageFiles.length > 0 && (
              <div className="w-1/3 flex-col">
                <FileList files={nonImageFiles} />
              </div>
            )}
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
