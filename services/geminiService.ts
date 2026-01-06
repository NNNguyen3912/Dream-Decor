
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { GoogleGenAI, Type } from "@google/genai";
import { AIDesignGoal, FurnitureType, HomeStats, Grid, MagazineSnippet } from "../types";

const modelId = 'gemini-3-flash-preview';

const goalSchema = {
  type: Type.OBJECT,
  properties: {
    description: {
      type: Type.STRING,
      description: "A professional interior design suggestion.",
    },
    targetType: {
      type: Type.STRING,
      enum: ['style', 'budget', 'furniture_count'],
      description: "Metric to track.",
    },
    targetValue: {
      type: Type.INTEGER,
      description: "Target value to reach.",
    },
    furnitureType: {
      type: Type.STRING,
      enum: Object.values(FurnitureType).filter(f => f !== FurnitureType.None),
      description: "Specific furniture required if targetType is furniture_count.",
    },
    reward: {
      type: Type.INTEGER,
      description: "Budget reward.",
    },
  },
  required: ['description', 'targetType', 'targetValue', 'reward'],
};

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function generateContentWithRetry(
  ai: GoogleGenAI,
  model: string,
  params: any,
  retries = 3
): Promise<any> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await ai.models.generateContent({
        model,
        ...params,
      });
    } catch (error: any) {
      if (
        (error.status === 429 || error.status === 503 || (error.message && error.message.includes('429'))) &&
        attempt < retries
      ) {
        const delay = Math.pow(2, attempt) * 1000 + Math.random() * 500;
        console.warn(`Gemini API rate limited (attempt ${attempt + 1}/${retries + 1}). Retrying in ${Math.round(delay)}ms...`);
        await sleep(delay);
        continue;
      }
      throw error;
    }
  }
}

export const generateDesignGoal = async (stats: HomeStats, grid: Grid): Promise<AIDesignGoal | null> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const counts: Record<string, number> = {};
  grid.flat().forEach(tile => {
    if (tile.furnitureType !== FurnitureType.None) {
      counts[tile.furnitureType] = (counts[tile.furnitureType] || 0) + 1;
    }
  });

  const context = `
    Room Status:
    Phase: ${stats.phase}, Budget: $${stats.budget}, Style: ${stats.stylePoints}
    Current Inventory: ${JSON.stringify(counts)}
  `;

  try {
    const result = await generateContentWithRetry(ai, modelId, {
      contents: `${context}\nHãy gợi ý mục tiêu thiết kế nội thất chuyên nghiệp tiếp theo. Mô tả phải bằng tiếng Việt. Trả về JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: goalSchema,
      },
    });

    if (result.text) {
      const data = JSON.parse(result.text);
      return { ...data, completed: false };
    }
  } catch (error) {
    console.warn("Gemini API skipped after retries, falling back to local quest.");
    return null;
  }
  return null;
};

export const generateMagazineSnippet = async (stats: HomeStats): Promise<MagazineSnippet | null> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const result = await generateContentWithRetry(ai, modelId, {
      contents: `Generate a 1-sentence interior design trend or tip. Style: ${stats.stylePoints}. Return JSON {text, type}.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            text: { type: Type.STRING },
            type: { type: Type.STRING, enum: ['trend', 'critique', 'tip'] }
          },
          required: ['text', 'type']
        }
      },
    });
    if (result.text) {
      const data = JSON.parse(result.text);
      return { id: Math.random().toString(), ...data };
    }
  } catch (e) { return null; }
  return null;
};
