import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { ApiError } from "../services/ApiError.js";
import {
  uploadUserFile,
  deleteUserFile,
  getUserFile,
  insertWorkerResult
} from "../services/files.service.js";
import { getFiles, FileQuestion } from "../db/files.db.js";

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

    if (!data) throw new ApiError("File not received", "400");

    const file = await uploadUserFile(request.user.id, data, request);

    return reply.send({ file });
  });

  fastify.get(
    "/files",
    { preHandler: [fastify.requireAuth] },
    async function (request: FastifyRequest, reply: FastifyReply) {
      const userId = request.user.id;

      const files = await getFiles(userId);

      return reply.send({ files });
    }
  );

  fastify.post(
    "/delete/:fileKey",
    { preHandler: [fastify.requireAuth] },
    async function (request: FastifyRequest, reply: FastifyReply) {
      const { fileKey } = request.params as { fileKey: string };
      const userId = request.user.id;

      const file = await deleteUserFile(userId, fileKey, request);

      return reply.send({ file });
    }
  );

  fastify.get(
    "/files/:fileKey",
    { preHandler: [fastify.requireAuth] },
    async function (request: FastifyRequest, reply: FastifyReply) {
      const { fileKey } = request.params as { fileKey: string };
      const userId = request.user.id;

      const file = await getUserFile(userId, fileKey);

      return reply.send({ file });
    }
  );

  fastify.post(
    "/insert-worker-result",
    { preHandler: [fastify.requireWorker] },
    async function (request: FastifyRequest, reply: FastifyReply) {
      const body = request.body as WorkerSuccess | WorkerFailed;

      if (body.status === "failed") {
        throw new ApiError(body.errorMessage, "400");
      }

      const data = await insertWorkerResult(
        body.fileId,
        body.fileKey,
        body.summary,
        body.revisionSheet,
        body.questions,
        request
      );

      return reply.send({ data });
    }
  );
}
