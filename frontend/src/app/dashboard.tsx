import PageHeader from "@/components/header";
import UploadDialog from "@/components/uploadDialog";
import {
  Button,
  Card,
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Spinner
} from "@/components/ui";
import { useDashboard } from "@/hooks/useDashboard";
import { usePageHeader } from "@/hooks/usePageHeader";
import { Trash2, Upload } from "lucide-react";
import { motion } from "framer-motion";
import ErrorAlert from "@/components/errorAlert";

export default function Dashboard() {
  const {
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
  } = useDashboard();
  const { username, logout } = usePageHeader();

  if (loading) {
    return (
      <main className="h-screen flex flex-col">
        <div className="px-3 pt-3">
          <PageHeader title="Brainleaf" username={username} onLogout={logout} auth={true} />
        </div>
        <div className="flex-1 flex justify-center items-center">
          <Spinner className="size-8" />
        </div>
      </main>
    );
  }

  return (
    <main className="h-screen flex flex-col">
      <div className="px-3 pt-3">
        <PageHeader title="Brainleaf" username={username} onLogout={logout} auth={true} />
      </div>
      {files.length > 0 ? (
        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 grid-row-4 gap-5 my-5 px-8">
            {files.map((file) => (
              <motion.div key={file.id} initial={{ scale: 1 }} whileHover={{ scale: 1.05 }}>
                <Card className="relative">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-3 right-3 w-8 h-8"
                      >
                        <Trash2 />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Supprimer le document</DialogTitle>
                      </DialogHeader>
                      <p className="text-md text-muted-foreground">
                        Êtes-vous sûr de vouloir supprimer ce document ? Cette action est
                        irréversible.
                      </p>
                      <div className="flex flex-row justify-end mt-4 gap-2">
                        <DialogClose asChild>
                          <Button variant="outline">Annuler</Button>
                        </DialogClose>
                        <Button variant="destructive" onClick={() => deleteFile(file.fileKey)}>
                          Supprimer
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <div className="flex flex-col items-center justify-center gap-4 px-14">
                    <div className="flex flex-col justify-center h-[calc(2*1lh)]">
                      <h3 key={file.id} className="text-md font-semibold text-center line-clamp-2">
                        {file.fileName}
                      </h3>
                    </div>
                    <Button variant="outline" onClick={() => navigateToFile(file.fileKey)}>
                      Apprendre
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
          <UploadDialog
            file={file}
            setFile={setFile}
            setFileName={setFileName}
            uploadFile={uploadFile}
            title={<Upload className="size-lg" />}
            variant="outline"
            size="icon"
            className="fixed right-8 bottom-8 z-50 w-12 h-12 rounded-full backdrop-blur-md"
          />
        </div>
      ) : (
        <div className="flex-1 flex justify-center items-center">
          <Card className="flex justify-center items-center p-6">
            <h2 className="text-2xl font-semibold">Aucun document</h2>
            <p className="text-md font-semi text-muted-foreground">
              Importer votre premier cours pour commencer
            </p>
            <UploadDialog
              file={file}
              setFile={setFile}
              setFileName={setFileName}
              uploadFile={uploadFile}
              title="Importer un PDF"
              variant="outline"
            />
          </Card>
        </div>
      )}
      <ErrorAlert
        error={error}
        className="absolute bottom-8 left-8"
        setErrorToNull={() => setError(null)}
      />
    </main>
  );
}
