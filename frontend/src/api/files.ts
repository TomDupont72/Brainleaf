const apiUrl = import.meta.env.VITE_API_URL;

export async function apiFileUpload(formData: FormData) {
  const res = await fetch(`${apiUrl}/api/file/upload`, {
    method: "POST",
    body: formData,
    credentials: "include"
  });

  if (!res.ok) {
    throw new Error("Failed to upload file");
  }

  return res.json();
}

export async function apiFileFiles() {
  const res = await fetch(`${apiUrl}/api/file/files`, {
    method: "GET",
    credentials: "include"
  });

  if (!res.ok) {
    throw new Error("Failed to fetch files");
  }

  return res.json();
}

export async function apiFileDelete(fileKey: string) {
  const res = await fetch(`${apiUrl}/api/file/delete/${fileKey}`, {
    method: "POST",
    credentials: "include"
  });

  if (!res.ok) {
    throw new Error("Failed to delete file");
  }
}

export async function apiFileFilesByKey(fileKey: string) {
  const res = await fetch(`${apiUrl}/api/file/files/${fileKey}`, {
    method: "GET",
    credentials: "include"
  });

  if (!res.ok) {
    throw new Error("Failed to fetch file");
  }

  return res.json();
}
