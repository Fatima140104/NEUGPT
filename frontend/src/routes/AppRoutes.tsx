import { Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import AuthSuccess from "@/pages/AuthSuccess";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/c/:sessionId" element={<Home />} />
      <Route path="/auth/success" element={<AuthSuccess />} />
    </Routes>
  );
};

export default AppRoutes;
