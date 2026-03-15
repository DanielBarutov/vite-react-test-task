import { AI_TOKEN } from "./config"

export interface SeoGenerated {
  seo_title: string
  seo_description: string
  seo_keywords: string[]
}

export async function generateSeoWithGemini(params: {
    productName: string
    descriptionShort: string
    descriptionLong: string
  }): Promise<SeoGenerated> {
    const { productName, descriptionShort, descriptionLong } = params
    
    const prompt = `Ты — SEO-специалист. Сгенерируй JSON для товара: "${productName}". 
    Краткое описание: "${descriptionShort}".
    Полное описание: "${descriptionLong}".
    Верни СТРОГО JSON: {"seo_title": "...", "seo_description": "...", "seo_keywords": ["...", "..."]}`
  
    // Используем актуальную модель из твоего примера
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`
  
    const res = await fetch(url, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "x-goog-api-key": AI_TOKEN // Передаем ключ в заголовке, как в curl
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.1,
        },
      }),
    })
  
    if (!res.ok) {
      const err = await res.json()
      console.error("Full Error:", err)
      throw new Error(`Gemini Error: ${res.status}`)
    }
  
    const data = await res.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text
    
    return JSON.parse(text)
  }