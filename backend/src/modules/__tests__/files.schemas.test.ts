import { describe, it, expect } from "vitest";
import {
  FileUploadSchema,
  FileFilesSchema,
  FileDeleteSchema,
  FileFileByFilekeySchema,
  FileInsertWorkerResult
} from "../files.schemas.js";

describe("FileUploadSchema", () => {
  it("valide un upload PDF correct", () => {
    const result = FileUploadSchema.safeParse({
      fileName: "document.pdf",
      size: 1024,
      mimeType: "application/pdf"
    });

    expect(result.success).toBe(true);
  });

  it("trim le nom du fichier", () => {
    const result = FileUploadSchema.safeParse({
      fileName: "   document.pdf   ",
      size: 1024,
      mimeType: "application/pdf"
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.fileName).toBe("document.pdf");
    }
  });

  it("rejette un nom vide", () => {
    const result = FileUploadSchema.safeParse({
      fileName: "   ",
      size: 1024,
      mimeType: "application/pdf"
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        "Le nom du fichier ne doit pas être vide."
      );
    }
  });

  it("rejette un nom trop long", () => {
    const result = FileUploadSchema.safeParse({
      fileName: "a".repeat(201),
      size: 1024,
      mimeType: "application/pdf"
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        "Le nom du fichier est trop long."
      );
    }
  });

  it("rejette un fichier trop grand", () => {
    const result = FileUploadSchema.safeParse({
      fileName: "document.pdf",
      size: 11 * 1024 * 1024,
      mimeType: "application/pdf"
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        "Le fichier dépasse la taille maximale autorisée (10 Mo)."
      );
    }
  });

  it("rejette un mimeType autre que application/pdf", () => {
    const result = FileUploadSchema.safeParse({
      fileName: "document.png",
      size: 1024,
      mimeType: "image/png"
    });

    expect(result.success).toBe(false);
  });
});

describe("FileFilesSchema", () => {
  it("valide offset et limit corrects", () => {
    const result = FileFilesSchema.safeParse({
      offset: 0,
      limit: 20
    });

    expect(result.success).toBe(true);
  });

  it("rejette un offset négatif", () => {
    const result = FileFilesSchema.safeParse({
      offset: -1,
      limit: 10
    });

    expect(result.success).toBe(false);
  });

  it("rejette une limit supérieure à 20", () => {
    const result = FileFilesSchema.safeParse({
      offset: 0,
      limit: 21
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe("La limite est dépassée.");
    }
  });

  it("rejette une limit non entière", () => {
    const result = FileFilesSchema.safeParse({
      offset: 0,
      limit: 10.5
    });

    expect(result.success).toBe(false);
  });
});

describe("FileDeleteSchema", () => {
  it("valide une fileKey UUID correcte", () => {
    const result = FileDeleteSchema.safeParse({
      fileKey: "123e4567-e89b-12d3-a456-426614174000"
    });

    expect(result.success).toBe(true);
  });

  it("rejette une fileKey invalide", () => {
    const result = FileDeleteSchema.safeParse({
      fileKey: "not-a-uuid"
    });

    expect(result.success).toBe(false);
  });
});

describe("FileFileByFilekeySchema", () => {
  it("valide une fileKey UUID correcte", () => {
    const result = FileFileByFilekeySchema.safeParse({
      fileKey: "123e4567-e89b-12d3-a456-426614174000"
    });

    expect(result.success).toBe(true);
  });

  it("rejette une fileKey invalide", () => {
    const result = FileFileByFilekeySchema.safeParse({
      fileKey: "bad-key"
    });

    expect(result.success).toBe(false);
  });
});

describe("FileInsertWorkerResult", () => {
  it("valide un résultat worker correct", () => {
    const result = FileInsertWorkerResult.safeParse({
      fileId: 1,
      fileKey: "123e4567-e89b-12d3-a456-426614174000",
      summary: "Résumé du document",
      revisionSheet: "Fiche de révision",
      questions: [
        {
          question: "Question 1",
          answer: "Réponse 1"
        }
      ]
    });

    expect(result.success).toBe(true);
  });

  it("rejette un fileId négatif", () => {
    const result = FileInsertWorkerResult.safeParse({
      fileId: -1,
      fileKey: "123e4567-e89b-12d3-a456-426614174000",
      summary: "Résumé du document",
      revisionSheet: "Fiche de révision",
      questions: [
        {
          question: "Question 1",
          answer: "Réponse 1"
        }
      ]
    });

    expect(result.success).toBe(false);
  });

  it("rejette un résumé vide", () => {
    const result = FileInsertWorkerResult.safeParse({
      fileId: 1,
      fileKey: "123e4567-e89b-12d3-a456-426614174000",
      summary: "   ",
      revisionSheet: "Fiche de révision",
      questions: [
        {
          question: "Question 1",
          answer: "Réponse 1"
        }
      ]
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        "Le résumé ne doit pas être vide."
      );
    }
  });

  it("rejette une fiche de révision vide", () => {
    const result = FileInsertWorkerResult.safeParse({
      fileId: 1,
      fileKey: "123e4567-e89b-12d3-a456-426614174000",
      summary: "Résumé du document",
      revisionSheet: "   ",
      questions: [
        {
          question: "Question 1",
          answer: "Réponse 1"
        }
      ]
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        "La fiche de révision ne doit pas être vide."
      );
    }
  });

  it("rejette une liste de questions vide", () => {
    const result = FileInsertWorkerResult.safeParse({
      fileId: 1,
      fileKey: "123e4567-e89b-12d3-a456-426614174000",
      summary: "Résumé du document",
      revisionSheet: "Fiche de révision",
      questions: []
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        "Il doit y avoir au moins une question."
      );
    }
  });

  it("rejette une question vide", () => {
    const result = FileInsertWorkerResult.safeParse({
      fileId: 1,
      fileKey: "123e4567-e89b-12d3-a456-426614174000",
      summary: "Résumé du document",
      revisionSheet: "Fiche de révision",
      questions: [
        {
          question: "   ",
          answer: "Réponse 1"
        }
      ]
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        "La question ne doit pas être vide."
      );
    }
  });

  it("rejette une réponse vide", () => {
    const result = FileInsertWorkerResult.safeParse({
      fileId: 1,
      fileKey: "123e4567-e89b-12d3-a456-426614174000",
      summary: "Résumé du document",
      revisionSheet: "Fiche de révision",
      questions: [
        {
          question: "Question 1",
          answer: "   "
        }
      ]
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        "La réponse ne doit pas être vide."
      );
    }
  });
});