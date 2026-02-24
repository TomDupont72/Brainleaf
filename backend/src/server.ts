import "dotenv/config"
import Fastify from "fastify"
import swagger from "@fastify/swagger"
import swaggerUI from "@fastify/swagger-ui"
import { authRoutes } from "./routes/auth"
import fastifyCors from "@fastify/cors"

const app = Fastify({ logger: true })

await app.register(swagger, {
  openapi: {
    info: {
      title: "Brainleaf API",
      version: "1.0.0",
    },
  },
})

await app.register(swaggerUI, {
  routePrefix: "/docs", // Swagger UI ici
})

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

app.register(authRoutes, { prefix: "/api/auth" })

await app.listen({ port: 8000, host: "0.0.0.0" })