import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuth } from "../useAuth";
import * as authApi from "@/api/auth";
import { authClient } from "@/lib/auth-client";
import * as pageHeaderHook from "../usePageHeader";

const navigateMock = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
  return {
    ...actual,
    useNavigate: () => navigateMock
  };
});

vi.mock("@/api/auth", () => ({
  apiSignIn: vi.fn(),
  apiSignUp: vi.fn()
}));

vi.mock("@/lib/auth-client", () => ({
  authClient: {
    useSession: vi.fn()
  }
}));

vi.mock("../usePageHeader", () => ({
  usePageHeader: vi.fn()
}));

describe("useAuth", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();

    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false
        },
        mutations: {
          retry: false
        }
      }
    });

    vi.mocked(pageHeaderHook.usePageHeader).mockReturnValue({
        theme: "dark",
        username: "",
        logout: vi.fn().mockResolvedValue(undefined),
        navigateToDashboard: vi.fn()
    });

    vi.mocked(authClient.useSession).mockReturnValue({
        data: null,
        isPending: false,
        isRefetching: false,
        error: null,
        refetch: vi.fn()
    });

    vi.mocked(authApi.apiSignIn).mockResolvedValue({
        token: "fake-token",
        redirect: false,
        user: {
            id: "1",
            email: "john@example.com",
            name: "John",
            createdAt: new Date("2026-01-01"),
            updatedAt: new Date("2026-01-01"),
            emailVerified: false,
            image: null
        }
    });

    vi.mocked(authApi.apiSignUp).mockResolvedValue({
      token: "fake-token",
        user: {
            id: "1",
            email: "john@example.com",
            name: "John",
            createdAt: new Date("2026-01-01"),
            updatedAt: new Date("2026-01-01"),
            emailVerified: false,
            image: null
        }
    });
  });

  afterEach(() => {
    queryClient.clear();
  });

  function wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }

  it("connecte l'utilisateur, stocke la session et navigue vers dashboard", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    act(() => {
      result.current.setEmailSI("john@example.com");
      result.current.setPasswordSI("password123");
    });

    const fakeEvent = {
      preventDefault: vi.fn()
    } as unknown as React.SyntheticEvent<HTMLFormElement>;

    await act(async () => {
      await result.current.signIn(fakeEvent);
    });

    await waitFor(() => {
      expect(authApi.apiSignIn).toHaveBeenCalledWith("john@example.com", "password123");
    });

    expect(fakeEvent.preventDefault).toHaveBeenCalled();

    const storedSession = JSON.parse(localStorage.getItem("session") || "null");
    expect(storedSession).not.toBeNull();
    expect(storedSession.user.email).toBe("john@example.com");
    expect(storedSession.user.name).toBe("John");
    expect(storedSession.user.id).toBe("1");
    expect(storedSession.theme).toBe("dark");

    expect(localStorage.getItem("theme")).toBe("dark");
    expect(navigateMock).toHaveBeenCalledWith("/dashboard", { replace: true });
    expect(result.current.error).toBeNull();
  });

  it("retourne une erreur de validation si le sign in est invalide", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    act(() => {
      result.current.setEmailSI("");
      result.current.setPasswordSI("");
    });

    const fakeEvent = {
      preventDefault: vi.fn()
    } as unknown as React.SyntheticEvent<HTMLFormElement>;

    await expect(
      act(async () => {
        await result.current.signIn(fakeEvent);
      })
    ).rejects.toThrow();

    expect(fakeEvent.preventDefault).toHaveBeenCalled();
    expect(authApi.apiSignIn).not.toHaveBeenCalled();
    expect(navigateMock).not.toHaveBeenCalled();

    await waitFor(() => {
      expect(result.current.error).not.toBeNull();
    });
  });

  it("inscrit l'utilisateur, stocke la session et navigue vers dashboard", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    act(() => {
      result.current.setUsernameR("NewUser");
      result.current.setEmailR("new@example.com");
      result.current.setPasswordR("password123");
      result.current.setPasswordConfirmR("password123");
    });

    const fakeEvent = {
      preventDefault: vi.fn()
    } as unknown as React.SyntheticEvent<HTMLFormElement>;

    await act(async () => {
      await result.current.register(fakeEvent);
    });

    await waitFor(() => {
      expect(authApi.apiSignUp).toHaveBeenCalledWith(
        "new@example.com",
        "password123",
        "NewUser"
      );
    });

    expect(fakeEvent.preventDefault).toHaveBeenCalled();

    const storedSession = JSON.parse(localStorage.getItem("session") || "null");
    expect(storedSession).not.toBeNull();
    expect(storedSession.user.email).toBe("john@example.com");
    expect(storedSession.user.name).toBe("John");
    expect(storedSession.user.id).toBe("1");
    expect(storedSession.theme).toBe("dark");

    expect(localStorage.getItem("theme")).toBe("dark");
    expect(navigateMock).toHaveBeenCalledWith("/dashboard", { replace: true });
    expect(result.current.error).toBeNull();
  });

  it("retourne une erreur si l'inscription échoue côté API", async () => {
    vi.mocked(authApi.apiSignUp).mockRejectedValue(new Error("Email déjà utilisé"));

    const { result } = renderHook(() => useAuth(), { wrapper });

    act(() => {
      result.current.setUsernameR("NewUser");
      result.current.setEmailR("new@example.com");
      result.current.setPasswordR("password123");
      result.current.setPasswordConfirmR("password123");
    });

    const fakeEvent = {
      preventDefault: vi.fn()
    } as unknown as React.SyntheticEvent<HTMLFormElement>;

    await expect(
      act(async () => {
        await result.current.register(fakeEvent);
      })
    ).rejects.toThrow();

    expect(authApi.apiSignUp).toHaveBeenCalledWith(
      "new@example.com",
      "password123",
      "NewUser"
    );

    await waitFor(() => {
      expect(result.current.error).toBe("Email déjà utilisé");
    });

    expect(navigateMock).not.toHaveBeenCalledWith("/dashboard", { replace: true });
  });

  it("stocke la session existante et navigue vers dashboard si une session est déjà présente", async () => {
    vi.mocked(authClient.useSession).mockReturnValue({
        data: {
            user: {
            id: "99",
            email: "session@example.com",
            name: "SessionUser",
            createdAt: new Date("2026-01-03"),
            updatedAt: new Date("2026-01-03"),
            emailVerified: false,
            image: null
            },
            session: {
            id: "session-1",
            userId: "99",
            createdAt: new Date("2026-01-03"),
            updatedAt: new Date("2026-01-03"),
            expiresAt: new Date("2026-12-31"),
            token: "fake-token",
            ipAddress: null,
            userAgent: null
            }
        },
        isPending: false,
        isRefetching: false,
        error: null,
        refetch: vi.fn()
    });

    renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith("/dashboard", { replace: true });
    });

    const storedSession = JSON.parse(localStorage.getItem("session") || "null");
    expect(storedSession).not.toBeNull();
    expect(storedSession.user.email).toBe("session@example.com");
    expect(storedSession.user.name).toBe("SessionUser");
    expect(storedSession.user.id).toBe("99");
    expect(storedSession.theme).toBe("dark");
    expect(localStorage.getItem("theme")).toBe("dark");
  });

  it("stocke le theme même sans session", async () => {
    renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(localStorage.getItem("theme")).toBe("dark");
    });

    expect(localStorage.getItem("session")).toBeNull();
    expect(navigateMock).not.toHaveBeenCalled();
  });

  it("permet de changer le mode log", () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.log).toBe("signIn");

    act(() => {
      result.current.setLog("register");
    });

    expect(result.current.log).toBe("register");
  });

  it("permet de définir une erreur manuelle avec setError", () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    act(() => {
      result.current.setError("Erreur custom");
    });

    expect(result.current.error).toBe("Erreur custom");
  });
});