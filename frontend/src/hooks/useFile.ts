import { useState, useCallback, useEffect } from "react";

type FileData = {
  id: number;
  fileName: string;
  fileKey: string;
  size: number;
  createdAt: Date;
};

export function useFile(fileKey: string) {
  const apiUrl = import.meta.env.VITE_API_URL;

  const [file, setFile] = useState<FileData | null>(null);

  const getCurrentFile = useCallback(
    async (fileKey: string) => {
      const res = await fetch(`${apiUrl}/api/file/files/${fileKey}`, {
        method: "GET",
        credentials: "include"
      });

      const data = await res.json();
      setFile(data.file);
    },
    [apiUrl]
  );

  useEffect(() => {
    (async () => {
      await getCurrentFile(fileKey);
    })();
  }, [getCurrentFile, fileKey]);

  return {
    file,
    getCurrentFile
  };
}
