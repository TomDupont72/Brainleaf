import "dotenv/config"
import Fastify from "fastify"
import swagger from "@fastify/swagger"
import swaggerUI from "@fastify/swagger-ui"
import { authRoutes } from "./routes/auth.js"
import fastifyCors from "@fastify/cors"
import { authGuard } from "./plugins/auth-guard.js"
import rateLimit from "@fastify/rate-limit"
import helmet from "@fastify/helmet"

const app = Fastify({ logger: true, bodyLimit: 1024 * 1024, trustProxy: true }) 

if (process.env.NODE_ENV != "production") {
  await app.register(swagger, {
    openapi: {
      info: {
        title: "Brainleaf API",
        version: "1.0.0",
      },
    },
  })

  await app.register(swaggerUI, {
    routePrefix: "/docs",
  })
}

await app.register(helmet, {
  contentSecurityPolicy: false,
  frameguard: false,
})
await app.register(rateLimit, {max: 100, timeWindow: "1 minute"})

app.get("/api/health", {
  schema: {
    description: "Health check",
    tags: ["system"],
    response: {
      200: {
        type: "object",
        properties: { status: { type: "string" } },
      },
    },
  },
}, async () => ({ status: "ok" }))

app.register(fastifyCors, {
  origin: process.env.CLIENT_ORIGIN,
  credentials: true,
})

await app.register(authRoutes, { prefix: "/api/auth" })
await app.register(authGuard)

await app.listen({
  port: Number(process.env.PORT ?? 8000),
  host: process.env.HOST ?? "127.0.0.1",
})