import "dotenv/config"
import { PrismaClient } from "../../generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) {
  throw new Error("DATABASE_URL is missing. Check backend/.env and dotenv loading.")
}

const pool = new Pool({ connectionString: databaseUrl })
const adapter = new PrismaPg(pool)

export const prisma = new PrismaClient({ adapter })