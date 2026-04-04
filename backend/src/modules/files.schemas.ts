import { z } from "zod";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const FileSchema = z.object({
  fileName: z
    .string()
    .trim()
    .min(1, "Le nom du fichier ne doit pas être vide.")
    .max(200, "Le nom du fichier est trop long."),
  size: z
    .number()
    .int()
    .max(MAX_FILE_SIZE, "Le fichier dépasse la taille maximale autorisée (10 Mo)."),
  mimeType: z.literal("application/pdf"),
  offset: z.number().int().nonnegative(),
  limit: z.number().int().nonnegative().max(20, "La limite est dépassée."),
  fileId: z.int().nonnegative(),
  fileKey: z.uuid(),
  summary: z.string().trim().min(1, "Le résumé ne doit pas être vide."),
  revisionSheet: z.string().trim().min(1, "La fiche de révision ne doit pas être vide."),
  questions: z
    .array(
      z.object({
        question: z.string().trim().min(1, "La question ne doit pas être vide."),
        answer: z.string().trim().min(1, "La réponse ne doit pas être vide.")
      })
    )
    .min(1, "Il doit y avoir au moins une question.")
});

export const FileUploadSchema = FileSchema.pick({
  fileName: true,
  size: true,
  mimeType: true
});

export const FileFilesSchema = FileSchema.pick({
  offset: true,
  limit: true
});

export const FileDeleteSchema = FileSchema.pick({
  fileKey: true
});

export const FileFileByFilekeySchema = FileDeleteSchema;

export const FileInsertWorkerResult = FileSchema.pick({
  fileId: true,
  fileKey: true,
  summary: true,
  revisionSheet: true,
  questions: true
});
