create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  short_name text not null,
  country text,
  country_code text,
  team_type text not null default 'international',
  logo_url text,
  profile text,
  founded_year integer,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.players (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  short_name text,
  country text,
  country_code text,
  role text not null default 'Batsman',
  batting_style text,
  bowling_style text,
  date_of_birth date,
  image_url text,
  teams text[] not null default '{}'::text[],
  bio text,
  batting_stats jsonb not null default '{}'::jsonb,
  bowling_stats jsonb not null default '{}'::jsonb,
  recent_form jsonb not null default '[]'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.venues (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  city text not null,
  country text not null,
  capacity integer,
  ends text[] not null default '{}'::text[],
  timezone text,
  pitch_notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.series (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  short_name text,
  type text not null default 'bilateral',
  category text not null default 'international',
  format text not null default 'T20',
  status text not null default 'upcoming',
  start_date date,
  end_date date,
  total_matches integer not null default 0,
  overview text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tournaments (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  series_id uuid references public.series(id) on delete set null,
  category text not null default 'international',
  season text,
  host_country text,
  start_date date,
  end_date date,
  overview text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  external_id text unique,
  title text not null,
  format text not null default 'T20',
  status text not null default 'upcoming',
  series_id uuid references public.series(id) on delete set null,
  tournament_id uuid references public.tournaments(id) on delete set null,
  venue_id uuid references public.venues(id) on delete set null,
  team1_id uuid references public.teams(id) on delete set null,
  team2_id uuid references public.teams(id) on delete set null,
  start_time timestamptz,
  result text,
  toss jsonb,
  match_summary text,
  live_provider text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.innings (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches(id) on delete cascade,
  innings_number integer not null,
  batting_team_id uuid references public.teams(id) on delete set null,
  bowling_team_id uuid references public.teams(id) on delete set null,
  runs integer not null default 0,
  wickets integer not null default 0,
  overs numeric(5,1) not null default 0,
  run_rate numeric(6,2),
  extras jsonb not null default '{}'::jsonb,
  declared boolean not null default false,
  follow_on boolean not null default false,
  total_text text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (match_id, innings_number)
);

create table if not exists public.batting_scorecards (
  id uuid primary key default gen_random_uuid(),
  innings_id uuid not null references public.innings(id) on delete cascade,
  player_id uuid references public.players(id) on delete set null,
  batting_position integer,
  dismissal text,
  runs integer not null default 0,
  balls integer not null default 0,
  fours integer not null default 0,
  sixes integer not null default 0,
  strike_rate numeric(7,2),
  is_not_out boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.bowling_scorecards (
  id uuid primary key default gen_random_uuid(),
  innings_id uuid not null references public.innings(id) on delete cascade,
  player_id uuid references public.players(id) on delete set null,
  overs numeric(5,1) not null default 0,
  maidens integer not null default 0,
  runs integer not null default 0,
  wickets integer not null default 0,
  economy numeric(6,2),
  wides integer not null default 0,
  no_balls integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.rankings (
  id uuid primary key default gen_random_uuid(),
  ranking_type text not null,
  format text not null,
  scope text not null default 'icc',
  team_id uuid references public.teams(id) on delete cascade,
  player_id uuid references public.players(id) on delete cascade,
  position integer not null,
  rating integer not null default 0,
  points integer,
  previous_position integer,
  published_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.records (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  record_type text not null,
  format text,
  title text not null,
  holder_player_id uuid references public.players(id) on delete set null,
  holder_team_id uuid references public.teams(id) on delete set null,
  match_id uuid references public.matches(id) on delete set null,
  series_id uuid references public.series(id) on delete set null,
  value text not null,
  numeric_value numeric,
  achieved_on date,
  description text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists teams_search_idx on public.teams using gin (to_tsvector('english', coalesce(name, '') || ' ' || coalesce(short_name, '') || ' ' || coalesce(country, '')));
create index if not exists players_search_idx on public.players using gin (to_tsvector('english', coalesce(name, '') || ' ' || coalesce(short_name, '') || ' ' || coalesce(country, '') || ' ' || coalesce(role, '')));
create index if not exists series_search_idx on public.series using gin (to_tsvector('english', coalesce(name, '') || ' ' || coalesce(short_name, '') || ' ' || coalesce(category, '')));
create index if not exists matches_search_idx on public.matches using gin (to_tsvector('english', coalesce(title, '') || ' ' || coalesce(result, '') || ' ' || coalesce(match_summary, '')));
create index if not exists matches_status_start_idx on public.matches (status, start_time desc);
create index if not exists innings_match_idx on public.innings (match_id, innings_number);
create index if not exists batting_innings_idx on public.batting_scorecards (innings_id, batting_position);
create index if not exists bowling_innings_idx on public.bowling_scorecards (innings_id);
create index if not exists rankings_lookup_idx on public.rankings (ranking_type, format, position);
create index if not exists records_lookup_idx on public.records (record_type, format, numeric_value desc);

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'teams', 'players', 'venues', 'series', 'tournaments', 'matches', 'innings',
    'batting_scorecards', 'bowling_scorecards', 'rankings', 'records'
  ]
  loop
    execute format('drop trigger if exists set_%I_updated_at on public.%I', table_name, table_name);
    execute format('create trigger set_%I_updated_at before update on public.%I for each row execute function public.set_updated_at()', table_name, table_name);
    execute format('alter table public.%I enable row level security', table_name);
    execute format('drop policy if exists %I on public.%I', table_name || ' public read', table_name);
    execute format('create policy %I on public.%I for select using (true)', table_name || ' public read', table_name);
  end loop;
end $$;
