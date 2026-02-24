import type { FastifyInstance } from "fastify"
import { auth } from "../auth.js"

export async function authRoutes(app: FastifyInstance) {
  app.route({
    method: ["GET", "POST", "OPTIONS"],
    url: "/*",
    handler: async (req, reply) => {
      const url = new URL(req.url, `${req.protocol}://${req.headers.host}`)

      const body =
        req.method === "GET" || req.method === "HEAD"
          ? undefined
          : req.body
          ? JSON.stringify(req.body)
          : undefined

      const headers = new Headers()
      for (const [k, v] of Object.entries(req.headers)) {
        if (typeof v === "string") headers.set(k, v)
        else if (Array.isArray(v)) headers.set(k, v.join(","))
      }
      if (body) headers.set("content-type", "application/json")

      const webReq = new Request(url.toString(), {
        method: req.method,
        headers,
        body,
      })

      const res = await auth.handler(webReq)

      reply.status(res.status)
      res.headers.forEach((value, key) => reply.header(key, value))

      const text = await res.text()
      reply.send(text)
    },
  })
}