-- Aggregate-only access for regular dashboard viewers.
-- Run this once in the Supabase SQL Editor after the base schema has been applied.

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'employees',
    'tna_records',
    'budget_records',
    'training_records',
    'competency_records',
    'audit_readiness_records',
    'documents'
  ]
  loop
    execute format(
      'drop policy if exists "authenticated read" on public.%I',
      table_name
    );
    execute format(
      'drop policy if exists "staff read" on public.%I',
      table_name
    );
    execute format(
      'create policy "staff read" on public.%I for select to authenticated using (public.current_user_role() in (''admin'', ''editor''))',
      table_name
    );
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
      'totalEmployees', (
        select count(*)
        from public.employees
        where employment_status = 'active'
      ),
      'trainingRealization', coalesce((
        select round(
          100.0 * count(*) filter (where status = 'completed')
          / nullif(count(*), 0),
          2
        )
        from public.training_records
      ), 0),
      'auditReadiness', coalesce((
        select round(avg(score)::numeric, 2)
        from public.audit_readiness_records
        where score is not null
      ), 0),
      'competencyCoverage', coalesce((
        select round(
          100.0 * count(*) filter (where current_level >= target_level)
          / nullif(count(*), 0),
          2
        )
        from public.competency_records
      ), 0),
      'budgetUtilisation', coalesce((
        select round(
          100.0 * sum(used_amount)
          / nullif(sum(allocated_amount), 0),
          2
        )
        from public.budget_records
      ), 0),
      'allocated', coalesce((
        select sum(allocated_amount)
        from public.budget_records
      ), 0),
      'used', coalesce((
        select sum(used_amount)
        from public.budget_records
      ), 0)
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
        select
          extract(month from start_date)::integer as month_number,
          count(*) as completed
        from public.training_records
        where status = 'completed'
          and extract(year from start_date)::integer = selected_year
        group by extract(month from start_date)::integer
      ) monthly_training
    ), '[]'::jsonb),
    'auditByFunction', coalesce((
      select jsonb_agg(
        jsonb_build_object('name', function_name, 'score', score)
        order by score desc, function_name
      )
      from (
        select
          function as function_name,
          round(avg(score)::numeric, 2) as score
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
        select
          competency_category as category_name,
          count(*) as record_count
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
