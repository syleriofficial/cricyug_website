import type { Metadata } from "next"
import { Header, MobileNav } from "@/components/layout/navigation"
import { Footer } from "@/components/layout/footer"
import { AdminPageContent } from "@/components/admin/admin-page-content"

export const metadata: Metadata = {
  title: "Admin | CricYug",
  description: "CricYug admin tools for manual news drafts, featured articles, ads and SEO metadata.",
  robots: { index: false, follow: false },
}

export default function AdminPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pb-20 lg:pb-0">
        <AdminPageContent />
      </main>
      <Footer />
      <MobileNav />
    </div>
  )
}
