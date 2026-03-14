import { ProductCardForm } from "@/src/components/ProductCardForm"
import { Package } from "lucide-react"

function App() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="container flex h-14 items-center gap-4 px-4">
          <div className="flex items-center gap-2 font-semibold">
            <Package className="size-6 text-primary" />
            <span>TableCRM — Карточка товара</span>
          </div>
        </div>
      </header>
      <main className="container py-8 px-4">
        <div className="mb-8">
          <h1 className="text-2xl font-bold ">
            Создание карточки товара
          </h1>
          <p className="text-muted-foreground mt-1">
            Заполните данные по вкладкам и нажмите «Создать карточку товара».
          </p>
        </div>
        <ProductCardForm />
      </main>
    </div>
  )
}

export default App
