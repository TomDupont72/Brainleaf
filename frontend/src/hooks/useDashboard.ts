import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useNavigate } from "react-router-dom";

export function useDashboard() {
    const navigate = useNavigate();

    const session = JSON.parse(localStorage.getItem("session") || "null");

    const [username, setUsername] = useState("");

    async function logout() {
        try {
            await authClient.signOut();
            localStorage.removeItem("session");
            setTimeout(() => {
                navigate("/auth", { replace: true });
            }, 100);
        } catch (error) {
            console.error("[Dashboard.onLogout failed]", error);
        }
    }

    useEffect(() => {
        setUsername(session.user.name);
    }, [session]);

    return {
        username,
        logout
    }
}