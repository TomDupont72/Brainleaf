import { Button, Card, FieldLabel, Input } from "@/components/ui/index"
import PageHeader from "@/components/header"
import InputPassword from "@/components/inputPassword"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { authClient } from "@/lib/auth-client"
import { useNavigate } from "react-router-dom"

type SignUpPayload = {
    email: string,
    password: string,
    name: string
}

export default function Authentification() {
    const navigate = useNavigate();

    const [log, setLog] = useState<"signIn" | "register">("signIn")

    const [emailSI, setEmailSI] = useState("");
    const [passwordSI, setPasswordSI] = useState("");

    const [usernameR, setUsernameR] = useState("");
    const [emailR, setEmailR] = useState("");
    const [passwordR, setPasswordR] = useState("");
    const [passwordConfirmR, setPasswordConfirmR] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function onSignIn(e: React.SyntheticEvent<HTMLFormElement>) {
        e.preventDefault()
        setError(null)
        setLoading(true)

        try {
            const res = await authClient.signIn.email({
                email: emailSI,
                password: passwordSI,
            })

            if (res?.error) {
                setError(res.error.message ?? "Impossible de se connecter.")
                return
            }

            navigate("/dashboard");
        } catch (error) {
            console.error("[Authentification.onSignIn failed]", error);
            setError("Impossible de se connecter.")
        } finally {
            setLoading(false);
        }
    }

    async function onRegister(e: React.SyntheticEvent<HTMLFormElement>) {
        e.preventDefault()
        setError(null)
        setLoading(true)

        if (passwordR !== passwordConfirmR) {
        setError("Les mots de passe ne correspondent pas.")
        return
        }

        try {
            const res = await authClient.signUp.email({
                email: emailR,
                password: passwordR,
                name: usernameR,
            } as SignUpPayload)

            if (res?.error) {
                setError(res.error.message ?? "Impossible de se connecter.")
                return
            }

            navigate("/dashboard");
        } catch (error) {
            console.error("[Authentification.onRegister failed]", error);
            setError("Impossible de s'inscrire.")
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="min-h-screen flex flex-col p-3">
            <PageHeader title="Brainleaf" />
            <AnimatePresence mode="wait">
            { log === "signIn" ? (
            <div className="flex-1 flex flex-col justify-center items-center">
                <motion.div
                key="login"
                initial={{ opacity: 0, y: 10, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.96 }}
                transition={{ duration: 0.25 }}
                >
                <Card className="min-w-80 flex justify-center items-left mb-2 p-6">
                    <form onSubmit={onSignIn} className="flex flex-col gap-4">
                        <h2 className="text-2xl font-semibold">Se connecter</h2>
                        <FieldLabel htmlFor="emailSI">Email</FieldLabel>
                        <Input id="emailSI" type="email" value={emailSI} onChange={(e) => setEmailSI(e.target.value)} required></Input>
                        <FieldLabel htmlFor="passwordSI">Mot de passe</FieldLabel>
                        <InputPassword id="passwordSI" value={passwordSI} onChange={(e) => setPasswordSI(e.target.value)}></InputPassword>
                        {error ? <p className="text-md font-semi">{error}</p> : null}
                        <Button type="submit" variant="outline" disabled={loading}>Se connecter</Button>
                    </form>
                </Card>
                <div className="flex flex-row items-center justify-center">
                    <p className="text-md font-semi text-muted-foreground">Pas encore de compte ?</p>
                    <Button variant="link" onClick={() => setLog("register")}>S'inscrire</Button>
                </div>
                </motion.div>
            </div>
            ) : (
                    
                <div className="flex-1 flex flex-col justify-center items-center">
                    <motion.div
                    key="register"
                    initial={{ opacity: 0, y: 10, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.96 }}
                    transition={{ duration: 0.25 }}
                    >
                    <Card className="min-w-80 flex justify-center items-left mb-2 p-6">
                        <form onSubmit={onRegister} className="flex flex-col gap-4">
                            <h2 className="text-2xl font-semibold">S'inscrire</h2>
                            <FieldLabel htmlFor="usernameR">Nom d'utilisateur</FieldLabel>
                            <Input id="usernameR" value={usernameR} onChange={(e) => setUsernameR(e.target.value)} required></Input>
                            <FieldLabel htmlFor="emailR">Email</FieldLabel>
                            <Input id="emailR" type="email" value={emailR} onChange={(e) => setEmailR(e.target.value)} required></Input>
                            <FieldLabel htmlFor="passwordR">Mot de passe</FieldLabel>
                            <InputPassword id="passwordR" value={passwordR} onChange={(e) => setPasswordR(e.target.value)}></InputPassword>
                            <FieldLabel htmlFor="passwordConfirmR">Confirmer le mot de passe</FieldLabel>
                            <InputPassword id="passwordConfirmR" value={passwordConfirmR} onChange={(e) => setPasswordConfirmR(e.target.value)}></InputPassword>
                            {error ? <p className="text-md font-semi">{error}</p> : null}
                            <Button type="submit" variant="outline"  disabled={loading}>S'inscrire</Button>
                        </form>
                    </Card>
                    <div className="flex flex-row items-center justify-center">
                        <p className="text-md font-semi text-muted-foreground">Déjà un compte ?</p>
                        <Button variant="link" onClick={() => setLog("signIn")}>Se connecter</Button>
                    </div>
                    </motion.div>
                </div>
                    
            )}
            </AnimatePresence>
        </main>
    )
}