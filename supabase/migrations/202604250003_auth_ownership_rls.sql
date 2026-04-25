alter table public.meetings
  add column if not exists owner_user_id uuid references auth.users(id) on delete cascade;

create index if not exists meetings_owner_user_id_idx on public.meetings(owner_user_id);
create index if not exists tasks_meeting_id_idx on public.tasks(meeting_id);
create index if not exists transcript_items_meeting_id_idx on public.transcript_items(meeting_id);
create index if not exists ai_messages_meeting_id_idx on public.ai_messages(meeting_id);

do $$
declare
  fallback_user uuid;
begin
  select id into fallback_user from auth.users order by created_at asc limit 1;

  if fallback_user is not null then
    update public.meetings
    set owner_user_id = fallback_user
    where owner_user_id is null;
  else
    delete from public.ai_messages
    where meeting_id in (select id from public.meetings where owner_user_id is null);

    delete from public.transcript_items
    where meeting_id in (select id from public.meetings where owner_user_id is null);

    delete from public.tasks
    where meeting_id in (select id from public.meetings where owner_user_id is null);

    delete from public.meetings where owner_user_id is null;
  end if;
end
$$;

alter table public.meetings
  alter column owner_user_id set not null;

alter table public.meetings enable row level security;
alter table public.tasks enable row level security;
alter table public.transcript_items enable row level security;
alter table public.ai_messages enable row level security;

drop policy if exists "Allow public read meetings" on public.meetings;
drop policy if exists "Allow public read tasks" on public.tasks;
drop policy if exists "Allow public read transcript" on public.transcript_items;
drop policy if exists "Allow public read ai messages" on public.ai_messages;

drop policy if exists "meetings_select_own" on public.meetings;
drop policy if exists "meetings_insert_own" on public.meetings;
drop policy if exists "meetings_update_own" on public.meetings;
drop policy if exists "meetings_delete_own" on public.meetings;

create policy "meetings_select_own"
  on public.meetings
  for select
  using (owner_user_id = auth.uid());

create policy "meetings_insert_own"
  on public.meetings
  for insert
  with check (owner_user_id = auth.uid());

create policy "meetings_update_own"
  on public.meetings
  for update
  using (owner_user_id = auth.uid())
  with check (owner_user_id = auth.uid());

create policy "meetings_delete_own"
  on public.meetings
  for delete
  using (owner_user_id = auth.uid());

drop policy if exists "tasks_select_own" on public.tasks;
drop policy if exists "tasks_insert_own" on public.tasks;
drop policy if exists "tasks_update_own" on public.tasks;
drop policy if exists "tasks_delete_own" on public.tasks;

create policy "tasks_select_own"
  on public.tasks
  for select
  using (
    exists (
      select 1
      from public.meetings m
      where m.id = tasks.meeting_id
        and m.owner_user_id = auth.uid()
    )
  );

create policy "tasks_insert_own"
  on public.tasks
  for insert
  with check (
    exists (
      select 1
      from public.meetings m
      where m.id = tasks.meeting_id
        and m.owner_user_id = auth.uid()
    )
  );

create policy "tasks_update_own"
  on public.tasks
  for update
  using (
    exists (
      select 1
      from public.meetings m
      where m.id = tasks.meeting_id
        and m.owner_user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.meetings m
      where m.id = tasks.meeting_id
        and m.owner_user_id = auth.uid()
    )
  );

create policy "tasks_delete_own"
  on public.tasks
  for delete
  using (
    exists (
      select 1
      from public.meetings m
      where m.id = tasks.meeting_id
        and m.owner_user_id = auth.uid()
    )
  );

drop policy if exists "transcript_select_own" on public.transcript_items;
drop policy if exists "transcript_insert_own" on public.transcript_items;
drop policy if exists "transcript_update_own" on public.transcript_items;
drop policy if exists "transcript_delete_own" on public.transcript_items;

create policy "transcript_select_own"
  on public.transcript_items
  for select
  using (
    exists (
      select 1
      from public.meetings m
      where m.id = transcript_items.meeting_id
        and m.owner_user_id = auth.uid()
    )
  );

create policy "transcript_insert_own"
  on public.transcript_items
  for insert
  with check (
    exists (
      select 1
      from public.meetings m
      where m.id = transcript_items.meeting_id
        and m.owner_user_id = auth.uid()
    )
  );

create policy "transcript_update_own"
  on public.transcript_items
  for update
  using (
    exists (
      select 1
      from public.meetings m
      where m.id = transcript_items.meeting_id
        and m.owner_user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.meetings m
      where m.id = transcript_items.meeting_id
        and m.owner_user_id = auth.uid()
    )
  );

create policy "transcript_delete_own"
  on public.transcript_items
  for delete
  using (
    exists (
      select 1
      from public.meetings m
      where m.id = transcript_items.meeting_id
        and m.owner_user_id = auth.uid()
    )
  );

drop policy if exists "ai_messages_select_own" on public.ai_messages;
drop policy if exists "ai_messages_insert_own" on public.ai_messages;
drop policy if exists "ai_messages_update_own" on public.ai_messages;
drop policy if exists "ai_messages_delete_own" on public.ai_messages;

create policy "ai_messages_select_own"
  on public.ai_messages
  for select
  using (
    exists (
      select 1
      from public.meetings m
      where m.id = ai_messages.meeting_id
        and m.owner_user_id = auth.uid()
    )
  );

create policy "ai_messages_insert_own"
  on public.ai_messages
  for insert
  with check (
    exists (
      select 1
      from public.meetings m
      where m.id = ai_messages.meeting_id
        and m.owner_user_id = auth.uid()
    )
  );

create policy "ai_messages_update_own"
  on public.ai_messages
  for update
  using (
    exists (
      select 1
      from public.meetings m
      where m.id = ai_messages.meeting_id
        and m.owner_user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.meetings m
      where m.id = ai_messages.meeting_id
        and m.owner_user_id = auth.uid()
    )
  );

create policy "ai_messages_delete_own"
  on public.ai_messages
  for delete
  using (
    exists (
      select 1
      from public.meetings m
      where m.id = ai_messages.meeting_id
        and m.owner_user_id = auth.uid()
    )
  );
