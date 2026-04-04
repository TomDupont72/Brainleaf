import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import {
  uploadUserFile,
  deleteUserFile,
  getUserFile,
  insertWorkerResult
} from "../services/files.service.js";
import { getFiles, FileQuestion, countFiles } from "../db/files.db.js";
import {
  FileDeleteSchema,
  FileFileByFilekeySchema,
  FileFilesSchema,
  FileInsertWorkerResult,
  FileUploadSchema
} from "../modules/files.schemas.js";

type WorkerSuccess = {
  status: "success";
  fileId: number;
  fileKey: string;
  summary: string;
  revisionSheet: string;
  questions: FileQuestion[];
};

type WorkerFailed = {
  status: "failed";
  fileId: string;
  fileKey: string;
  errorMessage: string;
};

export async function fileRoutes(fastify: FastifyInstance) {
  fastify.post("/upload", { preHandler: [fastify.requireAuth] }, async (request, reply) => {
    const data = await request.file();

    if (!data) {
      return reply.status(400).send({
        error: "Fichier non reçu."
      });
    }

    const buffer = await data.toBuffer();

    const formData = {
      fileName: data.filename,
      size: buffer.length,
      mimeType: data.mimetype
    };

    const result = FileUploadSchema.safeParse(formData);

    if (!result.success) {
      return reply.status(400).send({
        error: "Fichier invalide.",
        details: result.error.issues
      });
    }

    const file = await uploadUserFile(
      request.user.id,
      result.data.fileName,
      result.data.mimeType,
      buffer,
      request
    );

    return reply.send({ file });
  });

  fastify.get(
    "/files",
    { preHandler: [fastify.requireAuth] },
    async function (request: FastifyRequest, reply: FastifyReply) {
      const userId = request.user.id;
      const { offset = "0", limit = "20" } = request.query as {
        offset?: string;
        limit?: string;
      };

      const formData = {
        offset: Number(offset),
        limit: Number(limit)
      };

      const result = FileFilesSchema.safeParse(formData);

      if (!result.success) {
        return reply.status(400).send({
          error: "Requete invalide.",
          details: result.error.issues
        });
      }

      const files = await getFiles(userId, result.data.offset, result.data.limit);

      return reply.send({ files });
    }
  );

  fastify.post(
    "/delete/:fileKey",
    { preHandler: [fastify.requireAuth] },
    async function (request: FastifyRequest, reply: FastifyReply) {
      const { fileKey } = request.params as { fileKey: string };
      const userId = request.user.id;

      const formData = {
        fileKey: fileKey
      };

      const result = FileDeleteSchema.safeParse(formData);

      if (!result.success) {
        return reply.status(400).send({
          error: "Requete invalide.",
          details: result.error.issues
        });
      }

      const file = await deleteUserFile(userId, result.data.fileKey, request, reply);

      return reply.send({ file });
    }
  );

  fastify.get(
    "/file-by-filekey/:fileKey",
    { preHandler: [fastify.requireAuth] },
    async function (request: FastifyRequest, reply: FastifyReply) {
      const { fileKey } = request.params as { fileKey: string };
      const userId = request.user.id;

      const formData = {
        fileKey: fileKey
      };

      const result = FileFileByFilekeySchema.safeParse(formData);

      if (!result.success) {
        return reply.status(400).send({
          error: "Requete invalide.",
          details: result.error.issues
        });
      }

      const file = await getUserFile(userId, fileKey, reply);

      return reply.send({ file });
    }
  );

  fastify.post(
    "/insert-worker-result",
    { preHandler: [fastify.requireWorker] },
    async function (request: FastifyRequest, reply: FastifyReply) {
      const body = request.body as WorkerSuccess | WorkerFailed;

      if (body.status === "failed") {
        return reply.status(400).send({
          error: body.errorMessage
        });
      }

      const formData = {
        fileId: body.fileId,
        fileKey: body.fileKey,
        summary: body.summary,
        revisionSheet: body.revisionSheet,
        questions: body.questions
      };

      console.log(formData);

      const result = FileInsertWorkerResult.safeParse(formData);

      console.log(result);

      if (!result.success) {
        return reply.status(400).send({
          error: "Résultat du LLM invalide.",
          details: result.error.issues
        });
      }

      const data = await insertWorkerResult(
        result.data.fileId,
        result.data.fileKey,
        result.data.summary,
        result.data.revisionSheet,
        result.data.questions,
        request
      );

      return reply.send({ data });
    }
  );

  fastify.get(
    "/count-files",
    { preHandler: [fastify.requireAuth] },
    async function (request: FastifyRequest, reply: FastifyReply) {
      const userId = request.user.id;

      const filesNumber = await countFiles(userId);

      return reply.send({ filesNumber });
    }
  );
}
