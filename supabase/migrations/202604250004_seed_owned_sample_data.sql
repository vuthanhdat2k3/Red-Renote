with owner_user as (
  select id
  from auth.users
  order by created_at asc
  limit 1
), meeting_seed as (
  select
    'meeting-product-planning-q2'::text as id,
    owner_user.id as owner_user_id,
    'Q2 Product Planning and Design Review'::text as title,
    'Apr 25, 2026'::text as date,
    '38 min'::text as duration,
    4::integer as participants,
    'Red Renote Beta'::text as project,
    'https://cdn.redrenote.local/audio/q2-product-planning-design-review.mp3'::text as audio_url,
    'The team finalized the Q2 beta focus around reliable follow-ups, clearer AI summary hierarchy, and searchable meeting memory.'::text as summary,
    array['Q2 beta should prioritize reliability over broad automation.', 'Auto-owner detection starts with explicit names and calendar attendees.']::text[] as key_takeaways,
    array['Ship grouped daily digests for generated tasks.', 'Limit beta owner detection to explicit names and attendees.']::text[] as decisions,
    array['Notification fatigue if every extracted task sends push alerts.']::text[] as risks,
    array['Jordan to draft the auto-owner detection beta scope.', 'Linh to revise dashboard hierarchy.']::text[] as follow_ups,
    'completed'::text as status,
    array['Product planning', 'Design review']::text[] as tags,
    '{"id":"node-root","label":"Q2 Product Planning","type":"root","children":[]}'::jsonb as mindmap,
    now() - interval '1 day' as created_at
  from owner_user
)
insert into public.meetings (
  id,
  owner_user_id,
  title,
  date,
  duration,
  participants,
  project,
  audio_url,
  summary,
  key_takeaways,
  decisions,
  risks,
  follow_ups,
  status,
  tags,
  mindmap,
  created_at
)
select
  id,
  owner_user_id,
  title,
  date,
  duration,
  participants,
  project,
  audio_url,
  summary,
  key_takeaways,
  decisions,
  risks,
  follow_ups,
  status,
  tags,
  mindmap,
  created_at
from meeting_seed
on conflict (id) do update
set
  owner_user_id = excluded.owner_user_id,
  title = excluded.title,
  summary = excluded.summary,
  updated_at = now();

insert into public.tasks (id, meeting_id, title, owner, deadline, status, source_timestamp)
select
  t.id,
  t.meeting_id,
  t.title,
  t.owner,
  t.deadline,
  t.status,
  t.source_timestamp
from (
  values
    ('task-001', 'meeting-product-planning-q2', 'Draft auto-owner detection scope for beta', 'Jordan Lee', 'Apr 29, 2026', 'in_progress', '06:28'),
    ('task-002', 'meeting-product-planning-q2', 'Revise dashboard hierarchy for next meeting action', 'Linh Tran', 'Apr 30, 2026', 'pending', '04:03')
) as t(id, meeting_id, title, owner, deadline, status, source_timestamp)
where exists (
  select 1
  from public.meetings m
  join auth.users u on u.id = m.owner_user_id
  where m.id = t.meeting_id
)
on conflict (id) do nothing;

insert into public.transcript_items (id, meeting_id, position, speaker, speaker_color, timestamp, text, is_highlighted)
select
  tr.id,
  tr.meeting_id,
  tr.position,
  tr.speaker,
  tr.speaker_color,
  tr.timestamp,
  tr.text,
  tr.is_highlighted
from (
  values
    ('tr-001', 'meeting-product-planning-q2', 1, 'Mina Patel', '#E50914', '00:42', 'The main goal is to lock Q2 priorities before sprint planning.', true),
    ('tr-002', 'meeting-product-planning-q2', 2, 'Alex Romero', '#005AAB', '02:15', 'Task conversion drops when owners are not assigned automatically.', false)
) as tr(id, meeting_id, position, speaker, speaker_color, timestamp, text, is_highlighted)
where exists (
  select 1
  from public.meetings m
  join auth.users u on u.id = m.owner_user_id
  where m.id = tr.meeting_id
)
on conflict (id) do nothing;

insert into public.ai_messages (id, meeting_id, position, role, content, timestamp_references)
select
  msg.id,
  msg.meeting_id,
  msg.position,
  msg.role,
  msg.content,
  msg.timestamp_references
from (
  values
    ('msg-001', 'meeting-product-planning-q2', 1, 'user', 'What were the final Q2 priorities?', array['36:52']::text[]),
    ('msg-002', 'meeting-product-planning-q2', 2, 'assistant', 'Priority is trustworthy follow-ups and searchable meeting memory.', array['36:52', '27:41']::text[])
) as msg(id, meeting_id, position, role, content, timestamp_references)
where exists (
  select 1
  from public.meetings m
  join auth.users u on u.id = m.owner_user_id
  where m.id = msg.meeting_id
)
on conflict (id) do nothing;
