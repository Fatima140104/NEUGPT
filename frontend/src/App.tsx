import { BrowserRouter } from "react-router-dom";
import { ChatProvider } from "./providers/ChatContext";
import { ChatSessionProvider } from "./providers/ChatSessionContext";
import AppRoutes from "./routes/AppRoutes";

function App() {
  return (
    <BrowserRouter>
      <ChatSessionProvider>
        <ChatProvider>
          <AppRoutes />
        </ChatProvider>
      </ChatSessionProvider>
    </BrowserRouter>
  );
}

export default App;
