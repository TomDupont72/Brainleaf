import { apiFileDelete, apiFileFiles, apiFileUpload } from "@/api/files";
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

type FileData = {
  id: number;
  fileName: string;
  fileKey: string;
  size: number;
  createdAt: string;
};

export function useDashboard() {
  const navigate = useNavigate();

  const [file, setFile] = useState<File | null>(null);
  const [files, setFiles] = useState<FileData[]>([]);
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function uploadFile(file: File) {
    setError(null);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file, fileName);

      const data = await apiFileUpload(formData);

      setFile(null);
      setFileName("");

      navigate(`/file/${data.file.fileKey}`);
    } catch (error) {
      console.error("[useDashboard.uploadFile] failed", error);
      setError("L'upload a échoué.");
    } finally {
      setLoading(false);
    }
  }

  const getFiles = useCallback(async () => {
    setError(null);
    setLoading(true);

    try {
      const data = await apiFileFiles();

      return data;
    } catch (error) {
      console.error("[useDashboard.getFiles] failed", error);
      setError("Impossible de récupérer les fichiers.");
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteFile = async (fileKey: string) => {
    setError(null);
    setLoading(true);

    try {
      await apiFileDelete(fileKey);

      setFiles((prev) => prev.filter((f) => f.fileKey !== fileKey));
    } catch (error) {
      console.error("[useDashboard.deleteFile] failed", error);
      setError("Impossible de supprimer le fichier.");
    } finally {
      setLoading(false);
    }
  };

  const navigateToFile = (fileKey: string) => {
    navigate(`/file/${fileKey}`);
  };

  useEffect(() => {
    (async () => {
      const filesData = await getFiles();
      setFiles(filesData.files);
    })();
  }, [getFiles]);

  return {
    uploadFile,
    file,
    setFile,
    files,
    setFileName,
    deleteFile,
    navigateToFile,
    loading,
    error,
    setError
  };
}
