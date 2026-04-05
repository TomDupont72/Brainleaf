import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
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
    signOut: vi.fn()
  }
}));

describe("usePageHeader", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("retourne username et theme depuis le localStorage", () => {
    localStorage.setItem(
      "session",
      JSON.stringify({
        user: {
          id: "1",
          email: "john@example.com",
          name: "John"
        }
      })
    );
    localStorage.setItem("theme", "light");

    const { result } = renderHook(() => usePageHeader());

    expect(result.current.username).toBe("John");
    expect(result.current.theme).toBe("light");
  });

  it("retourne des valeurs par défaut si le localStorage est vide", () => {
    const { result } = renderHook(() => usePageHeader());

    expect(result.current.username).toBe("");
    expect(result.current.theme).toBe("dark");
  });

  it("logout déconnecte, supprime la session et navigue vers auth", async () => {
    vi.mocked(authClient.signOut).mockResolvedValue(undefined);

    localStorage.setItem(
      "session",
      JSON.stringify({
        user: {
          id: "1",
          email: "john@example.com",
          name: "John"
        }
      })
    );

    const { result } = renderHook(() => usePageHeader());

    await act(async () => {
      await result.current.logout();
    });

    expect(authClient.signOut).toHaveBeenCalledTimes(1);
    expect(localStorage.getItem("session")).toBeNull();

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(navigateMock).toHaveBeenCalledWith("/auth", { replace: true });
  });

  it("navigateToDashboard navigue vers dashboard si une session existe", () => {
    localStorage.setItem(
      "session",
      JSON.stringify({
        user: {
          id: "1",
          email: "john@example.com",
          name: "John"
        }
      })
    );

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