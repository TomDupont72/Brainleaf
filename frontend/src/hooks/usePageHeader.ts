import { authClient } from "@/lib/auth-client";
import { useNavigate } from "react-router-dom";

export function usePageHeader() {
  const navigate = useNavigate();

  const session = JSON.parse(localStorage.getItem("session") || "null");
  const username = session?.user?.name ?? "";

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

  const navigateToDashboard = () => {
    if (session) {
      navigate("/dashboard");
    }
  };

  return {
    username,
    logout,
    navigateToDashboard
  };
}
