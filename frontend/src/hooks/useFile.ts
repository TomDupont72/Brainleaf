import { useState, useCallback, useEffect } from "react";
import { apiFileFilesByKey } from "../api/files";

type FileMetadataData = {
  id: number;
  fileName: string;
  fileKey: string;
  size: number;
  createdAt: Date;
  status: string;
};

type FileContentData = {
  id: number;
  fileId: number;
  summary: string;
  revisionSheet: string;
};

type FileQuestionData = {
  id: number;
  fileId: number;
  question: string;
  answer: string;
};

type FileData = {
  fileMetadata: FileMetadataData;
  fileContent: FileContentData;
  fileQuestions: FileQuestionData[];
};

export function useFile(fileKey: string) {
  const [file, setFile] = useState<FileData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getCurrentFile = useCallback(async (fileKey: string, withLoading: boolean) => {
    setError(null);
    if (withLoading) setLoading(true);

    try {
      const data = await apiFileFilesByKey(fileKey);

      setFile(data.file);

      return data.file;
    } catch (error) {
      console.error("[useFile.getCurrentFile] failed", error);
      setError("Impossible de récupérer le fichier.");
    } finally {
      if (withLoading) setLoading(false);
    }
  }, []);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    const fetchInitial = async () => {
      const data = await getCurrentFile(fileKey, true);

      if (!data) return;

      if (data.fileMetadata.status === "error")
        setError("Une erreur à eu lieu dans l'analyse du fichier");

      if (data.fileMetadata.status === "processing") {
        interval = setInterval(async () => {
          const updated = await getCurrentFile(fileKey, false);

          if (!updated) return;

          if (updated.fileMetadata.status !== "processing" && interval) {
            clearInterval(interval);
          }
        }, 2000);
      }
    };

    fetchInitial();

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [getCurrentFile, fileKey]);

  return {
    file,
    loading,
    error,
    setError
  };
}
