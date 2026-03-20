import { randomUUID } from "node:crypto";
import type { MultipartFile } from "@fastify/multipart";
import { ApiError } from "./ApiError.js";
import { FastifyRequest } from "fastify";
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

export async function uploadUserFile(userId: string, data: MultipartFile, request: FastifyRequest) {
  const buffer = await data.toBuffer();
  const key = randomUUID();

  let fileCreated = false;

  try {
    const file = await insertFile(
      userId,
      data.filename,
      key,
      buffer.length,
      data.mimetype,
      "pending"
    );
    fileCreated = true;

    await insertFileB2(key, buffer, data.mimetype);

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

export async function deleteUserFile(userId: string, fileKey: string, request: FastifyRequest) {
  let deletedFromB2 = false;

  try {
    const file = await getFile(userId, fileKey);

    if (!file) {
      throw new ApiError("Fichier non trouvé", "404");
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

export async function getUserFile(userId: string, fileKey: string) {
  const fileMetadata = await getFile(userId, fileKey);

  if (!fileMetadata) {
    throw new ApiError("Fichier non trouvé", "404");
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
