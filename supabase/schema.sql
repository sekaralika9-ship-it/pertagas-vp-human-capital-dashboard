-- PERTAGAS HC Operation Dashboard database schema
create extension if not exists "pgcrypto";

create type public.user_role as enum ('admin', 'editor', 'viewer');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  function text not null default '',
  role public.user_role not null default 'viewer',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.app_settings (
  id uuid primary key default gen_random_uuid(),
  application_name text not null default 'PERTAGAS HC Operation Dashboard',
  organisation_name text not null default 'PERTAMINA GAS',
  vision_heading text not null default 'OUR VISION',
  vision_title text not null default E'To be a Trusted Energy Partner\nDriving Growth and Sustainability',
  vision_description text not null default 'Through excellence in people, process, and performance, we empower our workforce to deliver sustainable energy solutions and create value for Indonesia.',
  default_currency text not null default 'IDR' check (char_length(default_currency) = 3),
  default_dashboard_year integer not null default extract(year from current_date)::integer check (default_dashboard_year between 2000 and 2100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.employees (
  id uuid primary key default gen_random_uuid(),
  employee_number text not null unique,
  full_name text not null,
  email text,
  function text not null,
  department text,
  position text,
  grade text,
  employment_status text not null check (employment_status in ('active','inactive','retired','secondment')),
  join_date date,
  location text,
  notes text,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.tna_records (
  id uuid primary key default gen_random_uuid(),
  year integer not null check (year between 2000 and 2100),
  function text not null,
  department text,
  competency_category text not null,
  competency_gap text not null,
  proposed_training text not null,
  priority text not null check (priority in ('low','medium','high','critical')),
  participant_count integer not null check (participant_count >= 0),
  target_completion_date date,
  status text not null check (status in ('draft','proposed','approved','in_progress','completed','cancelled')),
  notes text,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.budget_records (
  id uuid primary key default gen_random_uuid(),
  year integer not null check (year between 2000 and 2100),
  budget_category text not null,
  cost_centre text not null,
  programme_name text not null,
  allocated_amount numeric(18,2) not null default 0 check (allocated_amount >= 0),
  used_amount numeric(18,2) not null default 0 check (used_amount >= 0),
  committed_amount numeric(18,2) not null default 0 check (committed_amount >= 0),
  remaining_amount numeric(18,2) generated always as (allocated_amount - used_amount - committed_amount) stored,
  currency text not null default 'IDR' check (char_length(currency) = 3),
  notes text,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint budget_not_overspent check (used_amount + committed_amount <= allocated_amount)
);

create table public.training_records (
  id uuid primary key default gen_random_uuid(),
  training_title text not null,
  category text not null,
  provider text,
  training_method text not null check (training_method in ('classroom','online','blended','coaching','certification','workshop','seminar')),
  start_date date not null,
  end_date date not null,
  participant_count integer not null check (participant_count >= 0),
  planned_cost numeric(18,2) check (planned_cost >= 0),
  actual_cost numeric(18,2) check (actual_cost >= 0),
  owner_function text not null default 'Unspecified',
  hc_cost numeric(18,2) not null default 0 check (hc_cost >= 0),
  function_cost numeric(18,2) not null default 0 check (function_cost >= 0),
  tna_based boolean not null default false,
  status text not null check (status in ('planned','approved','ongoing','completed','cancelled')),
  completion_percentage integer not null default 0 check (completion_percentage between 0 and 100),
  certificate_link text,
  notes text,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint valid_training_dates check (end_date >= start_date)
);

create table public.training_participations (
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

create table public.competency_records (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.employees(id) on delete restrict,
  competency_name text not null,
  competency_category text not null,
  current_level integer not null check (current_level between 1 and 5),
  target_level integer not null check (target_level between 1 and 5),
  assessment_date date not null,
  assessor text,
  development_action text,
  next_review_date date,
  notes text,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.audit_readiness_records (
  id uuid primary key default gen_random_uuid(),
  audit_theme text not null,
  audit_standard text not null check (audit_standard in ('ISO 9001','ISO 14001','ISO 45001','ISO 37001','ISO 22301','Other')),
  clause text,
  function text not null,
  requirement text not null,
  evidence_required text,
  evidence_link text,
  person_in_charge text,
  due_date date,
  readiness_status text not null check (readiness_status in ('not_started','in_progress','ready','needs_improvement','overdue')),
  score integer check (score between 0 and 100),
  auditor_notes text,
  internal_notes text,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  document_name text not null,
  document_category text not null,
  document_number text,
  revision text,
  owner_function text not null,
  description text,
  file_url text not null check (file_url ~* '^https?://'),
  file_type text,
  file_size bigint check (file_size >= 0),
  effective_date date,
  review_date date,
  status text not null check (status in ('draft','active','under_review','expired','archived')),
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index employees_status_idx on public.employees(employment_status);
create index employees_function_idx on public.employees(function);
create index tna_year_function_idx on public.tna_records(year, function);
create index budget_year_idx on public.budget_records(year);
create index training_start_status_idx on public.training_records(start_date, status);
create index training_owner_tna_idx on public.training_records(owner_function, tna_based, status);
create index training_participations_employee_idx on public.training_participations(employee_id);
create index training_participations_training_idx on public.training_participations(training_id);
create index competency_employee_idx on public.competency_records(employee_id);
create index audit_function_status_idx on public.audit_readiness_records(function, readiness_status);
create index documents_status_created_idx on public.documents(status, created_at desc);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger settings_updated_at before update on public.app_settings for each row execute function public.set_updated_at();
create trigger employees_updated_at before update on public.employees for each row execute function public.set_updated_at();
create trigger tna_updated_at before update on public.tna_records for each row execute function public.set_updated_at();
create trigger budget_updated_at before update on public.budget_records for each row execute function public.set_updated_at();
create trigger training_updated_at before update on public.training_records for each row execute function public.set_updated_at();
create trigger training_participations_updated_at before update on public.training_participations for each row execute function public.set_updated_at();
create trigger competency_updated_at before update on public.competency_records for each row execute function public.set_updated_at();
create trigger audit_updated_at before update on public.audit_readiness_records for each row execute function public.set_updated_at();
create trigger documents_updated_at before update on public.documents for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, function, role)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''), coalesce(new.raw_user_meta_data->>'function', ''), 'viewer');
  return new;
end;
$$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create or replace function public.current_user_role()
returns public.user_role language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid()
$$;

create or replace function public.protect_profile_role()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is not null
    and new.role is distinct from old.role
    and public.current_user_role() is distinct from 'admin' then
    raise exception 'Only administrators may change roles';
  end if;
  return new;
end;
$$;
create trigger protect_profile_role before update on public.profiles
for each row execute function public.protect_profile_role();

alter table public.profiles enable row level security;
alter table public.app_settings enable row level security;
alter table public.employees enable row level security;
alter table public.tna_records enable row level security;
alter table public.budget_records enable row level security;
alter table public.training_records enable row level security;
alter table public.training_participations enable row level security;
alter table public.competency_records enable row level security;
alter table public.audit_readiness_records enable row level security;
alter table public.documents enable row level security;

create policy "profiles read own or admin" on public.profiles for select to authenticated
using (id = auth.uid() or public.current_user_role() = 'admin');
create policy "profiles update own or admin" on public.profiles for update to authenticated
using (id = auth.uid() or public.current_user_role() = 'admin')
with check (id = auth.uid() or public.current_user_role() = 'admin');

create policy "settings read authenticated" on public.app_settings for select to authenticated using (true);
create policy "settings insert admin" on public.app_settings for insert to authenticated with check (public.current_user_role() = 'admin');
create policy "settings update admin" on public.app_settings for update to authenticated using (public.current_user_role() = 'admin') with check (public.current_user_role() = 'admin');

do $$
declare table_name text;
begin
  foreach table_name in array array['employees','tna_records','budget_records','training_records','training_participations','competency_records','audit_readiness_records','documents']
  loop
    execute format('create policy "authenticated read" on public.%I for select to authenticated using (true)', table_name);
    execute format('create policy "authenticated insert" on public.%I for insert to authenticated with check (created_by = auth.uid())', table_name);
    execute format('create policy "authenticated update" on public.%I for update to authenticated using (true) with check (true)', table_name);
    execute format('create policy "admin delete" on public.%I for delete to authenticated using (public.current_user_role() = ''admin'')', table_name);
  end loop;
end $$;

create or replace function public.viewer_dashboard_summary(p_year integer default null)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  selected_year integer;
  result jsonb;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  select coalesce(
    p_year,
    (select default_dashboard_year from public.app_settings limit 1),
    extract(year from current_date)::integer
  )
  into selected_year;

  select jsonb_build_object(
    'year', selected_year,
    'availableYears', coalesce((
      select jsonb_agg(year_value order by year_value desc)
      from (
        select distinct extract(year from start_date)::integer as year_value
        from public.training_records
        where start_date is not null
      ) years
    ), '[]'::jsonb),
    'metrics', jsonb_build_object(
      'totalEmployees', (select count(*) from public.employees where employment_status = 'active'),
      'trainingRealization', coalesce((
        select round(100.0 * count(*) filter (where status = 'completed') / nullif(count(*), 0), 2)
        from public.training_records
      ), 0),
      'auditReadiness', coalesce((
        select round(avg(score)::numeric, 2)
        from public.audit_readiness_records
        where score is not null
      ), 0),
      'competencyCoverage', coalesce((
        select round(100.0 * count(*) filter (where current_level >= target_level) / nullif(count(*), 0), 2)
        from public.competency_records
      ), 0),
      'budgetUtilisation', coalesce((
        select round(100.0 * sum(used_amount) / nullif(sum(allocated_amount), 0), 2)
        from public.budget_records
      ), 0),
      'allocated', coalesce((select sum(allocated_amount) from public.budget_records), 0),
      'used', coalesce((select sum(used_amount) from public.budget_records), 0)
    ),
    'trainingTrend', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'monthNumber', month_number,
          'month', trim(to_char(make_date(selected_year, month_number, 1), 'Mon')),
          'completed', completed
        )
        order by month_number
      )
      from (
        select extract(month from start_date)::integer as month_number, count(*) as completed
        from public.training_records
        where status = 'completed' and extract(year from start_date)::integer = selected_year
        group by extract(month from start_date)::integer
      ) monthly_training
    ), '[]'::jsonb),
    'auditByFunction', coalesce((
      select jsonb_agg(
        jsonb_build_object('name', function_name, 'score', score)
        order by score desc, function_name
      )
      from (
        select function as function_name, round(avg(score)::numeric, 2) as score
        from public.audit_readiness_records
        where score is not null and nullif(trim(function), '') is not null
        group by function
      ) audit_summary
    ), '[]'::jsonb),
    'tnaByCategory', coalesce((
      select jsonb_agg(
        jsonb_build_object('name', category_name, 'value', record_count)
        order by record_count desc, category_name
      )
      from (
        select competency_category as category_name, count(*) as record_count
        from public.tna_records
        where nullif(trim(competency_category), '') is not null
        group by competency_category
      ) tna_summary
    ), '[]'::jsonb)
  )
  into result;

  return result;
end;
$$;

revoke all on function public.viewer_dashboard_summary(integer) from public;
revoke all on function public.viewer_dashboard_summary(integer) from anon;
grant execute on function public.viewer_dashboard_summary(integer) to authenticated;

insert into public.app_settings default values;
