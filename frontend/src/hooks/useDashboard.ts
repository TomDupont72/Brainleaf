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

  async function uploadFile(file: File) {
    const formData = new FormData();
    formData.append("file", file, fileName);

    const data = await apiFileUpload(formData);

    setFile(null);
    setFileName("");

    navigate(`/file/${data.file.fileKey}`);
  }

  const getFiles = useCallback(async () => {
    return apiFileFiles();
  }, []);

  const deleteFile = async (fileKey: string) => {
    await apiFileDelete(fileKey);

    setFiles((prev) => prev.filter((f) => f.fileKey !== fileKey));
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
    navigateToFile
  };
}
