-- Article categories for WoW news
create table if not exists article_categories (
  id bigint generated always as identity primary key,
  slug text not null unique,
  label text not null,
  created_at timestamptz not null default now()
);

insert into article_categories (slug, label) values
  ('patch-notes', 'Patch Notes'),
  ('raid-dungeon', 'Raids & Dungeons'),
  ('pvp', 'PvP'),
  ('class-changes', 'Class Changes'),
  ('mythic-plus', 'Mythic+'),
  ('race-world-first', 'Race to World First'),
  ('esports', 'Esports'),
  ('lore', 'Lore & Story'),
  ('community', 'Community'),
  ('general', 'General')
on conflict (slug) do nothing;

-- Articles table
create table if not exists articles (
  id bigint generated always as identity primary key,
  title text not null,
  slug text not null unique,
  body text not null,
  source_url text not null unique,
  source_name text not null,
  category_id bigint not null references article_categories(id),
  author text not null default 'gamerbot',
  image_url text,
  published_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists idx_articles_category on articles(category_id);
create index if not exists idx_articles_published on articles(published_at desc);
create index if not exists idx_articles_slug on articles(slug);
