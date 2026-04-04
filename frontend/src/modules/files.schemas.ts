import { z } from "zod";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const FilesSchema = z.object({
  fileName: z
    .string()
    .trim()
    .min(1, "Le nom du fichier ne doit pas être vide.")
    .max(200, "Le nom du fichier est trop long."),
  size: z
    .number()
    .int()
    .max(MAX_FILE_SIZE, "Le fichier dépasse la taille maximale autorisée (10 Mo).")
});

export const UploadFileSchema = FilesSchema.pick({
  fileName: true,
  size: true
});
