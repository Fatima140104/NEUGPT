import { BrowserRouter } from "react-router-dom";
import { ChatProvider } from "@/providers/ChatContext";
import { ChatSessionProvider } from "@/providers/ChatSessionContext";
import AppRoutes from "@/routes/AppRoutes";
import { ChatFormProvider } from "./providers/ChatFormContext";
import { MessageProvider } from "./providers/MessageContext";
import * as RadixToast from "@radix-ui/react-toast";
import Toast from "./components/ui/toast";

function App() {
  return (
    <BrowserRouter>
      <RadixToast.Provider>
        <ChatSessionProvider>
          <ChatFormProvider>
            <ChatProvider>
              <MessageProvider>
                <AppRoutes />
              </MessageProvider>
            </ChatProvider>
          </ChatFormProvider>
        </ChatSessionProvider>
        <Toast />
        <RadixToast.Viewport className="fixed top-15 left-4/7 -translate-x-1/2 z-50" />
      </RadixToast.Provider>
    </BrowserRouter>
  );
}

export default App;
