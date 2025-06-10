// login page
import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";


function Login() {
	const navigate = useNavigate();

	const handleLogin = (e: React.MouseEvent<HTMLButtonElement>) => {
		e.preventDefault();
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