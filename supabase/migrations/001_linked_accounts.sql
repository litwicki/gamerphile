-- Linked external accounts (e.g. Patreon) tied to a Battle.net user.
create table if not exists linked_accounts (
  id            bigint generated always as identity primary key,
  user_id       text        not null,
  provider      text        not null,
  provider_account_id text  not null,
  access_token  text,
  refresh_token text,
  expires_at    bigint,
  provider_email text,
  provider_name  text,
  provider_image text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),

  unique (user_id, provider)
);

-- Index for fast lookups by user
create index if not exists idx_linked_accounts_user_id on linked_accounts (user_id);
