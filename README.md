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
```

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
- `/api/news` is ready for a future server-side editorial/CMS source and returns an empty list until articles are published.

## Production Environment

Set this variable in Netlify or your hosting provider:

```bash
CRICKETDATA_API_KEY=your_cricketdata_api_key_here
```

Do not prefix the key with `NEXT_PUBLIC_`. Client components call only local `/api/*` routes, so the CricketData.org key stays server-side.
