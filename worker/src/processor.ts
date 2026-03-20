import { b2 } from "./db/b2";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { PDFParse } from "pdf-parse";
import { GoogleGenAI } from "@google/genai";

type Data = {
  fileId: number;
  fileKey: string;
};

const ai = new GoogleGenAI({});

const apiUrl = process.env.VITE_API_URL;

export async function processPdf(data: Data) {
  const file = await b2.send(
    new GetObjectCommand({
      Bucket: process.env.B2_BUCKET_NAME,
      Key: data.fileKey
    })
  );

  if (!file.Body) {
    throw new Error("No file body returned from B2");
  }

  const bytes = await file.Body.transformToByteArray();

  const parser = new PDFParse(bytes);

  const result = await parser.getText();

  const cleaned = result.text.replace(/\n{2,}/g, "\n").replace(/-- \d+ of \d+ --/g, "");

  const prompt = `
    Tu es un enseignant expert chargé de transformer un texte de cours en matériel pédagogique clair et structuré.

    OBJECTIF :
    À partir du texte fourni, produire :
    1. Un résumé court
    2. Une fiche de révision en Markdown
    3. Une liste de questions/réponses

    CONTRAINTES :
    - Ne pas inventer d'informations
    - Être clair et pédagogique
    - Utiliser des phrases courtes
    - Éviter les longs paragraphes
    - Optimiser pour la révision

    FORMAT DE SORTIE OBLIGATOIRE :
    Retourne uniquement un JSON valide :

    {
      "summary": "résumé court du cours",
      "revision_sheet_markdown": "fiche de révision en markdown",
      "questions_answers": [
        { "question": "...", "answer": "..." }
      ]
    }

    IMPORTANT :
    - Ne retourne AUCUN texte en dehors du JSON
    - Ne mets pas de \`\`\`json
    - Le JSON doit être valide pour JSON.parse()

    RÈGLES POUR LE RÉSUMÉ :
    - 5 à 8 phrases maximum

    RÈGLES POUR LA FICHE :
    - Markdown uniquement
    - Listes uniquement
    - Style synthétique
    - Max 400 mots
    - Pas de titre, commence directement

    RÈGLES POUR LES QUESTIONS :
    - 5 à 10 questions
    - Compréhension du contenu
    - Réponses courtes

    Pour les formules mathématiques :
    - utilise LaTeX
    - inline avec $...$
    - bloc avec $$...$$

    TEXTE :
    ${cleaned}
    `;

  const response = await ai.models.generateContent({
    model: /*"gemini-3-flash-preview"*/ "gemini-3.1-flash-lite-preview",
    contents: prompt
  });

  if (!response.text) {
    await fetch(`${apiUrl}/files/insert-worker-result`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.WORKER_INTERNAL_TOKEN}`
      },
      body: JSON.stringify({
        status: "failed",
        fileId: data.fileId,
        fileKey: data.fileKey,
        errorMessage: "LLM parsing failed"
      })
    });

    return;
  }

  const parsed = JSON.parse(response.text);

  await fetch(`${apiUrl}/api/file/insert-worker-result`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.WORKER_INTERNAL_TOKEN}`
    },
    body: JSON.stringify({
      status: "success",
      fileId: data.fileId,
      fileKey: data.fileKey,
      summary: parsed.summary,
      revisionSheet: parsed.revision_sheet_markdown,
      questions: parsed.questions_answers
    })
  });
}
