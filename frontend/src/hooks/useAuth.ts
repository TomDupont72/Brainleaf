import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useNavigate } from "react-router-dom";
import { apiSignIn, apiSignUp } from "@/api/auth";
import { usePageHeader } from "./usePageHeader";
import { RegisterSchema, SignInSchema } from "@/modules/auth.schemas";

type AppSession = {
  user: {
    id: string;
    email: string;
    name: string;
  };
  token: string;
  createdAt: Date;
  expiresAt?: Date;
  theme: "dark" | "light";
};

export function useAuth() {
  const navigate = useNavigate();

  const { theme } = usePageHeader();

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

    const formData = {
      email: emailSI,
      password: passwordSI
    };

    const result = SignInSchema.safeParse(formData);

    if (!result.success) {
      const firstIssue = result.error.issues[0];
      setError(firstIssue?.message ?? "Formulaire invalide.");
      setLoading(false);
      return;
    }

    try {
      const data = await apiSignIn(result.data.email, result.data.password);

      localStorage.setItem(
        "session",
        JSON.stringify({
          user: { email: data.user.email, name: data.user.name, id: data.user.id },
          createdAt: data.user.createdAt
        } as AppSession)
      );

      localStorage.setItem("theme", theme);

      navigate("/dashboard", { replace: true });
    } catch (error) {
      console.error("[useAuth.onSignIn failed]", error);
      setError("Impossible de se connecter.");
    } finally {
      setLoading(false);
    }
  }

  async function register(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = {
      email: emailR,
      password: passwordR,
      passwordConfirm: passwordConfirmR,
      username: usernameR
    }

    const result = RegisterSchema.safeParse(formData);

    if (!result.success) {
      const firstIssue = result.error.issues[0];
      setError(firstIssue?.message ?? "Formulaire invalide.");
      setLoading(false);
      return;
    }

    try {
      const data = await apiSignUp(result.data.email, result.data.password, result.data.username);

      localStorage.setItem(
        "session",
        JSON.stringify({
          user: { email: data.user.email, name: data.user.name, id: data.user.id },
          createdAt: data.user.createdAt
        } as AppSession)
      );

      localStorage.setItem("theme", theme);

      navigate("/dashboard", { replace: true });
    } catch (error) {
      console.error("[useAuth.onRegister failed]", error);
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
          createdAt: session.user.createdAt,
          theme: theme
        } as AppSession)
      );
      navigate("/dashboard", { replace: true });
    }
    localStorage.setItem("theme", theme);
  }, [session, navigate, theme]);

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
    register,
    theme
  };
}
