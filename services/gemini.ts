
import { GoogleGenAI, Type } from "@google/genai";
import { FinancialData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function fetchFinancialData(ticker: string): Promise<FinancialData> {
  const prompt = `
    Using Google Search, find the most recent SEC 10-K or 10-Q filing for ticker "${ticker}".
    Extract these exact data points:
    1. TTM Revenue (Trailing 12 Months)
    2. TTM Operating Income (EBIT)
    3. Most recent Effective Tax Rate (%)
    4. Total Cash & Marketable Securities
    5. Total Debt (Sum of Short-term and Long-term Debt)
    6. Common Shares Outstanding
    7. Current Market Price per Share

    Return the result in valid JSON format.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          ticker: { type: Type.STRING },
          revenueTTM: { type: Type.NUMBER, description: "Revenue in millions" },
          ebit: { type: Type.NUMBER, description: "EBIT in millions" },
          taxRate: { type: Type.NUMBER, description: "Tax rate as percentage (e.g. 21)" },
          cash: { type: Type.NUMBER, description: "Cash and equivalents in millions" },
          debt: { type: Type.NUMBER, description: "Total debt in millions" },
          shares: { type: Type.NUMBER, description: "Shares outstanding in millions" },
          price: { type: Type.NUMBER, description: "Current stock price in USD" },
        },
        required: ["ticker", "revenueTTM", "ebit", "taxRate", "cash", "debt", "shares", "price"],
      },
    },
  });

  const rawJson = response.text;
  return JSON.parse(rawJson);
}
