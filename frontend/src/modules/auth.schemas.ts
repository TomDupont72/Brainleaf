import { z } from "zod";

const AuthSchema = z.object({
    email: z.email("Email invalide."),
    password: z.string().trim().min(10, "Le mot de passe est trop court."),
    username: z.string().trim().min(1, "Le nom d'utilisateur ne doit pas être vide."),
    passwordConfirm: z.string()
})

export const SignInSchema = AuthSchema.pick({
    email: true,
    password: true
})

export const RegisterSchema = AuthSchema.pick({
    email: true,
    password: true,
    username: true,
    passwordConfirm: true
}).refine(
    (data) => data.password === data.passwordConfirm, {
        message: "Les mots de passe ne correspondent pas.",
        path: ["confirmPassword"],
    }
)