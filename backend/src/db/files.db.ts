import { prisma } from "../db/prisma.js";
import {
  PutObjectCommand,
  ListObjectVersionsCommand,
  ListObjectVersionsCommandOutput,
  DeleteObjectCommand
} from "@aws-sdk/client-s3";
import { b2 } from "../db/b2.js";
import { Queue } from "bullmq";

export type FileQuestion = {
  fileId: number;
  question: string;
  answer: string;
};

const queue = new Queue("pdf-processing", {
  connection: {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT)
  }
});

export async function insertFile(
  userId: string,
  fileName: string,
  fileKey: string,
  size: number,
  mime: string,
  status: "pending" | "success" | "error" | "deleted" | "processing"
) {
  return prisma.file.create({
    data: {
      userId: userId,
      fileName: fileName,
      fileKey: fileKey,
      size: size,
      mime: mime,
      status: status
    }
  });
}

export async function insertFileB2(key: string, buffer: Buffer, mime: string) {
  return b2.send(
    new PutObjectCommand({
      Bucket: process.env.B2_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: mime
    })
  );
}

export async function updateFileStatus(
  fileKey: string,
  status: "pending" | "success" | "error" | "deleted" | "processing"
) {
  return prisma.file.update({
    where: { fileKey },
    data: { status }
  });
}

export async function getFiles(userId: string) {
  return prisma.file.findMany({
    where: { userId },
    select: {
      id: true,
      fileName: true,
      fileKey: true,
      size: true,
      createdAt: true,
      mime: true,
      status: true
    },
    orderBy: { createdAt: "desc" },
    take: 20
  });
}

export async function getFile(userId: string, fileKey: string) {
  return prisma.file.findFirst({
    where: { userId, fileKey }
  });
}

export async function getFileB2(fileKey: string) {
  return b2.send(
    new ListObjectVersionsCommand({
      Bucket: process.env.B2_BUCKET_NAME,
      Prefix: fileKey
    })
  );
}

export async function deleteFileB2(versions: ListObjectVersionsCommandOutput, fileKey: string) {
  for (const v of versions.Versions ?? []) {
    if (v.Key !== fileKey) continue;

    await b2.send(
      new DeleteObjectCommand({
        Bucket: process.env.B2_BUCKET_NAME,
        Key: v.Key,
        VersionId: v.VersionId
      })
    );
  }
}

export async function deleteFile(id: number) {
  return prisma.file.delete({
    where: { id: id }
  });
}

export function getFileContent(fileId: number) {
  return prisma.fileContent.findFirst({
    where: { fileId: fileId }
  });
}

export function getFileQuestions(fileId: number) {
  return prisma.fileQuestion.findMany({
    where: { fileId: fileId }
  });
}

export function insertFileContent(FileId: number, summary: string, revisionSheet: string) {
  return prisma.fileContent.create({
    data: {
      fileId: FileId,
      summary: summary,
      revisionSheet: revisionSheet
    }
  });
}

export function insertFileQuestions(fileId: number, questions: FileQuestion[]) {
  return prisma.fileQuestion.createMany({
    data: questions.map((item) => ({
      fileId: fileId,
      question: item.question,
      answer: item.answer
    }))
  });
}

export async function createNewProcessPdfJob(fileId: number, fileKey: string) {
  return await queue.add("process-pdf", {
    fileId: fileId,
    fileKey: fileKey
  });
}
