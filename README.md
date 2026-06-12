# CricYug

CricYug is a Next.js cricket website powered by server-side CricketData.org API routes. The API key is never used in client components and must only be provided through environment variables.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a local environment file:

```bash
cp .env.example .env.local
```

3. Add your CricketData.org key in `.env.local`:

```bash
CRICKETDATA_API_KEY=your_cricketdata_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4o-mini
NEXT_PUBLIC_ADSENSE_CLIENT=ca-pub-your_adsense_id
```

`OPENAI_API_KEY` is optional. If it is not set, CricYug still returns server-side cricket-rule predictions from official match data. `NEXT_PUBLIC_ADSENSE_CLIENT` is optional and should only be added after AdSense approval. Never expose private API keys with a `NEXT_PUBLIC_` prefix.

4. Run the development server:

```bash
npm run dev
```

5. Build for production:

```bash
npm run build
```

## API Routes

- `/api/matches` returns live, upcoming and completed matches from CricketData.org.
- `/api/matches/[id]` returns match details, scorecard when available, and commentary when available.
- `/api/series` returns CricketData.org series data.
- `/api/series/[id]/standings` returns official points table data when the provider has it.
- `/api/players` searches CricketData.org players. Use `?search=player-name`.
- `/api/teams` returns CricketData.org country/team data.
- `/api/rankings` returns official ranking data when the connected provider supports it.
- `/api/stats` returns official current scoring snapshots from live/recent match data.
- `/api/news` is ready for a future server-side editorial/CMS source and returns an empty list until articles are published.
- `/api/news/[id]` returns one manually written CricYug article.
- `/api/ai/prediction?matchId=...` returns win probability, favorite, confidence and factors.
- `/api/ai/preview?matchId=...` returns a Syleri-ready match preview.
- `/api/ai/live-insights?matchId=...` returns momentum, pressure and next-phase insights.
- `/api/ai/news-draft` accepts `POST { "headline": "...", "notes": "...", "category": "..." }` and returns an editorial draft.
- `/api/ai/search?q=india match` returns an AI-style answer backed by CricYug search results.

## Manual News

Write CricYug stories in `content/news.ts`. Add objects that match the `NewsArticle` type:

```ts
export const manualNews = [
  {
    id: "india-preview-2026",
    title: "India prepare for a packed cricket season",
    excerpt: "Short summary for cards and SEO.",
    content: "Full article body.",
    category: "Analysis",
    author: "CricYug Desk",
    publishedAt: "2026-06-10T10:00:00.000Z",
    tags: ["India", "Preview"],
  },
]
```

Redeploy after editing this file.

## Admin

Open `/admin` for the CricYug control room. It helps prepare manual news JSON, featured article ordering notes, ad slot IDs, and SEO title/description copy. Production publishing remains file-backed through `content/news.ts` until an authenticated database/CMS is connected.

## Monetization

Ad-safe slots are included for:

- Home top banner
- News sidebar
- News in-article
- Match page
- Rankings/stats top banner

Without `NEXT_PUBLIC_ADSENSE_CLIENT`, slots render as stable placeholders and do not break layout.

Fantasy / affiliate disclaimer areas are included on home, news, match and predictions surfaces. Keep affiliate links inside approved ad/editorial areas only, and do not present predictions as financial advice.

## Google Search Console

Submit this sitemap URL in Google Search Console:

```text
https://cricyug.netlify.app/sitemap.xml
```

Robots file:

```text
https://cricyug.netlify.app/robots.txt
```

## Production Environment

Set this variable in Netlify or your hosting provider:

```bash
CRICKETDATA_API_KEY=your_cricketdata_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4o-mini
NEXT_PUBLIC_ADSENSE_CLIENT=ca-pub-your_adsense_id
```

Do not prefix private keys with `NEXT_PUBLIC_`. Client components call only local `/api/*` routes, so CricketData.org and AI provider keys stay server-side.
