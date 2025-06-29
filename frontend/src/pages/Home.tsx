import { useEffect } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "@/components/chat-sidebar";
import { ChatView } from "@/components/Chat/ChatView";
import { useChatSession } from "@/providers/ChatSessionContext";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Loader2 } from "lucide-react";

function Home() {
  const { sessionId } = useParams();
  const { state, selectSession, fetchSessions } = useChatSession();

  useEffect(() => {
    // Initial fetch of sessions
    fetchSessions();
  }, [fetchSessions]);

  useEffect(() => {
    if (sessionId) {
      // If the URL has a session ID, select it.
      // This includes 'new' for a new chat.
      if (state.selectedSessionId !== sessionId) {
        selectSession(sessionId);
      }
    }
    // } else if (!state.selectedSessionId && state.sessions.length > 0) {
    //   // If no session is selected and sessions exist, select the most recent one.
    //   selectSession(state.sessions[0]._id);
    // }
  }, [sessionId, state.selectedSessionId, state.sessions, selectSession]);

  if (state.loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center space-y-2">
          <p className="text-destructive">Error loading sessions</p>
          <p className="text-sm text-muted-foreground">{state.error}</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="relative flex h-screen w-full">
        <Sidebar />
        <div className="flex-1 flex min-h-0 flex-col overflow-hidden">
          <ChatView sessionId={sessionId} />
        </div>
      </div>
    </SidebarProvider>
  );
}

export default Home;
