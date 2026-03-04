import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify"

export async function authGuard(app: FastifyInstance) {
  app.decorate("requireAuth", async (req: FastifyRequest, reply: FastifyReply) => {
    const auth = req.headers.authorization
    if (!auth?.startsWith("Bearer ")) {
      return reply.status(401).send({ message: "Unauthorized" })
    }

    // const token = auth.slice("Bearer ".length)
    // TODO: vérifie ton token (Better Auth / JWT / session)
    // Si OK, tu peux attacher un user à req, ex:
    // req.user = decodedUser

    // Pour l’instant on laisse “passer” si token présent
    // return
  })
}

// Typage TS (optionnel)
declare module "fastify" {
  interface FastifyInstance {
    requireAuth: (req: FastifyRequest, reply: FastifyReply) => Promise<void>
  }
}