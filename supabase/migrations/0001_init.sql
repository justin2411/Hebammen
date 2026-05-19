-- 0001_init.sql – Schema für Hebammen-Vorsorge.
-- Im Supabase SQL-Editor ausführen.

-- ----------------------------------------------------------------------------
-- Tabelle: beratungen
-- ----------------------------------------------------------------------------
create table if not exists beratungen (
  id uuid primary key default gen_random_uuid(),
  berater_id uuid references auth.users(id) not null,
  hebamme_name text not null,
  hebamme_email text,
  datum date not null default current_date,
  status text not null default 'aktiv'
    check (status in ('aktiv', 'archiviert')),
  daten jsonb not null,
  notizen jsonb default '{}'::jsonb,
  empfehlungen_gewaehlt jsonb default '[]'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists beratungen_berater_id_idx on beratungen(berater_id);
create index if not exists beratungen_status_idx on beratungen(status);

-- ----------------------------------------------------------------------------
-- Tabelle: parameter_log (Audit-Trail)
-- ----------------------------------------------------------------------------
create table if not exists parameter_log (
  id uuid primary key default gen_random_uuid(),
  parameter_typ text not null,
  alter_wert jsonb,
  neuer_wert jsonb,
  geaendert_von uuid references auth.users(id),
  begruendung text,
  created_at timestamptz default now()
);

-- ----------------------------------------------------------------------------
-- Trigger: updated_at automatisch nachziehen
-- ----------------------------------------------------------------------------
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists beratungen_updated_at on beratungen;
create trigger beratungen_updated_at
  before update on beratungen
  for each row execute function set_updated_at();

-- ----------------------------------------------------------------------------
-- Row Level Security
-- ----------------------------------------------------------------------------
alter table beratungen enable row level security;

drop policy if exists "berater_sieht_eigene_beratungen" on beratungen;
create policy "berater_sieht_eigene_beratungen"
  on beratungen for all
  using (auth.uid() = berater_id)
  with check (auth.uid() = berater_id);

alter table parameter_log enable row level security;

drop policy if exists "auth_user_kann_lesen" on parameter_log;
create policy "auth_user_kann_lesen"
  on parameter_log for select
  using (auth.role() = 'authenticated');

drop policy if exists "auth_user_kann_schreiben" on parameter_log;
create policy "auth_user_kann_schreiben"
  on parameter_log for insert
  with check (auth.uid() = geaendert_von);
