import React, { useState, useRef, useEffect } from "react";
import { useChat } from "../../providers/ChatContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Paperclip, Settings2, Mic } from "lucide-react";

export const ChatForm: React.FC = () => {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { state, dispatch } = useChat();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || state.isLoading) return;

    const userMessage = {
      id: Date.now().toString(),
      role: "user" as const,
      content: message.trim(),
      timestamp: new Date(),
    };

    dispatch({ type: "ADD_MESSAGE", payload: userMessage });
    dispatch({ type: "SET_LOADING", payload: true });
    setMessage("");

    try {
      // TODO: Implement API call to your backend
      // For now, we'll simulate a response
      setTimeout(() => {
        const aiMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant" as const,
          content:
            "This is a simulated response. Implement your API call here.",
          timestamp: new Date(),
        };
        dispatch({ type: "ADD_MESSAGE", payload: aiMessage });
        dispatch({ type: "SET_LOADING", payload: false });
      }, 1000);
    } catch (error) {
      console.error("Error sending message:", error);
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        200
      )}px`;
    }
  }, [message]);

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full flex flex-col items-center px-2 pb-4 pt-2"
      autoComplete="off"
    >
      <div className="shadow-lg flex w-full max-w-2xl flex-col items-center justify-center overflow-clip rounded-[28px] bg-background dark:bg-[#303030]">
        <div className="relative flex w-full items-end px-2.5 py-2.5">
          <div className="flex w-full flex-col">
            <div className="flex min-h-12 items-start">
              <div className="max-w-full min-w-0 flex-1 px-2.5">
                <Textarea
                  ref={textareaRef}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Hỏi gì đi"
                  className="text-token-text-primary placeholder:text-token-text-tertiary block h-10 w-full resize-none border-0 bg-transparent px-0 py-2 ring-0 placeholder:ps-px min-h-12 max-h-52 font-family-Segoe-UI"
                  disabled={state.isLoading}
                />
              </div>
              <Button
                type="submit"
                size="icon"
                className="ml-2 h-10 w-10 rounded-full bg-primary text-primary-foreground shadow-md"
                disabled={!message.trim() || state.isLoading}
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
        {/* Tools/Actions Section */}
        <div className="flex w-full items-center px-4 pb-2 pt-1 gap-2 justify-between">
          <div className="flex gap-1">
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="rounded-full"
            >
              <Paperclip className="h-5 w-5" />
            </Button>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="rounded-full"
            >
              <Settings2 className="h-5 w-5" />
            </Button>
          </div>
          <div className="flex gap-1">
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="rounded-full"
            >
              <Mic className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
};
