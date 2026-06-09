import Link from "next/link"
import { Header, MobileNav } from "@/components/layout/navigation"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"

interface StaticPageProps {
  title: string
  description: string
  sections: Array<{
    title: string
    body: string
  }>
}

export function StaticPage({ title, description, sections }: StaticPageProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pb-20 lg:pb-0">
        <section className="py-10 lg:py-16">
          <div className="mx-auto max-w-4xl px-4">
            <div className="mb-10">
              <h1 className="text-4xl font-bold tracking-tight">{title}</h1>
              <p className="mt-4 text-lg text-muted-foreground">{description}</p>
            </div>
            <div className="space-y-5">
              {sections.map((section) => (
                <article key={section.title} className="rounded-xl border border-border bg-card p-5">
                  <h2 className="text-xl font-semibold">{section.title}</h2>
                  <p className="mt-3 leading-7 text-muted-foreground">{section.body}</p>
                </article>
              ))}
            </div>
            <div className="mt-8">
              <Button asChild>
                <Link href="/">Back to CricYug</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <MobileNav />
    </div>
  )
}
