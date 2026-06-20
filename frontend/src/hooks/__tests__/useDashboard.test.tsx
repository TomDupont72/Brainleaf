import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { useDashboard } from "../useDashboard";

import * as filesApi from "../../api/files";

const navigateMock = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
  return {
    ...actual,
    useNavigate: () => navigateMock
  };
});

vi.mock("@/api/files", () => ({
  apiFileFiles: vi.fn(),
  apiFileCountFiles: vi.fn(),
  apiFileUpload: vi.fn(),
  apiFileDelete: vi.fn()
}));

describe("useDashboard", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();

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

    vi.spyOn(queryClient, "invalidateQueries");

    vi.mocked(filesApi.apiFileFiles).mockResolvedValue({
      files: []
    });

    vi.mocked(filesApi.apiFileCountFiles).mockResolvedValue({
      filesCount: 0
    });
  });

  function wrapper({ children }: { children: React.ReactNode }) {
    return (
      <MemoryRouter initialEntries={["/dashboard?page=1"]}>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </MemoryRouter>
    );
  }

  it("upload un fichier, invalide le cache et navigue vers la page du fichier", async () => {
    vi.mocked(filesApi.apiFileUpload).mockResolvedValue({
      file: {
        fileKey: "abc123"
      }
    });

    const { result } = renderHook(() => useDashboard(), { wrapper });

    const file = new File(["hello"], "test.pdf", { type: "application/pdf" });

    act(() => {
      result.current.setFileName("test.pdf");
    });

    await act(async () => {
      await result.current.uploadFile(file);
    });

    await waitFor(() => {
      expect(filesApi.apiFileUpload).toHaveBeenCalledTimes(1);
    });

    const uploadedFormData = vi.mocked(filesApi.apiFileUpload).mock.calls[0][0];
    expect(uploadedFormData).toBeInstanceOf(FormData);

    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ["files"]
    });

    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ["filesCount"]
    });

    expect(navigateMock).toHaveBeenCalledWith("/file/abc123");

    expect(result.current.error).toBeNull();
    expect(result.current.file).toBeNull();
  });

  it("retourne une erreur si le nom du fichier est vide", async () => {
    vi.mocked(filesApi.apiFileUpload).mockResolvedValue({
      file: {
        fileKey: "abc123"
      }
    });

    const { result } = renderHook(() => useDashboard(), { wrapper });

    const file = new File([""], "test.pdf", { type: "application/pdf" });

    await expect(
      act(async () => {
        await result.current.uploadFile(file);
      })
    ).rejects.toThrow();

    expect(filesApi.apiFileUpload).not.toHaveBeenCalled();
    expect(navigateMock).not.toHaveBeenCalled();

    await waitFor(() => {
      expect(result.current.error).not.toBeNull();
    });
  });

  it("supprime un fichier, invalide le cache", async () => {
    vi.mocked(filesApi.apiFileDelete).mockResolvedValue(undefined);

    const { result } = renderHook(() => useDashboard(), { wrapper });

    const fileKey = "abc123";

    await act(async () => {
      await result.current.deleteFile(fileKey);
    });

    await waitFor(() => {
      expect(filesApi.apiFileDelete).toHaveBeenCalledTimes(1);
    });

    expect(filesApi.apiFileDelete).toHaveBeenCalledWith(fileKey);

    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ["files"]
    });

    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ["filesCount"]
    });

    expect(result.current.error).toBeNull();
  });

  it("retourne une erreur si la suppression échoue", async () => {
    vi.mocked(filesApi.apiFileDelete).mockRejectedValue(new Error("Delete failed"));

    const { result } = renderHook(() => useDashboard(), { wrapper });

    await expect(
      act(async () => {
        await result.current.deleteFile("abc123");
      })
    ).rejects.toThrow();

    expect(filesApi.apiFileDelete).toHaveBeenCalledWith("abc123");

    await waitFor(() => {
      expect(result.current.error).toBe("Impossible de supprimer le fichier.");
    });

    expect(queryClient.invalidateQueries).not.toHaveBeenCalled();
  });

  it("met à jour la page courante quand setCurrentPage est appelé", async () => {
    const { result } = renderHook(() => useDashboard(), { wrapper });

    expect(result.current.currentPage).toBe(1);

    act(() => {
      result.current.setCurrentPage(3);
    });

    await waitFor(() => {
      expect(result.current.currentPage).toBe(3);
    });
  });

  it("navigue vers la page du fichier", () => {
    const { result } = renderHook(() => useDashboard(), { wrapper });

    const fileKey = "abc123";

    act(() => {
      result.current.navigateToFile(fileKey);
    });

    expect(navigateMock).toHaveBeenCalledWith("/file/abc123");
  });
});
