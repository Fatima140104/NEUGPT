import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import { ChatProvider } from "./providers/ChatContext";
import { ChatSessionProvider } from "./providers/ChatSessionContext";

function App() {
  return (
    <ChatSessionProvider>
      <ChatProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/c/:sessionId" element={<Home />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </BrowserRouter>
      </ChatProvider>
    </ChatSessionProvider>
  );
}

export default App;
