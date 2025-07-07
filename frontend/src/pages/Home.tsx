import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "@/components/chat-sidebar";
import { ChatView } from "@/components/Chat/ChatView";
import { useChatSession } from "@/providers/ChatSessionContext";
import { SidebarProvider } from "@/components/ui/sidebar";
import { getToken } from "@/lib/auth";
import LoginDialog from "@/components/LoginDialog";

function Home() {
  const { sessionId } = useParams();
  const { state, selectSession, fetchSessions } = useChatSession();
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const checkAuth = () => {
    const token = getToken();
    setIsAuthenticated(!!token);
    if (!token) {
      setShowLoginDialog(true);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (getToken()) {
      fetchSessions();
    }
  }, [fetchSessions]);

  useEffect(() => {
    if (sessionId && getToken()) {
      if (state.selectedSessionId !== sessionId) {
        selectSession(sessionId);
      }
    }
  }, [sessionId, state.selectedSessionId, state.sessions, selectSession]);

  const handleLoginSuccess = () => {
    checkAuth();
  };

  return (
    <>
      <SidebarProvider defaultOpen={true}>
        <div className="relative flex h-screen w-full">
          <Sidebar />
          <div className="flex-1 flex min-h-0 flex-col overflow-hidden">
            <ChatView sessionId={sessionId} />
          </div>
        </div>
      </SidebarProvider>

      {!isAuthenticated && (
        <LoginDialog 
          open={showLoginDialog} 
          onOpenChange={setShowLoginDialog}
          onLoginSuccess={handleLoginSuccess}
          forceOpen={true}
        />
      )}
    </>
  );
}

export default Home;
