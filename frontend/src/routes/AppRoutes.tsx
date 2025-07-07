import { Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/c/:sessionId" element={<Home />} />
    </Routes>
  );
};

export default AppRoutes;
