import type { NomenclatureCreatePayload } from "@/src/types/nomenclature"

const API_BASE = "https://app.tablecrm.com/api/v1"
const TOKEN = "af1874616430e04cfd4bce30035789907e899fc7c3a1a4bb27254828ff304a77"

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
    throw new Error(`API error ${res.status}: ${text}`)
  }
  return res.json()
}
