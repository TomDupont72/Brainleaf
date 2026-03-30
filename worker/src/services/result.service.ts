type AiCourseResult = {
  summary: string;
  revision_sheet_markdown: string;
  questions_answers: {
    question: string;
    answer: string;
  }[];
};

const apiUrl = process.env.VITE_API_URL;

function getHeaders(): HeadersInit {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.WORKER_INTERNAL_TOKEN}`
  };
}

export async function sendSuccessResult(
  fileId: number,
  fileKey: string,
  result: AiCourseResult
): Promise<void> {
  const response = await fetch(`${apiUrl}/api/file/insert-worker-result`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      status: "success",
      fileId,
      fileKey,
      summary: result.summary,
      revisionSheet: result.revision_sheet_markdown,
      questions: result.questions_answers
    })
  });

  if (!response.ok) {
    throw new Error(`Failed to send success result: ${response.status}`);
  }
}

export async function sendFailedResult(
  fileId: number,
  fileKey: string,
  errorMessage: string
): Promise<void> {
  const response = await fetch(`${apiUrl}/api/file/insert-worker-result`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      status: "failed",
      fileId,
      fileKey,
      errorMessage
    })
  });

  if (!response.ok) {
    throw new Error(`Failed to send failed result: ${response.status}`);
  }
}