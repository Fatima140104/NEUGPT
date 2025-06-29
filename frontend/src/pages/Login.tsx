// login page
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { setToken } from "@/lib/auth";
import { useChatSession } from "@/providers/ChatSessionContext";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

function Login() {
  const navigate = useNavigate();
  const { fetchSessions } = useChatSession();
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/mock-login", { method: "POST" });
      const data = await res.json();
      setToken(data.token);
      await fetchSessions();
      navigate("/");
    } catch (err) {
      // Optionally handle error
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center relative">
      <Button className="mb-4" onClick={handleLogin} disabled={loading}>
        {loading ? <LoadingSpinner loadingTitle="Login" /> : "Login"}
      </Button>
    </div>
  );
}

export default Login;
