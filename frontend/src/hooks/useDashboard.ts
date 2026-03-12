import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

type FileData = {
    id: number;
    fileName: string;
    fileKey: string;
    size: number;
    createdAt: Date;
}

export function useDashboard() {
    const navigate = useNavigate();

    const apiUrl = import.meta.env.VITE_API_URL;

    const [file, setFile] = useState<File | null>(null);
    const [files, setFiles] = useState<FileData[]>([]);
    const [fileName, setFileName] = useState("");

    async function uploadFile(file: File, e: React.MouseEvent) {
        e.preventDefault();
        const formData = new FormData();
        formData.append("file", file, fileName);

        const res = await fetch(`${apiUrl}/api/file/upload`, {
            method: "POST",
            body: formData,
            credentials: "include"
        });

        const data = await res.json();
        
        setFile(null);
        setFileName("");

        navigate(`/file/${data.file.fileKey}`);
    }

    const getFiles = useCallback(async () => {
        const res = await fetch(`${apiUrl}/api/file/files`, {
            method: "GET",
            credentials: "include"
        });

        return res.json();
    }, [apiUrl]);

    const deleteFile = async (fileKey: string) => {
        const res = await fetch(`${apiUrl}/api/file/delete/${fileKey}`, {
            method: "POST",
            credentials: "include"
        });

        const result = await res.json();
        setFiles(files.filter((f) => f.fileKey !== fileKey));
        return result;
    };

    useEffect(() => {(
        async () => {
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
        navigate
    }
}