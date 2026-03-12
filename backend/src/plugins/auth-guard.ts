import fp from "fastify-plugin";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../auth.js";

async function authGuardPlugin(app: FastifyInstance) {
  app.decorate("requireAuth", async (req: FastifyRequest, reply: FastifyReply) => {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session) {
      return reply.status(401).send({ message: "Unauthorized" });
    }

    req.user = {
      id: session.session.userId,
    };
  });
}

export const authGuard = fp(authGuardPlugin);

declare module "fastify" {
  interface FastifyInstance {
    requireAuth: (req: FastifyRequest, reply: FastifyReply) => Promise<unknown>;
  }

  interface FastifyRequest {
    user: {
      id: string;
    };
  }
}