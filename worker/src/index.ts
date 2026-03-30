import { Worker } from "bullmq";
import { processPdf } from "./processor";

const connection = {
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT)
};

const worker = new Worker(
  "pdf-processing",
  async (job) => {
    return processPdf(job.data);
  },
  { connection }
);

worker.on("completed", (job) => {
  console.log(`Job ${job.id} done`);
});

worker.on("failed", (job, err) => {
  console.error(`Job ${job?.id} failed:`, err);
});