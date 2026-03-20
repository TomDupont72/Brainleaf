import { Worker } from "bullmq";
import { processPdf } from "./processor";

async function start() {
  if (process.env.NODE_ENV !== "production") {
    const dotenv = await import("dotenv");
    dotenv.config();
  }

  const connection = {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT)
  };

  new Worker(
    "pdf-processing",
    async (job) => {
      return await processPdf(job.data);
    },
    { connection }
  );

  console.log("Worker started...");
}

start();
