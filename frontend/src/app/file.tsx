import PageHeader from "@/components/header";
import { useFile } from "@/hooks/useFile";
import { usePageHeader } from "@/hooks/usePageHeader";
import { useParams } from "react-router-dom";
import { Spinner } from "@/components/ui/index";
import ErrorAlert from "@/components/errorAlert";

export default function File() {
  const { fileKey } = useParams<{ fileKey: string }>();

  const { username, logout } = usePageHeader();
  const { file, loading, error, setError } = useFile(fileKey || "");

  if (loading) {
    return (
      <main className="min-h-screen flex flex-col p-3">
        <PageHeader title="Brainleaf" username={username} onLogout={logout} auth={true} />
        <div className="flex-1 flex justify-center items-center">
          <Spinner className="size-8" />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col p-3 gap-5">
      <PageHeader title="Brainleaf" username={username} onLogout={logout} auth={true} />
      <h1 className="text-md font-semibold text-center">{file?.fileName}</h1>
      <ErrorAlert
        error={error}
        className="absolute bottom-8 left-8"
        setErrorToNull={() => setError(null)}
      />
    </main>
  );
}
