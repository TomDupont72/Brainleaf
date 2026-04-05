import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useFile } from "../useFile";
import * as filesApi from "../../api/files";

vi.mock("@/api/files", () => ({
  apiFileFilesByKey: vi.fn()
}));

describe("useFile", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();

    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false
        }
      }
    });

    vi.mocked(filesApi.apiFileFilesByKey).mockResolvedValue({
      file: {
        fileMetadata: {
          id: 1,
          fileName: "test.pdf",
          fileKey: "abc123",
          size: 1000,
          createdAt: new Date("2026-01-01"),
          status: "done"
        },
        fileContent: {
          id: 1,
          fileId: 1,
          summary: "Résumé",
          revisionSheet: "Fiche"
        },
        fileQuestions: [
          {
            id: 1,
            fileId: 1,
            question: "Question ?",
            answer: "Réponse"
          }
        ]
      }
    });
  });

  function wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  }

  it("retourne le fichier quand la query réussit", async () => {
    const { result } = renderHook(() => useFile("abc123"), { wrapper });

    await waitFor(() => {
        expect(result.current.loading).toBe(false);
    });

    expect(filesApi.apiFileFilesByKey).toHaveBeenCalledWith("abc123");
    expect(result.current.file).not.toBeNull();
    expect(result.current.file?.fileMetadata.fileKey).toBe("abc123");
    expect(result.current.error).toBeNull();
  });

  it("retourne une erreur si la query échoue", async () => {
    vi.mocked(filesApi.apiFileFilesByKey).mockRejectedValue(new Error("fail"));

    const { result } = renderHook(() => useFile("abc123"), { wrapper });

    await waitFor(() => {
      expect(result.current.error).toBe("Impossible de récupérer le fichier.");
    });

    expect(result.current.file).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it("utilise formError quand setError est appelé", async () => {
    const { result } = renderHook(() => useFile("abc123"), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.setError("Erreur personnalisée");
    });

    expect(result.current.error).toBe("Erreur personnalisée");
  });
});