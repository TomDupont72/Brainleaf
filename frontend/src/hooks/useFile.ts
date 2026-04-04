import { useState } from "react";
import { apiFileFilesByKey } from "../api/files";
import { useQuery } from "@tanstack/react-query";

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
  const [formError, setFormError] = useState<string | null>(null);

  const currentFileQuery = useQuery({
    queryKey: ["file", fileKey],
    queryFn: async () => {
      const data = await apiFileFilesByKey(fileKey);
      return data.file;
    },
    refetchInterval: (query) => {
      const status = query.state.data?.fileMetadata.status;
      return status === "processing" || !status ? 2000 : false;
    }
  });

  const file: FileData = currentFileQuery.data ?? null;

  return {
    file,
    loading: currentFileQuery.isLoading,
    error: formError || (currentFileQuery.isError ? "Impossible de récupérer le fichier." : null),
    setError: setFormError
  };
}
