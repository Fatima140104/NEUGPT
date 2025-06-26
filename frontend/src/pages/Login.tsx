// login page
import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { setToken } from "@/lib/auth";
import { useChatSession } from "@/providers/ChatSessionContext";

function Login() {
  const navigate = useNavigate();
  const { fetchSessions } = useChatSession();

  const handleLogin = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    // Call the mock login endpoint
    const res = await fetch("/api/mock-login", { method: "POST" });
    const data = await res.json();
    console.log(data);
    setToken(data.token);
    await fetchSessions();
    navigate("/");
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <Button className="mb-4" onClick={handleLogin}>
        Login
      </Button>
    </div>
  );
}

export default Login;
