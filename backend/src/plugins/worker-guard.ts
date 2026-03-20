import fp from "fastify-plugin";
import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

async function workerGuardPlugin(app: FastifyInstance) {
  app.decorate("requireWorker", async (req: FastifyRequest, reply: FastifyReply) => {
    const authHeader = req.headers.authorization;

    const expected = `Bearer ${process.env.WORKER_INTERNAL_TOKEN}`;

    if (authHeader !== expected) {
      return reply.status(401).send({ message: "Unauthorized" });
    }
  });
}

export const workerGuard = fp(workerGuardPlugin);

declare module "fastify" {
  interface FastifyInstance {
    requireWorker: (req: FastifyRequest, reply: FastifyReply) => Promise<unknown>;
  }
}
