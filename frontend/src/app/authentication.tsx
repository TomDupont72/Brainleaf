import { Button, Card, FieldLabel, Input } from "@/components/ui/index";
import PageHeader from "@/components/header";
import InputPassword from "@/components/inputPassword";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthentication } from "@/hooks/useAuthentication";
import ErrorAlert from "@/components/errorAlert";

export default function Authentication() {
  const {
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
  } = useAuthentication();

  return (
    <main className="h-screen flex flex-col">
      <div className="px-3 pt-3">
        <PageHeader title="Brainleaf" auth={false} />
      </div>
      <AnimatePresence mode="wait">
        {log === "signIn" ? (
          <div className="flex-1 flex flex-col justify-center items-center">
            <motion.div
              key="login"
              initial={{ opacity: 0, y: 10, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.96 }}
              transition={{ duration: 0.25 }}
            >
              <Card className="min-w-80 flex justify-center items-left mb-2 p-6">
                <form onSubmit={signIn} className="flex flex-col gap-4">
                  <h2 className="text-2xl font-semibold">Se connecter</h2>
                  <FieldLabel htmlFor="emailSI">Email</FieldLabel>
                  <Input
                    id="emailSI"
                    type="email"
                    value={emailSI}
                    onChange={(e) => setEmailSI(e.target.value)}
                    required
                  ></Input>
                  <FieldLabel htmlFor="passwordSI">Mot de passe</FieldLabel>
                  <InputPassword
                    id="passwordSI"
                    value={passwordSI}
                    onChange={(e) => setPasswordSI(e.target.value)}
                  ></InputPassword>
                  <Button type="submit" disabled={loading}>
                    Se connecter
                  </Button>
                </form>
              </Card>
              <div className="flex flex-row items-center justify-center">
                <p className="text-md font-semi text-muted-foreground">Pas encore de compte ?</p>
                <Button variant="link" onClick={() => setLog("register")}>
                  S'inscrire
                </Button>
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
                <form onSubmit={register} className="flex flex-col gap-4">
                  <h2 className="text-2xl font-semibold">S'inscrire</h2>
                  <FieldLabel htmlFor="usernameR">Nom d'utilisateur</FieldLabel>
                  <Input
                    id="usernameR"
                    value={usernameR}
                    onChange={(e) => setUsernameR(e.target.value)}
                    required
                  ></Input>
                  <FieldLabel htmlFor="emailR">Email</FieldLabel>
                  <Input
                    id="emailR"
                    type="email"
                    value={emailR}
                    onChange={(e) => setEmailR(e.target.value)}
                    required
                  ></Input>
                  <FieldLabel htmlFor="passwordR">Mot de passe</FieldLabel>
                  <InputPassword
                    id="passwordR"
                    value={passwordR}
                    onChange={(e) => setPasswordR(e.target.value)}
                  ></InputPassword>
                  <FieldLabel htmlFor="passwordConfirmR">Confirmer le mot de passe</FieldLabel>
                  <InputPassword
                    id="passwordConfirmR"
                    value={passwordConfirmR}
                    onChange={(e) => setPasswordConfirmR(e.target.value)}
                  ></InputPassword>
                  <Button type="submit" disabled={loading}>
                    S'inscrire
                  </Button>
                </form>
              </Card>
              <div className="flex flex-row items-center justify-center">
                <p className="text-md font-semi text-muted-foreground">Déjà un compte ?</p>
                <Button variant="link" onClick={() => setLog("signIn")}>
                  Se connecter
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <ErrorAlert
        error={error}
        className="absolute bottom-8 left-8"
        setErrorToNull={() => setError(null)}
      />
    </main>
  );
}
