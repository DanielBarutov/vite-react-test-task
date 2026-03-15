import { type Category } from "@/src/types/category"
import { API_BASE, TOKEN } from "./config"

export async function getCategories(): Promise<Category[]> {
    const res = await fetch(`${API_BASE}/categories/?limit=500&token=${TOKEN}`)
    const data = await res.json()
    
    const rawResults = data.result || [] 
  
    return rawResults.map((item: any) => ({
      id: item.id,
      name: item.name
    }))
  }