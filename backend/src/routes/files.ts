import { randomUUID } from "node:crypto";
import { DeleteObjectCommand, ListObjectVersionsCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { b2 } from "../db/b2.js";
import { prisma } from "../db/prisma.js";

export async function fileRoutes(fastify: FastifyInstance) {
  fastify.post("/upload", { preHandler: [fastify.requireAuth] }, async function (request: FastifyRequest, reply: FastifyReply) {
    const data = await request.file();
    const userId = request.user.id;

    if (!data) {
      return reply.code(400).send({ error: "Aucun fichier reçu" });
    }

    const buffer = await data.toBuffer();
    const key = randomUUID();

    await b2.send(
      new PutObjectCommand({
        Bucket: process.env.B2_BUCKET_NAME,
        Key: key,
        Body: buffer,
        ContentType: data.mimetype,
      })
    );

    const res = await prisma.file.create({
        data: {
            userId: userId,
            fileName: data.filename,
            fileKey: key,
            size: buffer.length,
        }
    })

    return reply.send({ file: res });
  });

  fastify.get("/files", { preHandler: [fastify.requireAuth] }, async function (request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user.id;
    const files = await prisma.file.findMany({
        where: { userId },
        select: {
            id: true,
            fileName: true,
            fileKey: true,
            size: true,
            createdAt: true,
        }
    });

    return reply.send({ files });
  });

  fastify.post("/delete/:fileKey", { preHandler: [fastify.requireAuth] }, async function (request: FastifyRequest, reply: FastifyReply) {
    const { fileKey } = request.params as { fileKey: string };
    const userId = request.user.id;

    const file = await prisma.file.findFirst({
        where: { fileKey: fileKey, userId: userId },
    });

    if (!file) {
        return reply.code(404).send({ error: "Fichier non trouvé" });
    }

    const versions = await b2.send(
      new ListObjectVersionsCommand({
        Bucket: process.env.B2_BUCKET_NAME,
        Prefix: file.fileKey
      })
    );

    for (const v of versions.Versions ?? []) {
      if (v.Key !== file.fileKey) continue;

      await b2.send(
        new DeleteObjectCommand({
          Bucket: process.env.B2_BUCKET_NAME,
          Key: v.Key,
          VersionId: v.VersionId
        })
      );
    }

    await prisma.file.delete({
        where: { id: file.id },
    });

    return reply.send({ message: "Fichier supprimé" });
  });

  fastify.get("/files/:fileKey", { preHandler: [fastify.requireAuth] }, async function (request: FastifyRequest, reply: FastifyReply) {
    const { fileKey } = request.params as { fileKey: string };
    const userId = request.user.id;
    
    const file = await prisma.file.findFirst({
        where: { fileKey: fileKey, userId: userId },
    });

    if (!file) {
        return reply.code(404).send({ error: "Fichier non trouvé" });
    }

    return reply.send({
        file: file,
    });
  })
}