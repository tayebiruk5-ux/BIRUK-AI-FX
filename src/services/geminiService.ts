import { GoogleGenAI, Type } from "@google/genai";
import { AIRecommendation, PricePoint } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function analyzeMarket(
  symbol: string,
  priceHistory: PricePoint[]
): Promise<AIRecommendation> {
  const currentPrice = priceHistory[priceHistory.length - 1]?.price;
  const prompt = `Analyze the following market data for ${symbol}. 
  Current Price: $${currentPrice}
  Recent Price History: ${JSON.stringify(priceHistory.slice(-20))}
  
  Act as a Senior Market Analyst integrating data intelligence from TradingView, Bloomberg, and institutional trading books (Price Action, SMC, ICT).
  
  Provide a professional trading signal in Amharic. 
  Include:
  1. Signal: BUY, SELL, or HOLD
  2. Confidence: (0-100)
  3. Reasoning: Expert technical analysis in Amharic, referencing key levels, market structure (Bullish/Bearish), and indicators like RSI or Liquidity zones.
  4. Entry: Suggested buy/sell price.
  5. Target: Take profit price (logical resistance/support).
  6. StopLoss: Risk management price.
  
  Make the reasoning technical and explain "WHY" the signal is triggered.
  
  Return ONLY a JSON object matching the schema.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            signal: { type: Type.STRING, enum: ["BUY", "SELL", "HOLD"] },
            confidence: { type: Type.NUMBER },
            reasoning: { type: Type.STRING },
            entry: { type: Type.NUMBER },
            target: { type: Type.NUMBER },
            stopLoss: { type: Type.NUMBER },
          },
          required: ["signal", "confidence", "reasoning", "entry", "target", "stopLoss"],
        },
      },
    });

    return JSON.parse(response.text || "{}") as AIRecommendation;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return {
      signal: 'HOLD',
      confidence: 0,
      reasoning: "የገበያ ትንተና በአሁኑ ጊዜ አልተገኘም።",
      entry: currentPrice,
      target: currentPrice * 1.05,
      stopLoss: currentPrice * 0.95
    };
  }
}

export async function chatWithAI(
  symbol: string,
  price: number,
  message: string,
  history: { role: 'user' | 'model'; parts: { text: string }[] }[]
): Promise<string> {
  try {
    const chat = ai.chats.create({
      model: "gemini-3-flash-preview",
      config: {
        systemInstruction: `You are Biruk AI, a professional AI Trading Assistant. 
        Current Market Context: ${symbol} is trading at $${price.toLocaleString()}.
        Always provide clear advice (BUY, SELL, or HOLD) when asked, and explain why.
        Respond in Amharic as requested by the user. 
        Keep responses concise and data-driven.`
      },
      history: history
    });

    const fullMessage = `[Current Context: ${symbol} @ $${price}] User message: ${message}`;
    const result = await chat.sendMessage({ message: fullMessage });
    return result.text || "ይቅርታ፣ ምላሽ ማግኘት አልተቻለም።";
  } catch (error) {
    console.error("Chat Error:", error);
    return "ይቅርታ፣ የንግድ ረዳቱ በአሁኑ ጊዜ አልተገኘም።";
  }
}
