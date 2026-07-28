-- Training insight enhancements for an existing PERTAGAS HC database.
-- Run once in Supabase SQL Editor before re-importing the approved workbooks.

alter table public.training_records
  add column if not exists owner_function text not null default 'Unspecified',
  add column if not exists hc_cost numeric(18,2) not null default 0 check (hc_cost >= 0),
  add column if not exists function_cost numeric(18,2) not null default 0 check (function_cost >= 0),
  add column if not exists tna_based boolean not null default false;

create table if not exists public.training_participations (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.employees(id) on delete cascade,
  training_id uuid not null references public.training_records(id) on delete cascade,
  pre_test_score numeric(5,2) check (pre_test_score between 0 and 100),
  post_test_score numeric(5,2) check (post_test_score between 0 and 100),
  result text,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (employee_id, training_id)
);

create index if not exists training_participations_employee_idx
  on public.training_participations(employee_id);
create index if not exists training_participations_training_idx
  on public.training_participations(training_id);
create index if not exists training_owner_tna_idx
  on public.training_records(owner_function, tna_based, status);

drop trigger if exists training_participations_updated_at on public.training_participations;
create trigger training_participations_updated_at
before update on public.training_participations
for each row execute function public.set_updated_at();

alter table public.training_participations enable row level security;

drop policy if exists "authenticated read" on public.training_participations;
drop policy if exists "admin editor insert" on public.training_participations;
drop policy if exists "admin editor update" on public.training_participations;
drop policy if exists "admin delete" on public.training_participations;

create policy "authenticated read"
on public.training_participations for select to authenticated
using (true);

create policy "admin editor insert"
on public.training_participations for insert to authenticated
with check (
  public.current_user_role() in ('admin', 'editor')
  and created_by = auth.uid()
);

create policy "admin editor update"
on public.training_participations for update to authenticated
using (public.current_user_role() in ('admin', 'editor'))
with check (public.current_user_role() in ('admin', 'editor'));

create policy "admin delete"
on public.training_participations for delete to authenticated
using (public.current_user_role() = 'admin');
