import PageHeader from "@/components/header";
import { useFile } from "@/hooks/useFile";
import { usePageHeader } from "@/hooks/usePageHeader";
import { useParams } from "react-router-dom";

export default function File() {
  const { fileKey } = useParams<{ fileKey: string }>();

  console.log(fileKey);

  const { username, logout } = usePageHeader();
  const { file } = useFile(fileKey || "");

  return (
    <main className="min-h-screen flex flex-col p-3 gap-5">
      <PageHeader title="Brainleaf" username={username} onLogout={logout} auth={true} />
      <h1 className="text-md font-semibold text-center">{file?.fileName}</h1>
    </main>
  );
}
