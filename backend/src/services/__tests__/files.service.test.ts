import { describe, it, expect, vi, beforeEach } from "vitest";
import type { FastifyReply, FastifyRequest } from "fastify";
import {
  uploadUserFile,
  deleteUserFile,
  getUserFile,
  insertWorkerResult
} from "../files.service.js";
import * as filesDb from "../../db/files.db.js";

vi.mock("../../db/files.db.js", () => ({
  insertFile: vi.fn(),
  insertFileB2: vi.fn(),
  updateFileStatus: vi.fn(),
  deleteFileB2: vi.fn(),
  deleteFile: vi.fn(),
  getFile: vi.fn(),
  getFileB2: vi.fn(),
  getFileContent: vi.fn(),
  getFileQuestions: vi.fn(),
  createNewProcessPdfJob: vi.fn(),
  insertFileContent: vi.fn(),
  insertFileQuestions: vi.fn()
}));

describe("files.service", () => {
  let requestMock: FastifyRequest;
  let replyMock: FastifyReply;

  beforeEach(() => {
    vi.clearAllMocks();

    requestMock = {
      log: {
        error: vi.fn()
      }
    } as unknown as FastifyRequest;

    replyMock = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn()
    } as unknown as FastifyReply;
  });

  describe("uploadUserFile", () => {
    it("upload un fichier, crée le job et passe le statut à processing", async () => {
      const buffer = Buffer.from("hello pdf");

      vi.mocked(filesDb.insertFile).mockResolvedValue({
        id: 42,
        fileKey: "whatever"
      } as never);

      vi.mocked(filesDb.insertFileB2).mockResolvedValue(undefined as never);
      vi.mocked(filesDb.createNewProcessPdfJob).mockResolvedValue(undefined as never);
      vi.mocked(filesDb.updateFileStatus).mockResolvedValue({
        id: 42,
        status: "processing"
      } as never);

      const result = await uploadUserFile(
        "user-1",
        "file.pdf",
        "application/pdf",
        buffer,
        requestMock
      );

      expect(filesDb.insertFile).toHaveBeenCalledWith(
        "user-1",
        "file.pdf",
        expect.any(String),
        buffer.length,
        "application/pdf",
        "pending"
      );

      const generatedKey = vi.mocked(filesDb.insertFile).mock.calls[0][2];

      expect(filesDb.insertFileB2).toHaveBeenCalledWith(
        generatedKey,
        buffer,
        "application/pdf"
      );
      expect(filesDb.createNewProcessPdfJob).toHaveBeenCalledWith(42, generatedKey);
      expect(filesDb.updateFileStatus).toHaveBeenCalledWith(generatedKey, "processing");

      expect(result).toEqual({
        id: 42,
        status: "processing"
      });
    });

    it("met le statut à error si une erreur survient après la création du fichier", async () => {
      const buffer = Buffer.from("hello pdf");
      const insertError = new Error("B2 failed");

      vi.mocked(filesDb.insertFile).mockResolvedValue({
        id: 42,
        fileKey: "whatever"
      } as never);

      vi.mocked(filesDb.insertFileB2).mockRejectedValue(insertError);
      vi.mocked(filesDb.updateFileStatus).mockResolvedValue({
        id: 42,
        status: "error"
      } as never);

      await expect(
        uploadUserFile("user-1", "file.pdf", "application/pdf", buffer, requestMock)
      ).rejects.toThrow("B2 failed");

      const generatedKey = vi.mocked(filesDb.insertFile).mock.calls[0][2];

      expect(filesDb.updateFileStatus).toHaveBeenCalledWith(generatedKey, "error");
      expect(filesDb.createNewProcessPdfJob).not.toHaveBeenCalled();
    });

    it("ne tente pas de mettre le statut à error si la création initiale du fichier échoue", async () => {
      const buffer = Buffer.from("hello pdf");
      const insertError = new Error("Insert failed");

      vi.mocked(filesDb.insertFile).mockRejectedValue(insertError);

      await expect(
        uploadUserFile("user-1", "file.pdf", "application/pdf", buffer, requestMock)
      ).rejects.toThrow("Insert failed");

      expect(filesDb.updateFileStatus).not.toHaveBeenCalled();
      expect(filesDb.insertFileB2).not.toHaveBeenCalled();
      expect(filesDb.createNewProcessPdfJob).not.toHaveBeenCalled();
    });

    it("log l'erreur si le rollback du statut error échoue", async () => {
      const buffer = Buffer.from("hello pdf");
      const insertB2Error = new Error("B2 failed");
      const updateStatusError = new Error("Status update failed");

      vi.mocked(filesDb.insertFile).mockResolvedValue({
        id: 42,
        fileKey: "whatever"
      } as never);

      vi.mocked(filesDb.insertFileB2).mockRejectedValue(insertB2Error);
      vi.mocked(filesDb.updateFileStatus).mockRejectedValue(updateStatusError);

      await expect(
        uploadUserFile("user-1", "file.pdf", "application/pdf", buffer, requestMock)
      ).rejects.toThrow("B2 failed");

      const generatedKey = vi.mocked(filesDb.insertFile).mock.calls[0][2];

      expect(requestMock.log.error).toHaveBeenCalledWith(
        { fileKey: generatedKey, error: updateStatusError },
        "Failed to update file status to error"
      );
    });
  });

  describe("deleteUserFile", () => {
    it("retourne 404 si le fichier est introuvable", async () => {
      vi.mocked(filesDb.getFile).mockResolvedValue(null);

      await deleteUserFile("user-1", "file-key", requestMock, replyMock);

      expect(filesDb.getFile).toHaveBeenCalledWith("user-1", "file-key");
      expect(replyMock.status).toHaveBeenCalledWith(404);
      expect(replyMock.send).toHaveBeenCalledWith({
        error: "Fichier non trouvé."
      });
    });

    it("supprime le fichier avec succès", async () => {
      vi.mocked(filesDb.getFile).mockResolvedValue({
        id: 42,
        fileKey: "file-key"
      } as never);

      vi.mocked(filesDb.getFileB2).mockResolvedValue(["v1", "v2"] as never);
      vi.mocked(filesDb.deleteFileB2).mockResolvedValue(undefined as never);
      vi.mocked(filesDb.deleteFile).mockResolvedValue({
        success: true
      } as never);

      const result = await deleteUserFile("user-1", "file-key", requestMock, replyMock);

      expect(filesDb.getFile).toHaveBeenCalledWith("user-1", "file-key");
      expect(filesDb.getFileB2).toHaveBeenCalledWith("file-key");
      expect(filesDb.deleteFileB2).toHaveBeenCalledWith(["v1", "v2"], "file-key");
      expect(filesDb.deleteFile).toHaveBeenCalledWith(42);

      expect(result).toEqual({ success: true });
    });

    it("met le statut à deleted si une erreur survient après suppression B2", async () => {
      const deleteError = new Error("DB delete failed");

      vi.mocked(filesDb.getFile).mockResolvedValue({
        id: 42,
        fileKey: "file-key"
      } as never);

      vi.mocked(filesDb.getFileB2).mockResolvedValue(["v1", "v2"] as never);
      vi.mocked(filesDb.deleteFileB2).mockResolvedValue(undefined as never);
      vi.mocked(filesDb.deleteFile).mockRejectedValue(deleteError);
      vi.mocked(filesDb.updateFileStatus).mockResolvedValue({
        id: 42,
        status: "deleted"
      } as never);

      await expect(
        deleteUserFile("user-1", "file-key", requestMock, replyMock)
      ).rejects.toThrow("DB delete failed");

      expect(filesDb.updateFileStatus).toHaveBeenCalledWith("file-key", "deleted");
    });

    it("ne met pas le statut à deleted si l'erreur survient avant la suppression B2", async () => {
      const b2Error = new Error("B2 lookup failed");

      vi.mocked(filesDb.getFile).mockResolvedValue({
        id: 42,
        fileKey: "file-key"
      } as never);

      vi.mocked(filesDb.getFileB2).mockRejectedValue(b2Error);

      await expect(
        deleteUserFile("user-1", "file-key", requestMock, replyMock)
      ).rejects.toThrow("B2 lookup failed");

      expect(filesDb.updateFileStatus).not.toHaveBeenCalled();
      expect(filesDb.deleteFileB2).not.toHaveBeenCalled();
      expect(filesDb.deleteFile).not.toHaveBeenCalled();
    });

    it("log l'erreur si le rollback du statut deleted échoue", async () => {
      const deleteError = new Error("DB delete failed");
      const updateStatusError = new Error("Status deleted failed");

      vi.mocked(filesDb.getFile).mockResolvedValue({
        id: 42,
        fileKey: "file-key"
      } as never);

      vi.mocked(filesDb.getFileB2).mockResolvedValue(["v1"] as never);
      vi.mocked(filesDb.deleteFileB2).mockResolvedValue(undefined as never);
      vi.mocked(filesDb.deleteFile).mockRejectedValue(deleteError);
      vi.mocked(filesDb.updateFileStatus).mockRejectedValue(updateStatusError);

      await expect(
        deleteUserFile("user-1", "file-key", requestMock, replyMock)
      ).rejects.toThrow("DB delete failed");

      expect(requestMock.log.error).toHaveBeenCalledWith(
        { fileKey: "file-key", catchError: updateStatusError },
        "Failed to update file status to deleted after B2 deletion"
      );
    });
  });

  describe("getUserFile", () => {
    it("retourne 404 si le fichier est introuvable", async () => {
      vi.mocked(filesDb.getFile).mockResolvedValue(null);

      await getUserFile("user-1", "file-key", replyMock);

      expect(filesDb.getFile).toHaveBeenCalledWith("user-1", "file-key");
      expect(replyMock.status).toHaveBeenCalledWith(404);
      expect(replyMock.send).toHaveBeenCalledWith({
        error: "Fichier non trouvé."
      });
    });

    it("retourne les métadonnées, le contenu et les questions du fichier", async () => {
      vi.mocked(filesDb.getFile).mockResolvedValue({
        id: 42,
        fileKey: "file-key",
        fileName: "file.pdf"
      } as never);

      vi.mocked(filesDb.getFileContent).mockResolvedValue({
        id: 10,
        fileId: 42,
        summary: "Résumé",
        revisionSheet: "Fiche"
      } as never);

      vi.mocked(filesDb.getFileQuestions).mockResolvedValue([
        {
          id: 1,
          fileId: 42,
          question: "Q1",
          answer: "R1"
        }
      ] as never);

      const result = await getUserFile("user-1", "file-key", replyMock);

      expect(filesDb.getFile).toHaveBeenCalledWith("user-1", "file-key");
      expect(filesDb.getFileContent).toHaveBeenCalledWith(42);
      expect(filesDb.getFileQuestions).toHaveBeenCalledWith(42);

      expect(result).toEqual({
        fileMetadata: {
          id: 42,
          fileKey: "file-key",
          fileName: "file.pdf"
        },
        fileContent: {
          id: 10,
          fileId: 42,
          summary: "Résumé",
          revisionSheet: "Fiche"
        },
        fileQuestions: [
          {
            id: 1,
            fileId: 42,
            question: "Q1",
            answer: "R1"
          }
        ]
      });
    });
  });

  describe("insertWorkerResult", () => {
    it("insère le contenu, les questions et met le statut à success", async () => {
      const questions = [
        {
          question: "Q1",
          answer: "R1"
        }
      ];

      vi.mocked(filesDb.insertFileContent).mockResolvedValue({
        id: 10,
        fileId: 42,
        summary: "Résumé",
        revisionSheet: "Fiche"
      } as never);

      vi.mocked(filesDb.insertFileQuestions).mockResolvedValue([
        {
          id: 1,
          fileId: 42,
          question: "Q1",
          answer: "R1"
        }
      ] as never);

      vi.mocked(filesDb.updateFileStatus).mockResolvedValue({
        id: 42,
        status: "success"
      } as never);

      const result = await insertWorkerResult(
        42,
        "file-key",
        "Résumé",
        "Fiche",
        questions,
        requestMock
      );

      expect(filesDb.insertFileContent).toHaveBeenCalledWith(42, "Résumé", "Fiche");
      expect(filesDb.insertFileQuestions).toHaveBeenCalledWith(42, questions);
      expect(filesDb.updateFileStatus).toHaveBeenCalledWith("file-key", "success");

      expect(result).toEqual({
        contentData: {
          id: 10,
          fileId: 42,
          summary: "Résumé",
          revisionSheet: "Fiche"
        },
        questionsData: [
          {
            id: 1,
            fileId: 42,
            question: "Q1",
            answer: "R1"
          }
        ]
      });
    });

    it("met le statut à error si une insertion échoue", async () => {
      const insertError = new Error("Insert content failed");

      vi.mocked(filesDb.insertFileContent).mockRejectedValue(insertError);
      vi.mocked(filesDb.updateFileStatus).mockResolvedValue({
        id: 42,
        status: "error"
      } as never);

      const result = await insertWorkerResult(
        42,
        "file-key",
        "Résumé",
        "Fiche",
        [],
        requestMock
      );

      expect(filesDb.updateFileStatus).toHaveBeenCalledWith("file-key", "error");
      expect(result).toBeUndefined();
    });

    it("log l'erreur si la mise à jour du statut error échoue après une erreur d'insertion", async () => {
      const insertError = new Error("Insert content failed");
      const updateStatusError = new Error("Update error status failed");

      vi.mocked(filesDb.insertFileContent).mockRejectedValue(insertError);
      vi.mocked(filesDb.updateFileStatus).mockRejectedValue(updateStatusError);

      await expect(
        insertWorkerResult(42, "file-key", "Résumé", "Fiche", [], requestMock)
      ).rejects.toThrow("Insert content failed");

      expect(requestMock.log.error).toHaveBeenCalledWith(
        { fileKey: "file-key", catchError: updateStatusError },
        "Failed to update file status to error after inserting data"
      );
    });
  });
});