-- Allow every authenticated user to create and edit operational records.
-- Deletion, imports, settings, and role management remain administrator-only.
-- Run once in Supabase SQL Editor on an existing database.

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'employees',
    'tna_records',
    'budget_records',
    'training_records',
    'training_participations',
    'competency_records',
    'audit_readiness_records',
    'documents'
  ]
  loop
    execute format('drop policy if exists "admin editor insert" on public.%I', table_name);
    execute format('drop policy if exists "admin editor update" on public.%I', table_name);
    execute format('drop policy if exists "authenticated insert" on public.%I', table_name);
    execute format('drop policy if exists "authenticated update" on public.%I', table_name);

    execute format(
      'create policy "authenticated insert" on public.%I for insert to authenticated with check (created_by = auth.uid())',
      table_name
    );
    execute format(
      'create policy "authenticated update" on public.%I for update to authenticated using (true) with check (true)',
      table_name
    );
  end loop;
end $$;
