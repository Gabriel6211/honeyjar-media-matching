import OpenAI from "openai";

const MODEL = "text-embedding-3-small";

let client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!client) {
    client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return client;
}

/**
 * Converts a piece of text into a 1536-dimensional vector using OpenAI.
 * The vector captures the semantic meaning of the text — similar topics
 * produce similar vectors, which lets us do similarity search in pgvector.
 */
export async function embedText(text: string): Promise<number[]> {
  const response = await getClient().embeddings.create({
    model: MODEL,
    input: text,
  });

  return response.data[0].embedding;
}

/**
 * Embeds multiple texts in a single API call (batched).
 * More efficient than calling embedText one at a time.
 * OpenAI supports up to 2048 inputs per batch.
 */
export async function embedTexts(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return [];

  const response = await getClient().embeddings.create({
    model: MODEL,
    input: texts,
  });

  return response.data.map((d) => d.embedding);
}
