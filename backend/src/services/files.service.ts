import { randomUUID } from "node:crypto";
import { FastifyReply, FastifyRequest } from "fastify";
import {
  insertFile,
  insertFileB2,
  updateFileStatus,
  deleteFileB2,
  deleteFile,
  getFile,
  getFileB2,
  getFileContent,
  getFileQuestions,
  createNewProcessPdfJob,
  insertFileContent,
  insertFileQuestions,
  FileQuestion
} from "../db/files.db.js";

export async function uploadUserFile(
  userId: string,
  fileName: string,
  mimeType: string,
  buffer: Buffer<ArrayBufferLike>,
  request: FastifyRequest
) {
  const key = randomUUID();

  let fileCreated = false;

  try {
    const file = await insertFile(userId, fileName, key, buffer.length, mimeType, "pending");
    fileCreated = true;

    await insertFileB2(key, buffer, mimeType);

    await createNewProcessPdfJob(file.id, key);

    return updateFileStatus(key, "processing");
  } catch (error) {
    if (fileCreated) {
      try {
        await updateFileStatus(key, "error");
      } catch (catchError) {
        request.log.error(
          { fileKey: key, error: catchError },
          "Failed to update file status to error"
        );
      }
    }
    throw error;
  }
}

export async function deleteUserFile(
  userId: string,
  fileKey: string,
  request: FastifyRequest,
  reply: FastifyReply
) {
  let deletedFromB2 = false;

  try {
    const file = await getFile(userId, fileKey);

    if (!file) {
      return reply.status(404).send({
        error: "Fichier non trouvé."
      });
    }

    const versions = await getFileB2(fileKey);
    await deleteFileB2(versions, fileKey);

    deletedFromB2 = true;

    return deleteFile(file.id);
  } catch (error) {
    try {
      if (deletedFromB2) {
        await updateFileStatus(fileKey, "deleted");
      }
    } catch (catchError) {
      request.log.error(
        { fileKey, catchError },
        "Failed to update file status to deleted after B2 deletion"
      );
    }
    throw error;
  }
}

export async function getUserFile(userId: string, fileKey: string, reply: FastifyReply) {
  const fileMetadata = await getFile(userId, fileKey);

  if (!fileMetadata) {
    return reply.status(404).send({
      error: "Fichier non trouvé."
    });
  }

  const fileContent = await getFileContent(fileMetadata.id);
  const fileQuestions = await getFileQuestions(fileMetadata.id);

  return { fileMetadata, fileContent, fileQuestions };
}

export async function insertWorkerResult(
  fileId: number,
  fileKey: string,
  summary: string,
  revisionSheet: string,
  questions: FileQuestion[],
  request: FastifyRequest
) {
  try {
    const contentData = await insertFileContent(fileId, summary, revisionSheet);
    const questionsData = await insertFileQuestions(fileId, questions);

    await updateFileStatus(fileKey, "success");

    return { contentData, questionsData };
  } catch (error) {
    try {
      await updateFileStatus(fileKey, "error");
    } catch (catchError) {
      request.log.error(
        { fileKey, catchError },
        "Failed to update file status to error after inserting data"
      );
      throw error;
    }
  }
}
