import { GetObjectCommand } from "@aws-sdk/client-s3";
import { b2 } from "../db/b2";

export async function downloadFileBytes(fileKey: string): Promise<Uint8Array> {
  const file = await b2.send(
    new GetObjectCommand({
      Bucket: process.env.B2_BUCKET_NAME,
      Key: fileKey
    })
  );

  if (!file.Body) {
    throw new Error("No file body returned from B2");
  }

  return await file.Body.transformToByteArray();
}
