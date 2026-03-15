import { Category } from "../types/category"
import { Unit } from "../types/unit"
import { AI_TOKEN } from "./config"

export interface SeoGenerated {
  description_short: string
  description_long: string
  category_id: number
  unit_id: number
  global_category_id: number
  seo_title: string
  seo_description: string
  seo_keywords: string[]
}

export async function generateSeoWithGemini(params: {
    productName: string
    categories: Category[]
    units: Unit[]
    globalCategories: Category[]
  }): Promise<SeoGenerated> {
    const { productName, categories, units, globalCategories } = params
    const categoriesText = categories.map((c) => `${c.id}: ${c.name}`).join(", ")
    const unitsText = units.map((u) => `${u.id}: ${u.name}`).join(", ")
    const globalCategoriesText = globalCategories.map((c) => `${c.id}: ${c.name}`).join(", ")
    const prompt = `Ты — заполнитель данных для карточки товара. Сгенерируй JSON для товара: "${productName}". 
    Заполни краткое описание для карточки товара: {descriptionShort: string}.
    Заполни полное описание для карточки товара: {descriptionLong: string}.
    Выбери категорию из списка более подходящую для товара. Список (id: название): ${categoriesText}. Верни её id в поле category_id.
    Выбери единицу измерения из списка более подходящую для товара. Список (id: название): ${unitsText}. Верни её id в поле unit_id.
    Выбери родительскую категорию из списка более подходящую для выбранной категории, но если ее нет, то выбери такую же как и категория. Список (id: название): ${globalCategoriesText}. Верни её id в поле global_category_id.
    А теперь ты SEO-специалист. Сгенерируй SEO-поля для товара: "${productName}". 
    Краткое описание SEO: {seo_description_short: string}.
    Полное описание SEO: {seo_description_long: string}.
    А также сгенирируй от 5 до 10 SEO-ключевых слов для товара: "${productName}".
    Верни СТРОГО JSON c заполненными полями: {"description_short": "...", "description_long": "...", "category_id": "...", "unit_id": "...", "global_category_id": "...", "seo_title": "...", "seo_description": "...", "seo_keywords": ["...", "..."]}`
  
    
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent`
  
    const res = await fetch(url, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "x-goog-api-key": AI_TOKEN 
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

  