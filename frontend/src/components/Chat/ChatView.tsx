import React, { useEffect, useState } from "react";
import { MessageView } from "@/components/Chat/MessageView";
import { ChatForm } from "@/components/Chat/ChatForm";
import { useChat } from "@/providers/ChatContext";
import { useAuthFetch } from "@/hooks/useAuthFetch";
import { cn } from "@/lib/utils";
import { Landing } from "@/components/Chat/Landing";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useChatSession } from "@/providers/ChatSessionContext";
import Header from "@/components/Chat/Header";
import { DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";

interface ChatViewProps {
  sessionId: string | undefined;
}

export const ChatView: React.FC<ChatViewProps> = ({ sessionId }) => {
  const { state: chatState, dispatch } = useChat();
  const { state } = useChatSession();
  const { messageTree } = chatState;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const authFetch = useAuthFetch();
  const navigate = useNavigate();

  useEffect(() => {
    if (!sessionId || sessionId === "new") {
      dispatch({ type: "SET_MESSAGES", payload: [] });
      return;
    }
    setLoading(true);
    setError(null);
    authFetch(`/chats/session/${sessionId}`)
      .then((res) => {
        dispatch({ type: "SET_MESSAGES", payload: res.data });
      })
      .catch((err) => {
        if (err.response?.status === 403) {
          navigate("/");
        }
        if (err.response?.status !== 401) {
          setError(err.message || "Failed to fetch messages");
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, [sessionId, dispatch, authFetch]);

  const selectedSession =
    sessionId === "new"
      ? { title: "Cuộc trò chuyện mới" }
      : state.sessions?.find((c) => c._id === sessionId);

  const selectedTitle = selectedSession?.title || "Bắt đầu cuộc trò chuyện mới";
  let content: React.ReactNode;
  const isLandingPage =
    (!messageTree || messageTree.length === 0) &&
    (!sessionId || sessionId === "new");

  const [showSpinner, setShowSpinner] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout | null = null;
    if (loading) {
      setShowSpinner(false);
      timeout = setTimeout(() => setShowSpinner(true), 500);
    } else {
      setShowSpinner(false);
    }
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [loading]);

  if (loading && !isLandingPage) {
    content = showSpinner ? (
      <LoadingSpinner />
    ) : (
      <div className="flex h-full items-center justify-center">
        <span className="block w-full h-full" />
      </div>
    );
  } else if (error) {
    content = (
      <div className="flex h-full items-center justify-center py-10">
        <p className="text-red-500">{error}</p>
      </div>
    );
  } else if (isLandingPage) {
    content = <Landing />;
  } else {
    content = <MessageView />;
  }

  return (
    <div className="flex h-full w-full flex-col">
      <Header selectedTitle={selectedTitle} sessionId={sessionId} />
      <DropdownMenuSeparator />
      <>
        <div
          className={cn(
            "flex flex-col",
            isLandingPage
              ? "flex-1 items-center justify-end sm:justify-center"
              : "h-full overflow-y-auto"
          )}
        >
          {content}
          <div
            className={cn(
              "relative w-full z-20",
              isLandingPage &&
                "max-w-3xl transition-all duration-200 xl:max-w-4xl"
            )}
          >
            <ChatForm />
          </div>
        </div>
      </>
    </div>
  );
};
