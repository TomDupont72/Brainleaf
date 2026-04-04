import { PDFParse } from "pdf-parse";

export async function extractTextFromPdf(bytes: Uint8Array): Promise<string> {
  const parser = new PDFParse(bytes);
  const result = await parser.getText();
  return result.text;
}
