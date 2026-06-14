# CricYug

CricYug is a Next.js cricket knowledge platform backed by Supabase PostgreSQL. Historical players, teams, venues, series, scorecards, rankings and records come from the CricYug database. External cricket APIs are optional and should only be used for live match fallback data.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a local environment file:

```bash
cp .env.example .env.local
```

3. Add your Supabase and optional live/AI keys in `.env.local`:

```bash
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_server_only_service_role_key
SUPABASE_ANON_KEY=your_optional_anon_key
CRICKETDATA_API_KEY=your_cricketdata_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4o-mini
NEXT_PUBLIC_ADSENSE_CLIENT=ca-pub-your_adsense_id
```

`SUPABASE_SERVICE_ROLE_KEY`, `CRICKETDATA_API_KEY`, and `OPENAI_API_KEY` are server-only keys. Never expose them with a `NEXT_PUBLIC_` prefix. `CRICKETDATA_API_KEY` is optional live-match fallback data only. `OPENAI_API_KEY` is optional; without it CricYug still returns server-side cricket-rule answers. `NEXT_PUBLIC_ADSENSE_CLIENT` is optional and should only be added after AdSense approval.

4. Create the Supabase PostgreSQL tables:

```bash
supabase db push
```

The schema lives in `supabase/migrations/202606140001_cricyug_knowledge_schema.sql` and creates:

```text
players, teams, venues, series, tournaments, matches, innings,
batting_scorecards, bowling_scorecards, rankings, records
```

5. Run the development server:

```bash
npm run dev
```

6. Build for production:

```bash
npm run build
```

## API Routes

- `/api/matches` returns CricYug database matches first; CricketData.org is optional live fallback.
- `/api/matches/[id]` returns CricYug database match details and scorecards first.
- `/api/series` returns CricYug database series data.
- `/api/series/[id]` returns one CricYug database series.
- `/api/series/[id]/standings` returns official points table data when the provider has it.
- `/api/players` searches CricYug database players. Use `?search=player-name`.
- `/api/players/[id]` returns one CricYug database player profile.
- `/api/teams` returns CricYug database teams.
- `/api/teams/[id]` returns one CricYug database team profile.
- `/api/rankings` returns CricYug database rankings.
- `/api/records` returns CricYug database historical records.
- `/api/stats` returns database records through the stats page.
- `/api/news` is ready for a future server-side editorial/CMS source and returns an empty list until articles are published.
- `/api/news/[id]` returns one manually written CricYug article.
- `/api/search?q=india` returns advanced search results from the CricYug database.
- `/api/assistant?q=india` returns the AI cricket assistant answer backed by CricYug database results.
- `/api/ai/prediction?matchId=...` returns win probability, favorite, confidence and factors.
- `/api/ai/preview?matchId=...` returns a Syleri-ready match preview.
- `/api/ai/live-insights?matchId=...` returns momentum, pressure and next-phase insights.
- `/api/ai/news-draft` accepts `POST { "headline": "...", "notes": "...", "category": "..." }` and returns an editorial draft.
- `/api/ai/search?q=india match` returns an AI-style answer backed by CricYug database search results.

## Knowledge Platform Pages

- `/players/[id]` player profile pages
- `/teams/[id]` team profile pages
- `/matches/[id]` match scorecard pages
- `/series/[id]` series pages
- `/search` advanced database search
- `/assistant` AI cricket assistant
- `/rankings` ICC/team/player rankings from CricYug database
- `/stats` historical records from CricYug database

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

Without `NEXT_PUBLIC_ADSENSE_CLIENT`, ad slots stay hidden so no demo ad boxes appear in production.

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
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_server_only_service_role_key
SUPABASE_ANON_KEY=your_optional_anon_key
CRICKETDATA_API_KEY=your_cricketdata_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4o-mini
NEXT_PUBLIC_ADSENSE_CLIENT=ca-pub-your_adsense_id
```

Do not prefix private keys with `NEXT_PUBLIC_`. Client components call only local `/api/*` routes, so Supabase service role, CricketData.org and AI provider keys stay server-side.
