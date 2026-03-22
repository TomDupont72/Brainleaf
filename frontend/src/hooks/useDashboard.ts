import { apiFileCountFiles, apiFileDelete, apiFileFiles, apiFileUpload } from "@/api/files";
import { useEffect, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

type FileData = {
  id: number;
  fileName: string;
  fileKey: string;
  size: number;
  createdAt: string;
};

export function useDashboard() {
  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useSearchParams();

  const [file, setFile] = useState<File | null>(null);
  const [files, setFiles] = useState<FileData[]>([]);
  const [fileName, setFileName] = useState("");
  const [pageNumber, setPageNumber] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const MAX_FILE_SIZE = 10 * 1024 * 1024;
  const MAX_FILE_PER_PAGE = 20;

  const rawPage = Number(searchParams.get("page") ?? "1");
  const currentPage = Number.isNaN(rawPage) || rawPage < 1 ? 1 : rawPage;

  const setCurrentPage = (page: number) => {
    setSearchParams({ page: String(page) });
  };

  async function uploadFile(file: File) {
    setError(null);
    setLoading(true);

    if (file.size > MAX_FILE_SIZE) {
      setError("Le fichier dépasse la taille maximale autorisée (10 Mo).");
      setLoading(false);
      return;
    }

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
    }
  }

  const getFiles = useCallback(async (offset: number, limit: number) => {
    setError(null);
    setLoading(true);

    try {
      const data = await apiFileFiles(offset, limit);
      const pageNumberData = await apiFileCountFiles();

      setPageNumber(Math.floor((pageNumberData.filesNumber - 1) / MAX_FILE_PER_PAGE) + 1);

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

      const filesData = await getFiles(MAX_FILE_PER_PAGE * (currentPage - 1), MAX_FILE_PER_PAGE);

      setFiles(filesData.files);
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
      const filesData = await getFiles(MAX_FILE_PER_PAGE * (currentPage - 1), MAX_FILE_PER_PAGE);
      setFiles(filesData.files);
    })();
  }, [getFiles, currentPage]);

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
    setError,
    currentPage,
    pageNumber,
    setCurrentPage
  };
}
