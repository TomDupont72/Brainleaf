import { useState, useCallback, useEffect } from "react";
import { apiFileFilesByKey } from "../api/files";

type FileData = {
  id: number;
  fileName: string;
  fileKey: string;
  size: number;
  createdAt: Date;
};

export function useFile(fileKey: string) {
  const [file, setFile] = useState<FileData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getCurrentFile = useCallback(async (fileKey: string) => {
    setError(null);
    setLoading(true);

    try {
      const data = await apiFileFilesByKey(fileKey);

      setFile(data.file);
    } catch (error) {
      console.error("[useFile.getCurrentFile] failed", error);
      setError("Impossible de récupérer le fichier.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    (async () => {
      await getCurrentFile(fileKey);
    })();
  }, [getCurrentFile, fileKey]);

  return {
    file,
    loading,
    error,
    setError
  };
}
