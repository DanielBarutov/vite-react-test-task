import { useState, useEffect } from "react"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Package,
  FileText,
  Search,
  Banknote,
  MapPin,
  Loader2,
} from "lucide-react"
import {
  type NomenclatureCreatePayload,
  CASHBACK_TYPES,
} from "@/src/types/nomenclature"
import { createNomenclature } from "@/src/api/nomenclature"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox"
import { getUnits } from "../api/getUnit"
import { type Unit } from "../types/unit"
import { getCategories } from "../api/getCategory"
import { Category } from "../types/category"
import { generateSeoWithGemini } from "../api/generateSEO"

const defaultPayload: NomenclatureCreatePayload = {
  name: "",
  type: "product",
  description_short: "",
  description_long: "",
  code: "",
  unit: 116,
  category: 2477,
  cashback_type: "lcard_cashback",
  seo_title: "",
  seo_description: "",
  seo_keywords: [],
  global_category_id: 127,
  marketplace_price: 0,
  chatting_percent: 0,
  address: "",
  latitude: 0,
  longitude: 0,
}

export function ProductCardForm() {
  const [data, setData] = useState<NomenclatureCreatePayload>(defaultPayload)
  const [seoKeywordsStr, setSeoKeywordsStr] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [units, setUnits] = useState<Unit[]>([])
  const [categories, setCategories] = useState<Category[]>([])

  const update = <K extends keyof NomenclatureCreatePayload>(
    key: K,
    value: NomenclatureCreatePayload[K]
  ) => {
    setData((prev: NomenclatureCreatePayload) => ({ ...prev, [key]: value }))
    setError(null)
  }
  useEffect(() => {
    const fetchUnits = async () => {
      try {
        const units = await getUnits()
        setUnits(units)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Ошибка загрузки единиц измерения")
      } finally {
        setLoading(false)
      }
    }
    fetchUnits()
    const fetchCategories = async () => {
      try {
        const categories = await getCategories()
        setCategories(categories)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Ошибка загрузки категорий")
      } finally {
        setLoading(false)
      }
    }
    fetchCategories()
  }, [loading])

  const handleGenerateSEO = async () => {
    const params = {
      productName: data.name,
      descriptionShort: data.description_short,
      descriptionLong: data.description_long,
    }
    try {
      const response = await generateSeoWithGemini(params)
      update("seo_title", response.seo_title)
      update("seo_description", response.seo_description)
      setSeoKeywordsStr(response.seo_keywords.join(", "))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка генерации SEO")
    }
  }
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    const payload: NomenclatureCreatePayload = {
      ...data,
      seo_keywords: seoKeywordsStr
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    }
    setLoading(true)
    try {
      await createNomenclature(payload)
      setSuccess(true)
      setData(defaultPayload)
      setSeoKeywordsStr("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка отправки")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-3xl">
      <Tabs defaultValue="main" className="w-full">
        <TabsList className="grid w-full grid-cols-5 mb-6">
          <TabsTrigger value="main" className="gap-1.5">
            <Package className="size-4" />
            Основное
          </TabsTrigger>
          <TabsTrigger value="descriptions" className="gap-1.5">
            <FileText className="size-4" />
            Описания
          </TabsTrigger>
          <TabsTrigger value="seo" className="gap-1.5">
            <Search className="size-4" />
            SEO
          </TabsTrigger>
          <TabsTrigger value="price" className="gap-1.5">
            <Banknote className="size-4" />
            Цена
          </TabsTrigger>
          <TabsTrigger value="location" className="gap-1.5">
            <MapPin className="size-4" />
            Адрес
          </TabsTrigger>
        </TabsList>

        <TabsContent value="main">
          <Card>
            <CardHeader>
              <CardTitle>Основные данные</CardTitle>
              <CardDescription>
                Название, код и категория товара для маркетплейса.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="name">
                    Название <span className="text-destructive">*</span>
                  </FieldLabel>
                  <Input
                    id="name"
                    value={data.name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      update("name", e.target.value)
                    }
                    placeholder="Название товара"
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="code">Код товара (артикул)</FieldLabel>
                  <Input
                    id="code"
                    value={data.code}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      update("code", e.target.value)
                    }
                    placeholder="Артикул"
                  />
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  
                  <Field>
                    <FieldLabel htmlFor="category">Категории</FieldLabel>
                    <Combobox
                    id="category"
                    items={categories} 
                    itemToStringValue={(category: Category) => category.name}
                    itemToStringLabel={(category: Category) => category.name}
                    value={categories.find((c) => c.id === data.category) ?? null}
                    onValueChange={(value: Category | null) =>
                      value != null && update("category", value.id || 0)
                    }>
                    <ComboboxInput placeholder="Выберите категорию" />
                    <ComboboxContent>
                      <ComboboxEmpty>Категории не найдены.</ComboboxEmpty>
                      <ComboboxList>
                        {(category: Category) => (
                          <ComboboxItem key={category.id} value={category}>
                            {category.name}
                          </ComboboxItem>
                        )}
                      </ComboboxList>
                    </ComboboxContent>
                  </Combobox>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="unit">Единица измерения</FieldLabel>
                    
                    <Combobox
                    id="unit"
                    items={units} 
                    itemToStringValue={(unit: Unit) => unit.name}
                    itemToStringLabel={(unit: Unit) => unit.name}
                    value={units.find((u) => u.id === data.unit) ?? null}
                    onValueChange={(value: Unit | null) =>
                      value != null && update("unit", value.id || 0)
                    }>
                    <ComboboxInput placeholder="Выберите единицу измерения" />
                    <ComboboxContent>
                      <ComboboxEmpty>Единицы измерения не найдены.</ComboboxEmpty>
                      <ComboboxList>
                        {(unit: Unit) => (
                          <ComboboxItem key={unit.id} value={unit}>
                            {unit.name}
                          </ComboboxItem>
                        )}
                      </ComboboxList>
                    </ComboboxContent>
                  </Combobox>
                    
                  </Field>
                </div>
                <Field>
                  <FieldLabel htmlFor="global_category_id">
                    Глобальная категория
                  </FieldLabel>
                  <Combobox
                    id="global_category_id"
                    items={categories} 
                    itemToStringValue={(category: Category) => category.name}
                    itemToStringLabel={(category: Category) => category.name}
                    value={categories.find((c) => c.id === data.global_category_id) ?? null}
                    onValueChange={(value: Category | null) =>
                      value != null && update("global_category_id", value.id || 0)
                    }>
                    <ComboboxInput placeholder="Выберите глобальную категорию" />
                    <ComboboxContent>
                      <ComboboxEmpty>Категории не найдены.</ComboboxEmpty>
                      <ComboboxList>
                        {(category: Category) => (
                          <ComboboxItem key={category.id} value={category}>
                            {category.name}
                          </ComboboxItem>
                        )}
                      </ComboboxList>
                    </ComboboxContent>
                  </Combobox>
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="descriptions">
          <Card>
            <CardHeader>
              <CardTitle>Описания</CardTitle>
              <CardDescription>
                Краткое и полное описание для карточки товара.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="description_short">
                    Краткое описание
                  </FieldLabel>
                  <Textarea
                    id="description_short"
                    value={data.description_short}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      update("description_short", e.target.value)
                    }
                    placeholder="Описание краткое"
                    rows={2}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="description_long">
                    Полное описание
                  </FieldLabel>
                  <Textarea
                    id="description_long"
                    value={data.description_long}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      update("description_long", e.target.value)
                    }
                    placeholder="Описание длинное"
                    rows={5}
                  />
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seo">
          <Card>
            <CardHeader>
              <CardTitle>SEO</CardTitle>
              <div className="flex items-center gap-2 justify-between">
              <CardDescription>
                Мета-поля для поисковых систем и карточек в выдаче.
              </CardDescription>
              <Button variant="outline" size="icon" className="w-fit p-4" onClick={handleGenerateSEO}>Сгенерировать</Button>
              </div>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="seo_title">SEO название</FieldLabel>
                  <Input
                    id="seo_title"
                    value={data.seo_title}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      update("seo_title", e.target.value)
                    }
                    placeholder="SEO название"
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="seo_description">
                    SEO описание
                  </FieldLabel>
                  <Textarea
                    id="seo_description"
                    value={data.seo_description}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      update("seo_description", e.target.value)
                    }
                    placeholder="SEO описание"
                    rows={2}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="seo_keywords">
                    Ключевые слова (через запятую)
                  </FieldLabel>
                  <Input
                    id="seo_keywords"
                    value={seoKeywordsStr}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setSeoKeywordsStr(e.target.value)
                    }
                    placeholder="SEO, Ключи"
                  />
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="price">
          <Card>
            <CardHeader>
              <CardTitle>Цена и кэшбэк</CardTitle>
              <CardDescription>
                Цена на маркетплейсе и тип кэшбэка.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="marketplace_price">
                    Цена на маркетплейсе (₽)
                  </FieldLabel>
                  <Input
                    id="marketplace_price"
                    type="number"
                    min={0}
                    step={0.01}
                    value={data.marketplace_price || ""}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      update(
                        "marketplace_price",
                        Number(e.target.value) || 0
                      )
                    }
                    placeholder="500"
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="chatting_percent">
                    Процент комиссии (%)
                  </FieldLabel>
                  <Input
                    id="chatting_percent"
                    type="number"
                    min={0}
                    max={100}
                    step={0.1}
                    value={data.chatting_percent || ""}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      update(
                        "chatting_percent",
                        Number(e.target.value) || 0
                      )
                    }
                    placeholder="4"
                  />
                </Field>
                <Field>
                  <FieldLabel>Тип кэшбэка</FieldLabel>
                  <Select
                    value={CASHBACK_TYPES.find((c) => c.value === data.cashback_type)?.label ?? ""}
                    onValueChange={(v: string | null) =>
                      v != null && update("cashback_type", v)
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CASHBACK_TYPES.map(
                        ({
                          value,
                          label,
                        }: {
                          value: string
                          label: string
                        }) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="location">
          <Card>
            <CardHeader>
              <CardTitle>Адрес и координаты</CardTitle>
              <CardDescription>
                Адрес точки и координаты для карты.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="address">Адрес</FieldLabel>
                  <Input
                    id="address"
                    value={data.address}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      update("address", e.target.value)
                    }
                    placeholder="улица Зайцева 8, Казань, Россия"
                  />
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="latitude">Широта</FieldLabel>
                    <Input
                      id="latitude"
                      type="number"
                      step="any"
                      value={data.latitude || ""}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        update("latitude", Number(e.target.value) || 0)
                      }
                      placeholder="55.7711953"
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="longitude">Долгота</FieldLabel>
                    <Input
                      id="longitude"
                      type="number"
                      step="any"
                      value={data.longitude || ""}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        update("longitude", Number(e.target.value) || 0)
                      }
                      placeholder="49.1021179"
                    />
                  </Field>
                </div>
              </FieldGroup>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="mt-6">
        <CardFooter className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-6">
          <div className="flex flex-col gap-1 min-h-8">
            {error && (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            )}
            {success && (
              <p className="text-sm text-green-600 dark:text-green-500">
                Карточка товара успешно создана.
              </p>
            )}
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Отправка…
              </>
            ) : (
              "Создать карточку товара"
            )}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}
