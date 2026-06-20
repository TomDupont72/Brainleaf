import { describe, it, expect } from "vitest";
import { UploadFileSchema } from "../files.schemas";

describe("UploadFileSchema", () => {
  it("valide un fichier correct", () => {
    const result = UploadFileSchema.safeParse({
      fileName: "document.pdf",
      size: 1024
    });

    expect(result.success).toBe(true);
  });

  it("trim le nom du fichier", () => {
    const result = UploadFileSchema.safeParse({
      fileName: "   document.pdf   ",
      size: 1024
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.fileName).toBe("document.pdf");
    }
  });

  it("rejette un nom de fichier vide", () => {
    const result = UploadFileSchema.safeParse({
      fileName: "   ",
      size: 1024
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe("Le nom du fichier ne doit pas être vide.");
    }
  });

  it("rejette un nom de fichier trop long", () => {
    const longName = "a".repeat(201);

    const result = UploadFileSchema.safeParse({
      fileName: longName,
      size: 1024
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe("Le nom du fichier est trop long.");
    }
  });

  it("rejette un fichier trop lourd", () => {
    const result = UploadFileSchema.safeParse({
      fileName: "document.pdf",
      size: 11 * 1024 * 1024 // > 10MB
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        "Le fichier dépasse la taille maximale autorisée (10 Mo)."
      );
    }
  });

  it("rejette une taille non entière", () => {
    const result = UploadFileSchema.safeParse({
      fileName: "document.pdf",
      size: 1024.5
    });

    expect(result.success).toBe(false);
  });

  it("valide une taille exactement à la limite", () => {
    const result = UploadFileSchema.safeParse({
      fileName: "document.pdf",
      size: 10 * 1024 * 1024
    });

    expect(result.success).toBe(true);
  });
});
