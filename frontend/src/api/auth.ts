import { authClient } from "@/lib/auth-client";

type SignUpPayload = {
  email: string;
  password: string;
  name: string;
};

export async function apiSignIn(email: string, password: string) {
  const { data, error } = await authClient.signIn.email({
    email: email,
    password: password
  });

  if (error) {
    throw new Error("Failed to sign in");
  }

  return data;
}

export async function apiSignUp(email: string, password: string, username: string) {
  const { data, error } = await authClient.signUp.email({
    email: email,
    password: password,
    name: username
  } as SignUpPayload);

  if (error) {
    throw new Error("Failed to sign up");
  }

  return data;
}
