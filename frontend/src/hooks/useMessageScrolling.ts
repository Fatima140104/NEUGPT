import { useRef, useEffect, useState, useCallback } from "react";
import useScrollToRef from "@/hooks/useScrollToRef";
import { useChat } from "@/providers/ChatContext";

const debounceRate = 150;
// const threshold = 0.85;

export default function useMessageScrolling(
  messagesTree: any[],
  isLoading: boolean
) {
  const scrollableRef = useRef<HTMLDivElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const { dispatch } = useChat();
  const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);

  const debouncedSetShowScrollButton = useCallback((value: boolean) => {
    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current);
    }
    timeoutIdRef.current = setTimeout(() => {
      setShowScrollButton(value);
    }, debounceRate);
  }, []);

  const scrollCallback = () => debouncedSetShowScrollButton(false);

  const { scrollToRef: scrollToBottom, handleSmoothToRef } = useScrollToRef({
    targetRef: messagesEndRef as React.RefObject<HTMLDivElement>,
    callback: scrollCallback,
    smoothCallback: () => {
      scrollCallback();
      dispatch({ type: "SET_ABORT_SCROLL", payload: false });
    },
  });

  useEffect(() => {
    const handleScroll = () => {
      if (!scrollableRef.current || !messagesEndRef.current) return;
      const { scrollTop, scrollHeight, clientHeight } = scrollableRef.current;
      const atBottom = scrollHeight - scrollTop - clientHeight < 30;
      setIsAtBottom(atBottom);
      setShowScrollButton(!atBottom);
    };
    const ref = scrollableRef.current;
    if (ref) {
      ref.addEventListener("scroll", handleScroll);
      return () => ref.removeEventListener("scroll", handleScroll);
    }
  }, []);

  // Auto-scroll to bottom when messages change or loading ends, but only if user is at bottom
  useEffect(() => {
    if (isAtBottom && scrollToBottom) {
      scrollToBottom();
    }
  }, [messagesTree, isLoading, scrollToBottom, isAtBottom]);

  return {
    scrollableRef,
    messagesEndRef,
    scrollToBottom,
    handleSmoothToRef,
    showScrollButton,
    isAtBottom,
  };
}
