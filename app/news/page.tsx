import { Header, MobileNav } from "@/components/layout/navigation"
import { NewsPageContent } from "@/components/news/news-page-content"
import { Footer } from "@/components/layout/footer"

export const metadata = {
  title: "Cricket News | CricYug",
  description: "Latest cricket news, updates, and analysis from around the world.",
}

export default function NewsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pb-20 lg:pb-0">
        <NewsPageContent />
      </main>
      <Footer />
      <MobileNav />
    </div>
  )
}
