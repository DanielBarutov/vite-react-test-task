import type { NomenclatureCreatePayload } from "@/src/types/nomenclature"
import { API_BASE, TOKEN } from "./config"

/** API expects a list of items; we send a single-item array. */
export async function createNomenclature(
  payload: NomenclatureCreatePayload
): Promise<unknown> {
  const res = await fetch(
    `${API_BASE}/nomenclature/?token=${TOKEN}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify([payload]),
    }
  )
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`API error an createNomenclature ${res.status}: ${text}`)
  }
  return res.json()
}
