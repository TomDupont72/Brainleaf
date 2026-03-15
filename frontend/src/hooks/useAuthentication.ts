import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useNavigate } from "react-router-dom";
import { apiSignIn, apiSignUp } from "@/api/auth";

type AppSession = {
  user: {
    id: string;
    email: string;
    name: string;
  };
  token: string;
  createdAt: Date;
  expiresAt?: Date;
};

export function useAuthentication() {
  const navigate = useNavigate();

  const { data: session } = authClient.useSession();

  const [log, setLog] = useState<"signIn" | "register">("signIn");

  const [emailSI, setEmailSI] = useState("");
  const [passwordSI, setPasswordSI] = useState("");

  const [usernameR, setUsernameR] = useState("");
  const [emailR, setEmailR] = useState("");
  const [passwordR, setPasswordR] = useState("");
  const [passwordConfirmR, setPasswordConfirmR] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function signIn(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await apiSignIn(emailSI, passwordSI);

      localStorage.setItem(
        "session",
        JSON.stringify({
          user: { email: data.user.email, name: data.user.name, id: data.user.id },
          createdAt: data.user.createdAt
        } as AppSession)
      );

      navigate("/dashboard", { replace: true });
    } catch (error) {
      console.error("[useAuthentication.onSignIn failed]", error);
      setError("Impossible de se connecter.");
    } finally {
      setLoading(false);
    }
  }

  async function register(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (passwordR !== passwordConfirmR) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    try {
      const data = await apiSignUp(emailR, passwordR, usernameR);

      localStorage.setItem(
        "session",
        JSON.stringify({
          user: { email: data.user.email, name: data.user.name, id: data.user.id },
          createdAt: data.user.createdAt
        } as AppSession)
      );

      navigate("/dashboard", { replace: true });
    } catch (error) {
      console.error("[useAuthentication.onRegister failed]", error);
      setError("Impossible de s'inscrire.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (session) {
      localStorage.setItem(
        "session",
        JSON.stringify({
          user: { email: session.user.email, name: session.user.name, id: session.user.id },
          expiresAt: session.session.expiresAt,
          createdAt: session.user.createdAt
        } as AppSession)
      );
      navigate("/dashboard", { replace: true });
    }
  }, [session, navigate]);

  return {
    log,
    setLog,
    emailSI,
    setEmailSI,
    passwordSI,
    setPasswordSI,
    usernameR,
    setUsernameR,
    emailR,
    setEmailR,
    passwordR,
    setPasswordR,
    passwordConfirmR,
    setPasswordConfirmR,
    loading,
    error,
    setError,
    signIn,
    register
  };
}
