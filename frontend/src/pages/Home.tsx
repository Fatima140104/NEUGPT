import { useEffect } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "@/components/chat-sidebar";
import { ChatView } from "@/components/Chat/ChatView";
import { useChatSession } from "@/providers/ChatSessionContext";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Loader2 } from "lucide-react";

function Home() {
  const { sessionId } = useParams();
  const { state, selectSession } = useChatSession();

  useEffect(() => {
    if (sessionId && state.selectedSessionId !== sessionId) {
      selectSession(sessionId);
    }
  }, [sessionId, state.selectedSessionId, selectSession]);

  const selectedSession = state.sessions?.find(
    (c) => c._id === state.selectedSessionId
  );
  const selectedTitle = selectedSession?.title || "New Chat";

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
      <div className="flex min-h-screen w-full">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="border-b p-4 flex items-center gap-2">
            <SidebarTrigger />
            <h1 className="font-semibold">{selectedTitle}</h1>
          </header>
          <ChatView />
        </div>
      </div>
    </SidebarProvider>
  );
}

export default Home;
