import { type Unit } from "@/src/types/unit"
import { API_BASE, TOKEN } from "./config"

export async function getUnits(): Promise<Unit[]> {
    const res = await fetch(`${API_BASE}/units/?limit=500&token=${TOKEN}`)
    const data = await res.json()
    
    const rawResults = data.result || [] 
  
    return rawResults.map((item: any) => ({
      id: item.id,
      name: item.name
    }))
  }