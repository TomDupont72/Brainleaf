import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { usePageHeader } from "../usePageHeader";
import { authClient } from "../../lib/auth-client";

const navigateMock = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
  return {
    ...actual,
    useNavigate: () => navigateMock
  };
});

vi.mock("@/lib/auth-client", () => ({
  authClient: {
    useSession: vi.fn(),
    signOut: vi.fn()
  }
}));

const authSession = {
  user: {
    id: "1",
    email: "john@example.com",
    name: "John"
  },
  session: {
    id: "session-1",
    userId: "1",
    expiresAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    token: "token"
  }
};

describe("usePageHeader", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    vi.mocked(authClient.useSession).mockReturnValue({ data: null } as ReturnType<typeof authClient.useSession>);
  });

  it("retourne username depuis la session et theme depuis le localStorage", () => {
    vi.mocked(authClient.useSession).mockReturnValue({ data: authSession } as ReturnType<typeof authClient.useSession>);
    localStorage.setItem("theme", "light");

    const { result } = renderHook(() => usePageHeader());

    expect(result.current.username).toBe("John");
    expect(result.current.theme).toBe("light");
  });

  it("retourne des valeurs par defaut sans session ni theme", () => {
    const { result } = renderHook(() => usePageHeader());

    expect(result.current.username).toBe("");
    expect(result.current.theme).toBe("dark");
  });

  it("logout deconnecte et navigue vers auth", async () => {
    vi.mocked(authClient.signOut).mockResolvedValue(undefined);

    const { result } = renderHook(() => usePageHeader());

    await act(async () => {
      await result.current.logout();
    });

    expect(authClient.signOut).toHaveBeenCalledTimes(1);
    expect(navigateMock).toHaveBeenCalledWith("/auth", { replace: true });
  });

  it("navigateToDashboard navigue vers dashboard si une session existe", () => {
    vi.mocked(authClient.useSession).mockReturnValue({ data: authSession } as ReturnType<typeof authClient.useSession>);

    const { result } = renderHook(() => usePageHeader());

    act(() => {
      result.current.navigateToDashboard();
    });

    expect(navigateMock).toHaveBeenCalledWith("/dashboard");
  });

  it("navigateToDashboard ne fait rien sans session", () => {
    const { result } = renderHook(() => usePageHeader());

    act(() => {
      result.current.navigateToDashboard();
    });

    expect(navigateMock).not.toHaveBeenCalled();
  });
});
