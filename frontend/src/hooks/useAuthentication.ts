import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useNavigate } from "react-router-dom";

type SignUpPayload = {
    email: string,
    password: string,
    name: string
}

type AppSession = {
    user: {
        id: string;
        email: string;
        name: string;
    },
    token: string;
    createdAt: Date;
    expiresAt?: Date;
}

export function useAuth() {
    const navigate = useNavigate();

    const { data: session } = authClient.useSession();

    const [log, setLog] = useState<"signIn" | "register">("signIn")

    const [emailSI, setEmailSI] = useState("");
    const [passwordSI, setPasswordSI] = useState("");

    const [usernameR, setUsernameR] = useState("");
    const [emailR, setEmailR] = useState("");
    const [passwordR, setPasswordR] = useState("");
    const [passwordConfirmR, setPasswordConfirmR] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function signIn(e: React.SyntheticEvent<HTMLFormElement>) {
        e.preventDefault()
        setError(null)
        setLoading(true)

        try {
            const { data, error } = await authClient.signIn.email({
                email: emailSI,
                password: passwordSI,
            })

            if (error) {
                setError(error.message ?? "Impossible de se connecter.")
                return
            }

            localStorage.setItem("session", JSON.stringify({user: {email: data.user.email, name: data.user.name, id: data.user.id}, token: data.token, createdAt: data.user.createdAt} as AppSession));

            navigate("/dashboard", { replace: true });
        } catch (error) {
            console.error("[Authentification.onSignIn failed]", error);
            setError("Impossible de se connecter.")
        } finally {
            setLoading(false);
        }
    }

    async function register(e: React.SyntheticEvent<HTMLFormElement>) {
        e.preventDefault()
        setError(null)
        setLoading(true)

        if (passwordR !== passwordConfirmR) {
        setError("Les mots de passe ne correspondent pas.")
        return
        }

        try {
            const { data, error } = await authClient.signUp.email({
                email: emailR,
                password: passwordR,
                name: usernameR,
            } as SignUpPayload)

            if (error) {
                setError(error.message ?? "Impossible de s'inscrire.")
                return
            }

            localStorage.setItem("session", JSON.stringify({user: {email: data.user.email, name: data.user.name, id: data.user.id}, token: data.token, createdAt: data.user.createdAt} as AppSession));

            navigate("/dashboard", { replace: true });
        } catch (error) {
            console.error("[Authentification.onRegister failed]", error);
            setError("Impossible de s'inscrire.")
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (session) {
            localStorage.setItem("session", JSON.stringify({user: {email: session.user.email, name: session.user.name, id: session.user.id}, token: session.session.token, expiresAt: session.session.expiresAt, createdAt: session.user.createdAt} as AppSession));
            navigate("/dashboard", { replace: true });
        }
    }, [session, navigate])

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
        signIn,
        register
    };
}