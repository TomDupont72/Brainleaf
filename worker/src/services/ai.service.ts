import { GoogleGenAI } from "@google/genai";

type AiCourseResult = {
  summary: string;
  revision_sheet_markdown: string;
  questions_answers: {
    question: string;
    answer: string;
  }[];
};

const ai = new GoogleGenAI({});

export async function generateCourseMaterial(cleanedText: string): Promise<AiCourseResult> {
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
    ${cleanedText}
    `;

  const response = await ai.models.generateContent({
    model: "gemini-3.1-flash-lite-preview",
    contents: prompt
  });

  if (!response.text) {
    throw new Error("LLM parsing failed");
  }

  return JSON.parse(response.text);
}