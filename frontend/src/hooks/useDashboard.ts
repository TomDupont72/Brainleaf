import { apiFileCountFiles, apiFileDelete, apiFileFiles, apiFileUpload } from "@/api/files";
import { UploadFileSchema } from "@/modules/files.schemas";
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

type FileData = {
  id: number;
  fileName: string;
  fileKey: string;
  size: number;
  createdAt: string;
};

export function useDashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [searchParams, setSearchParams] = useSearchParams();

  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const MAX_FILE_PER_PAGE = 20;

  const rawPage = Number(searchParams.get("page") ?? "1");
  const currentPage = Number.isNaN(rawPage) || rawPage < 1 ? 1 : rawPage;

  const setCurrentPage = (page: number) => {
    setSearchParams({ page: String(page) });
  };

  const filesQuery = useQuery({
    queryKey: ["files", currentPage],
    queryFn: async () => {
      const offset = MAX_FILE_PER_PAGE * (currentPage - 1);
      return apiFileFiles(offset, MAX_FILE_PER_PAGE);
    },
    placeholderData: (previousData) => previousData
  });

  const countQuery = useQuery({
    queryKey: ["filesCount"],
    queryFn: async () => {
      return apiFileCountFiles();
    }
  });

  const uploadMutation = useMutation({
    mutationFn: async (fileToUpload: File) => {
      const formData = {
        fileName,
        size: fileToUpload.size
      };

      const result = UploadFileSchema.safeParse(formData);

      if (!result.success) {
        const firstIssue = result.error.issues[0];
        throw new Error(firstIssue?.message ?? "Formulaire invalide.");
      }

      const fileFormData = new FormData();
      fileFormData.append("file", fileToUpload, result.data.fileName);

      return apiFileUpload(fileFormData);
    },
    onSuccess: (data) => {
      setFile(null);
      setFileName("");
      setFormError(null);

      queryClient.invalidateQueries({ queryKey: ["files"] });
      queryClient.invalidateQueries({ queryKey: ["filesCount"] });

      navigate(`/file/${data.file.fileKey}`);
    },
    onError: (error) => {
      console.error("[useDashboard.uploadFile] failed", error);
      setFormError(error instanceof Error ? error.message : "L'upload a échoué.");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (fileKey: string) => {
      await apiFileDelete(fileKey);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["files"] });
      await queryClient.invalidateQueries({ queryKey: ["filesCount"] });
    },
    onError: (error) => {
      console.error("[useDashboard.deleteFile] failed", error);
      setFormError("Impossible de supprimer le fichier.");
    }
  });

  const uploadFile = async (fileToUpload: File) => {
    setFormError(null);
    await uploadMutation.mutateAsync(fileToUpload);
  };

  const deleteFile = async (fileKey: string) => {
    setFormError(null);
    await deleteMutation.mutateAsync(fileKey);
  };

  const navigateToFile = (fileKey: string) => {
    navigate(`/file/${fileKey}`);
  };

  const files: FileData[] = filesQuery.data?.files ?? [];
  const totalFiles = countQuery.data?.filesNumber ?? 0;
  const pageNumber = totalFiles > 0 ? Math.floor((totalFiles - 1) / MAX_FILE_PER_PAGE) + 1 : 1;

  return {
    uploadFile,
    file,
    setFile,
    files,
    setFileName,
    deleteFile,
    navigateToFile,
    loading:
      filesQuery.isLoading ||
      countQuery.isLoading ||
      uploadMutation.isPending ||
      deleteMutation.isPending,
    error:
      formError ||
      (filesQuery.isError ? "Impossible de récupérer les fichiers." : null) ||
      (countQuery.isError ? "Impossible de récupérer le nombre de fichiers." : null),
    setError: setFormError,
    currentPage,
    pageNumber,
    setCurrentPage
  };
}
