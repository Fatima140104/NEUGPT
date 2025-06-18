import Sidebar from "@/components/chat-sidebar";
import { ChatView } from "@/components/Chat/ChatView";
import { useChatSession } from "@/providers/ChatSessionContext";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

function Home() {
  const { state } = useChatSession();
  const selectedSession = state.sessions.find(
    (c) => c._id === state.selectedSessionId
  );
  const selectedTitle = selectedSession?.title || "New Chat";
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full">
        <Sidebar />
        <div className="flex-1 flex flex-col">
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
