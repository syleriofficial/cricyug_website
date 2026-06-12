"use client"

import { useMemo, useState } from "react"
import { Clipboard, Newspaper, Search, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"

const categories = ["India", "IPL", "World Cricket", "Fantasy", "Analysis"]

export function AdminPageContent() {
  const [title, setTitle] = useState("")
  const [excerpt, setExcerpt] = useState("")
  const [category, setCategory] = useState(categories[0])
  const [seoTitle, setSeoTitle] = useState("")
  const [seoDescription, setSeoDescription] = useState("")

  const articleJson = useMemo(() => {
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")

    return JSON.stringify({
      id: slug || "new-article-slug",
      title: title || "Article title",
      excerpt: excerpt || "Article excerpt",
      content: "",
      category,
      author: "CricYug Desk",
      publishedAt: new Date().toISOString(),
      tags: [],
      seoTitle: seoTitle || title,
      seoDescription: seoDescription || excerpt,
    }, null, 2)
  }, [category, excerpt, seoDescription, seoTitle, title])

  async function copyJson() {
    await navigator.clipboard.writeText(articleJson)
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase text-primary">Admin</p>
        <h1 className="text-3xl font-bold">CricYug Control Room</h1>
        <p className="mt-2 max-w-3xl text-muted-foreground">
          Manage manual news, featured article planning, ad slot IDs and SEO copy. Production publishing remains server-side
          through the manual news file until authenticated database storage is connected.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
        <section className="rounded-xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center gap-3">
            <Newspaper className="h-5 w-5 text-primary" />
            <h2 className="font-semibold">Add / Edit News Draft</h2>
          </div>
          <div className="space-y-4">
            <Field label="Title" value={title} onChange={setTitle} placeholder="News headline" />
            <Field label="Excerpt" value={excerpt} onChange={setExcerpt} placeholder="Short summary" textarea />
            <label className="block">
              <span className="text-sm font-medium">Category</span>
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
              >
                {categories.map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>
            <Field label="SEO title" value={seoTitle} onChange={setSeoTitle} placeholder="Manual SEO title" />
            <Field label="SEO description" value={seoDescription} onChange={setSeoDescription} placeholder="Manual SEO description" textarea />
          </div>
        </section>

        <aside className="space-y-6">
          <section className="rounded-xl border border-border bg-card p-5">
            <div className="mb-4 flex items-center gap-3">
              <Clipboard className="h-5 w-5 text-primary" />
              <h2 className="font-semibold">Generated News JSON</h2>
            </div>
            <pre className="max-h-80 overflow-auto rounded-lg bg-muted p-3 text-xs text-muted-foreground">{articleJson}</pre>
            <Button onClick={copyJson} className="mt-4 w-full">Copy JSON</Button>
          </section>

          <section className="rounded-xl border border-border bg-card p-5">
            <div className="mb-3 flex items-center gap-3">
              <Settings className="h-5 w-5 text-primary" />
              <h2 className="font-semibold">Ads & Featured Controls</h2>
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Ad slots are stable: top banner, in-article, sidebar and match page.</li>
              <li>Set `NEXT_PUBLIC_ADSENSE_CLIENT` only after AdSense approval.</li>
              <li>Featured articles are controlled by ordering `content/news.ts`.</li>
            </ul>
          </section>

          <section className="rounded-xl border border-border bg-card p-5">
            <div className="mb-3 flex items-center gap-3">
              <Search className="h-5 w-5 text-primary" />
              <h2 className="font-semibold">SEO Checklist</h2>
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Unique title and description per article.</li>
              <li>Use one clear H1.</li>
              <li>Keep article slug readable.</li>
              <li>Schema.org Article is generated on published pages.</li>
            </ul>
          </section>
        </aside>
      </div>
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  textarea,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder: string
  textarea?: boolean
}) {
  const className = "mt-1 w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"

  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      {textarea ? (
        <textarea value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} rows={3} className={className} />
      ) : (
        <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className={className} />
      )}
    </label>
  )
}
