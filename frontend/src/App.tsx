import { BrowserRouter } from "react-router-dom";
import { ChatProvider } from "@/providers/ChatContext";
import { ChatSessionProvider } from "@/providers/ChatSessionContext";
import AppRoutes from "@/routes/AppRoutes";
import { ChatFormProvider } from "./providers/ChatFormContext";
import { MessageProvider } from "./providers/MessageContext";

function App() {
  return (
    <BrowserRouter>
      <ChatSessionProvider>
        <ChatFormProvider>
          <ChatProvider>
            <MessageProvider>
              <AppRoutes />
            </MessageProvider>
          </ChatProvider>
        </ChatFormProvider>
      </ChatSessionProvider>
    </BrowserRouter>
  );
}

export default App;
