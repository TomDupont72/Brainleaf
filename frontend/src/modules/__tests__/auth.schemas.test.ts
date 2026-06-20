import { describe, it, expect } from "vitest";
import { SignInSchema, RegisterSchema } from "../auth.schemas";

describe("SignInSchema", () => {
  it("valide des identifiants corrects", () => {
    const result = SignInSchema.safeParse({
      email: "john@example.com",
      password: "password123"
    });

    expect(result.success).toBe(true);
  });

  it("rejette un email invalide", () => {
    const result = SignInSchema.safeParse({
      email: "john",
      password: "password123"
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe("Email invalide.");
    }
  });

  it("rejette un mot de passe trop court", () => {
    const result = SignInSchema.safeParse({
      email: "john@example.com",
      password: "short"
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe("Le mot de passe est trop court.");
    }
  });

  it("rejette un mot de passe vide après trim", () => {
    const result = SignInSchema.safeParse({
      email: "john@example.com",
      password: "          "
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe("Le mot de passe est trop court.");
    }
  });
});

describe("RegisterSchema", () => {
  it("valide des données d'inscription correctes", () => {
    const result = RegisterSchema.safeParse({
      email: "new@example.com",
      password: "password123",
      passwordConfirm: "password123",
      username: "NewUser"
    });

    expect(result.success).toBe(true);
  });

  it("rejette un username vide après trim", () => {
    const result = RegisterSchema.safeParse({
      email: "new@example.com",
      password: "password123",
      passwordConfirm: "password123",
      username: "   "
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe("Le nom d'utilisateur ne doit pas être vide.");
    }
  });

  it("rejette des mots de passe différents", () => {
    const result = RegisterSchema.safeParse({
      email: "new@example.com",
      password: "password123",
      passwordConfirm: "different123",
      username: "NewUser"
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe("Les mots de passe ne correspondent pas.");
    }
  });
});
