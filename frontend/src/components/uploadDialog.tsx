import {
  Button,
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogClose,
  DialogTitle,
  DialogHeader,
  FieldLabel,
  Input,
  DialogFooter
} from "@/components/ui";
import { useState } from "react";

type UploadDialogProps = {
  file: File | null;
  setFile: (file: File | null) => void;
  setFileName: (name: string) => void;
  uploadFile: (file: File) => Promise<void>;
  title: string | React.ReactNode;
  variant?: "link" | "default" | "destructive" | "outline" | "secondary" | "ghost" | null;
  size?: "default" | "sm" | "lg" | "icon" | "xs" | "icon-xs" | "icon-sm" | "icon-lg" | null;
  className?: string;
};

export default function UploadDialog({
  file,
  setFile,
  setFileName,
  uploadFile,
  title,
  variant,
  size,
  className
}: UploadDialogProps) {
  const [open, setOpen] = useState(false);

  const handleUploadFile = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (file) {
      await uploadFile(file);
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size} className={className}>
          {title}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Importer un PDF</DialogTitle>
        </DialogHeader>
        <form className="flex flex-col gap-4">
          <FieldLabel htmlFor="fileName">Nom du fichier</FieldLabel>
          <Input
            id="fileName"
            onChange={(e) => setFileName(e.target.value)}
            autoComplete="off"
            required
          ></Input>
          <FieldLabel htmlFor="file">Fichier PDF</FieldLabel>
          <Input
            id="file"
            type="file"
            accept="application/pdf"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            required
          ></Input>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Annuler</Button>
            </DialogClose>
            <Button type="submit" onClick={handleUploadFile}>
              Importer
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
