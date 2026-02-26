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
 */
export async function embedText(text: string): Promise<number[]> {
  const response = await getClient().embeddings.create({
    model: MODEL,
    input: text,
  });

  return response.data[0].embedding;
}

/**
 * Blends two vectors with weight α for the second vector.
 * Result is normalized for cosine similarity: (1-α)*a + α*b, then unit-length.
 * Used to give refinements more influence in search (α ≈ 0.35).
 */
export function blendVectors(a: number[], b: number[], alpha: number): number[] {
  if (a.length !== b.length) {
    throw new Error("Vectors must have same dimension");
  }
  /**
  * Blend the vectors with the given weight, if alpha is 0.35
  * 1 - alpha = 0.65
  * alpha = 0.35
  * vectorA (the brief) * 0.65 + vectorB (the refinement) * 0.35
  */
  const blended = a.map((v, i) => (1 - alpha) * v + alpha * b[i]);
  /**
  * Magnitude is the length of the vector
  * The magnitude of the vector is the square root of the sum of the squares of the vector
  */
  const magnitude = Math.sqrt(blended.reduce((sum, v) => sum + v * v, 0));
  /**
  * If the magnitude is less than 1e-10 (nearly zero), we return the blended vector,
  * because the vector is already a unit vector
  * and we don't need to normalize it.
  */
  if (magnitude < 1e-10) return blended;
  /**
  * We need to normalize the vector to have a length of 1,
  * because after the blend the vector will have a length different from 1
  * and we need to make sure the vector is still a unit vector.
  * For example, after blending the vector might have length 1.2 or 0.8,
  * we need to normalize the vector to have a length of 1
  * so we divide the vector by the magnitude
  */
  return blended.map((v) => v / magnitude);
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
