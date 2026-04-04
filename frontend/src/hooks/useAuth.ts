import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useNavigate } from "react-router-dom";
import { apiSignIn, apiSignUp } from "@/api/auth";
import { usePageHeader } from "./usePageHeader";
import { RegisterSchema, SignInSchema } from "@/modules/auth.schemas";
import { useMutation } from "@tanstack/react-query";

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

  const [formError, setFormError] = useState<string | null>(null);

  const signInMutation = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const formData = {
        email,
        password
      };

      const result = SignInSchema.safeParse(formData);

      if (!result.success) {
        const firstIssue = result.error.issues[0];
        throw new Error(firstIssue?.message ?? "Formulaire invalide.");
      }

      return apiSignIn(result.data.email, result.data.password);
    },
    onSuccess: (data) => {
      localStorage.setItem(
        "session",
        JSON.stringify({
          user: {
            email: data.user.email,
            name: data.user.name,
            id: data.user.id
          },
          createdAt: data.user.createdAt,
          theme
        } as AppSession)
      );

      localStorage.setItem("theme", theme);
      navigate("/dashboard", { replace: true });
    },
    onError: (error) => {
      console.error("[useAuth.signIn] failed", error);
      setFormError(error instanceof Error ? error.message : "Impossible de se connecter.");
    }
  });

  const registerMutation = useMutation({
    mutationFn: async ({
      email,
      password,
      passwordConfirm,
      username
    }: {
      email: string;
      password: string;
      passwordConfirm: string;
      username: string;
    }) => {
      const formData = {
        email,
        password,
        passwordConfirm,
        username
      };

      const result = RegisterSchema.safeParse(formData);

      if (!result.success) {
        const firstIssue = result.error.issues[0];
        throw new Error(firstIssue?.message ?? "Formulaire invalide.");
      }

      return apiSignUp(result.data.email, result.data.password, result.data.username);
    },
    onSuccess: (data) => {
      localStorage.setItem(
        "session",
        JSON.stringify({
          user: {
            email: data.user.email,
            name: data.user.name,
            id: data.user.id
          },
          createdAt: data.user.createdAt,
          theme
        } as AppSession)
      );

      localStorage.setItem("theme", theme);
      navigate("/dashboard", { replace: true });
    },
    onError: (error) => {
      console.error("[useAuth.register] failed", error);
      setFormError(error instanceof Error ? error.message : "Impossible de s'inscrire.");
    }
  });

  async function signIn(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);

    await signInMutation.mutateAsync({
      email: emailSI,
      password: passwordSI
    });
  }

  async function register(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);

    await registerMutation.mutateAsync({
      email: emailR,
      password: passwordR,
      passwordConfirm: passwordConfirmR,
      username: usernameR
    });
  }

  useEffect(() => {
    if (session) {
      localStorage.setItem(
        "session",
        JSON.stringify({
          user: {
            email: session.user.email,
            name: session.user.name,
            id: session.user.id
          },
          expiresAt: session.session.expiresAt,
          createdAt: session.user.createdAt,
          theme
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
    loading: signInMutation.isPending || registerMutation.isPending,
    error: formError,
    setError: setFormError,
    signIn,
    register,
    theme
  };
}
