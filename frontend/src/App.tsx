import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import { ChatProvider } from "./providers/ChatContext";
import { ChatSessionProvider } from "./providers/ChatSessionContext";
import ProtectedRoute from "./routes/ProtectedRoute";

function App() {
  return (
    <ChatSessionProvider>
      <ChatProvider>
        <BrowserRouter>
          <Routes>
            {/* Public route */}
            <Route path="/login" element={<Login />} />
            {/* Protected routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Home />} />
              <Route path="/c/:sessionId" element={<Home />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ChatProvider>
    </ChatSessionProvider>
  );
}

export default App;
