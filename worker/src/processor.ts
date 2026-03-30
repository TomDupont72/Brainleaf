import { downloadFileBytes } from "./services/b2.service";
import { extractTextFromPdf } from "./services/pdf.service";
import { generateCourseMaterial } from "./services/ai.service";
import { sendFailedResult, sendSuccessResult } from "./services/result.service";

type WorkerJobData = {
  fileId: number;
  fileKey: string;
};

export async function processPdf(data: WorkerJobData): Promise<void> {
  try {
    const bytes = await downloadFileBytes(data.fileKey);

    const rawText = await extractTextFromPdf(bytes);

    const cleanedText = rawText.replace(/\n{2,}/g, "\n").replace(/-- \d+ of \d+ --/g, "").trim();

    const result = await generateCourseMaterial(cleanedText);

    await sendSuccessResult(data.fileId, data.fileKey, result);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown worker error";

    await sendFailedResult(data.fileId, data.fileKey, errorMessage);
    throw error;
  }
}