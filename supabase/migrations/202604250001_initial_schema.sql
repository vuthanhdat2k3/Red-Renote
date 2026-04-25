create extension if not exists pgcrypto;

create table if not exists public.meetings (
  id text primary key,
  title text not null,
  date text not null,
  duration text not null,
  participants integer not null default 0,
  project text not null,
  audio_url text not null default '',
  summary text not null,
  key_takeaways text[] not null default '{}',
  decisions text[] not null default '{}',
  risks text[] not null default '{}',
  follow_ups text[] not null default '{}',
  status text not null default 'completed' check (status in ('recording', 'processing', 'completed')),
  tags text[] not null default '{}',
  mindmap jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tasks (
  id text primary key,
  meeting_id text not null references public.meetings(id) on delete cascade,
  title text not null,
  owner text not null,
  deadline text not null,
  status text not null default 'pending' check (status in ('pending', 'in_progress', 'done')),
  source_timestamp text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.transcript_items (
  id text primary key,
  meeting_id text not null references public.meetings(id) on delete cascade,
  position integer not null,
  speaker text not null,
  speaker_color text not null,
  timestamp text not null,
  text text not null,
  is_highlighted boolean not null default false
);

create table if not exists public.ai_messages (
  id text primary key,
  meeting_id text not null references public.meetings(id) on delete cascade,
  position integer not null,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  timestamp_references text[] not null default '{}',
  created_at timestamptz not null default now()
);

alter table public.meetings enable row level security;
alter table public.tasks enable row level security;
alter table public.transcript_items enable row level security;
alter table public.ai_messages enable row level security;

create policy "Allow public read meetings" on public.meetings for select using (true);
create policy "Allow public read tasks" on public.tasks for select using (true);
create policy "Allow public read transcript" on public.transcript_items for select using (true);
create policy "Allow public read ai messages" on public.ai_messages for select using (true);

insert into public.meetings (
  id,
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
) values
(
  'meeting-product-planning-q2',
  'Q2 Product Planning and Design Review',
  'Apr 25, 2026',
  '38 min',
  4,
  'Red Renote Beta',
  'https://cdn.redrenote.local/audio/q2-product-planning-design-review.mp3',
  'The team finalized the Q2 beta focus around reliable follow-ups, clearer AI summary hierarchy, and searchable meeting memory. Engineering will scope owner detection conservatively while design improves decision and suggestion states.',
  array['Q2 beta should prioritize reliability over broad automation.', 'Auto-owner detection starts with explicit names and calendar attendees.', 'The dashboard needs one obvious next meeting action.', 'AI-generated tasks should default to daily digest notifications.'],
  array['Ship grouped daily digests for generated tasks.', 'Use stronger contrast only for confirmed decisions.', 'Limit beta owner detection to explicit names and attendees.', 'Create three sprint workstreams: extraction, dashboard, and transcript search.'],
  array['Users may disable notifications if AI-generated tasks are too noisy.', 'Low-confidence owner detection could reduce trust in follow-ups.', 'Dashboard density could make the next action harder to find.'],
  array['Jordan to draft the auto-owner detection beta scope.', 'Linh to revise the dashboard hierarchy and decision state styling.', 'Alex to prepare a daily digest notification proposal.', 'Mina to write the product leadership beta brief.'],
  'completed',
  array['Product planning', 'Design review', 'Sprint planning'],
  '{"id":"node-root","label":"Q2 Product Planning","type":"root","children":[{"id":"node-followups","label":"Trustworthy follow-ups","type":"topic","children":[{"id":"node-owner-detection","label":"Auto-owner detection","type":"task","children":[]},{"id":"node-daily-digest","label":"Daily task digest","type":"decision","children":[]}]},{"id":"node-design","label":"Design review","type":"topic","children":[{"id":"node-dashboard","label":"Dashboard hierarchy","type":"task","children":[]},{"id":"node-ai-chip","label":"AI vs confirmed states","type":"decision","children":[]}]},{"id":"node-risks","label":"Release risks","type":"risk","children":[{"id":"node-fatigue","label":"Notification fatigue","type":"risk","children":[]},{"id":"node-confidence","label":"Low-confidence task extraction","type":"risk","children":[]}]}]}'::jsonb,
  '2026-04-25 09:00:00+00'
),
(
  'meeting-design-system-review',
  'Design System Review',
  'Apr 24, 2026',
  '31 min',
  5,
  'Red Renote Mobile',
  '',
  'Reviewed red brand states, card density, and reusable mobile components for the Expo shell.',
  array['Keep red for primary action moments.', 'Cards should stay quiet and business-focused.'],
  array['Use rounded 2xl cards across meeting surfaces.', 'Avoid dense nested cards in dashboard views.'],
  array['Overusing red could make AI and danger states compete.'],
  array['Document component usage rules for app teams.'],
  'completed',
  array['Design system', 'Mobile UI'],
  '{"id":"node-root","label":"Design System Review","type":"root","children":[]}'::jsonb,
  '2026-04-24 09:00:00+00'
),
(
  'meeting-sprint-planning-18',
  'Sprint Planning 18',
  'Apr 23, 2026',
  '46 min',
  7,
  'AI Meeting Assistant',
  '',
  'Planned sprint work around transcript search, task confidence scoring, and meeting detail navigation.',
  array['Search ranking needs timestamp relevance.', 'Task confidence should be visible before assignment.'],
  array['Start with mock confidence states before backend scoring lands.'],
  array['Navigation can feel fragmented if meeting tabs do not preserve context.'],
  array['Create tickets for transcript search empty states.'],
  'completed',
  array['Sprint', 'Engineering'],
  '{"id":"node-root","label":"Sprint Planning 18","type":"root","children":[]}'::jsonb,
  '2026-04-23 09:00:00+00'
),
(
  'meeting-enterprise-feedback',
  'Enterprise Feedback Review',
  'Apr 22, 2026',
  '52 min',
  6,
  'Customer Beta',
  '',
  'Enterprise users asked for better auditability, source timestamps, and clearer ownership in AI-generated follow-ups.',
  array['Source timestamps are required for trust.', 'Admins need export controls.'],
  array['Show source timestamps on every task card.'],
  array['Missing audit context can block enterprise rollout.'],
  array['Collect export requirements from beta admins.'],
  'completed',
  array['Customer feedback', 'Enterprise'],
  '{"id":"node-root","label":"Enterprise Feedback Review","type":"root","children":[]}'::jsonb,
  '2026-04-22 09:00:00+00'
),
(
  'meeting-go-to-market-sync',
  'Go-to-Market Sync',
  'Apr 21, 2026',
  '29 min',
  5,
  'Launch Readiness',
  '',
  'Aligned launch messaging around meeting memory, manager follow-up workflows, and reduced manual note cleanup.',
  array['Position Red Renote around meeting memory.', 'Use manager workflows in launch examples.'],
  array['Lead with productivity outcomes instead of transcription accuracy.'],
  array['Messaging may sound generic without concrete workflow examples.'],
  array['Draft launch examples for design review and sprint planning.'],
  'completed',
  array['GTM', 'Launch'],
  '{"id":"node-root","label":"Go-to-Market Sync","type":"root","children":[]}'::jsonb,
  '2026-04-21 09:00:00+00'
)
on conflict (id) do nothing;

insert into public.tasks (id, meeting_id, title, owner, deadline, status, source_timestamp) values
('task-001', 'meeting-product-planning-q2', 'Draft auto-owner detection scope for beta', 'Jordan Lee', 'Apr 29, 2026', 'in_progress', '06:28'),
('task-002', 'meeting-product-planning-q2', 'Revise dashboard hierarchy for next meeting action', 'Linh Tran', 'Apr 30, 2026', 'pending', '04:03'),
('task-003', 'meeting-product-planning-q2', 'Update AI suggestion and confirmed decision visual rules', 'Linh Tran', 'May 1, 2026', 'pending', '15:09'),
('task-004', 'meeting-product-planning-q2', 'Prepare daily digest notification proposal', 'Alex Romero', 'May 2, 2026', 'done', '22:06'),
('task-005', 'meeting-product-planning-q2', 'Create sprint tickets for task extraction workstream', 'Jordan Lee', 'May 3, 2026', 'in_progress', '31:18'),
('task-006', 'meeting-product-planning-q2', 'Write beta release brief for product leadership', 'Mina Patel', 'May 5, 2026', 'pending', '36:52')
on conflict (id) do nothing;

insert into public.transcript_items (id, meeting_id, position, speaker, speaker_color, timestamp, text, is_highlighted) values
('tr-001', 'meeting-product-planning-q2', 1, 'Mina Patel', '#E50914', '00:42', 'The main goal today is to lock the Q2 product planning priorities before sprint planning starts tomorrow.', true),
('tr-002', 'meeting-product-planning-q2', 2, 'Alex Romero', '#005AAB', '02:15', 'Usage data shows teams are opening summaries, but task conversion drops when owners are not assigned automatically.', false),
('tr-003', 'meeting-product-planning-q2', 3, 'Linh Tran', '#8B0000', '04:03', 'From a design perspective, the dashboard needs to make the next meeting action obvious without adding another card stack.', true),
('tr-004', 'meeting-product-planning-q2', 4, 'Jordan Lee', '#147A4D', '06:28', 'Engineering can support auto-owner detection if we keep the first version limited to explicit names and calendar attendees.', false),
('tr-005', 'meeting-product-planning-q2', 5, 'Mina Patel', '#E50914', '09:11', 'That constraint is acceptable for beta. We need reliability more than broad language coverage in this release.', true),
('tr-006', 'meeting-product-planning-q2', 6, 'Alex Romero', '#005AAB', '12:34', 'Customer interviews also asked for a clearer difference between AI suggestions and confirmed decisions.', false),
('tr-007', 'meeting-product-planning-q2', 7, 'Linh Tran', '#8B0000', '15:09', 'I will update the design review checklist so AI chips use softer red while confirmed decisions use stronger contrast.', false),
('tr-008', 'meeting-product-planning-q2', 8, 'Jordan Lee', '#147A4D', '18:47', 'The risk is notification fatigue. If every extracted task sends a push, managers will disable alerts quickly.', true),
('tr-009', 'meeting-product-planning-q2', 9, 'Mina Patel', '#E50914', '22:06', 'Let''s ship grouped daily digests for generated tasks and reserve immediate notifications for manually confirmed owners.', true),
('tr-010', 'meeting-product-planning-q2', 10, 'Alex Romero', '#005AAB', '27:41', 'For sprint planning, I suggest three workstreams: task extraction, dashboard hierarchy, and transcript search quality.', false),
('tr-011', 'meeting-product-planning-q2', 11, 'Jordan Lee', '#147A4D', '31:18', 'Task extraction can be split into parser rules, confidence scoring, and the review queue UI contract.', false),
('tr-012', 'meeting-product-planning-q2', 12, 'Mina Patel', '#E50914', '36:52', 'Decision is final: Q2 beta focuses on trustworthy follow-ups, summary clarity, and searchable meeting memory.', true)
on conflict (id) do nothing;

insert into public.ai_messages (id, meeting_id, position, role, content, timestamp_references) values
('msg-001', 'meeting-product-planning-q2', 1, 'user', 'What were the final Q2 beta priorities?', array['36:52']),
('msg-002', 'meeting-product-planning-q2', 2, 'assistant', 'The final priorities were trustworthy follow-ups, summary clarity, and searchable meeting memory.', array['36:52', '27:41']),
('msg-003', 'meeting-product-planning-q2', 3, 'user', 'Which risks should product leadership see first?', array['18:47']),
('msg-004', 'meeting-product-planning-q2', 4, 'assistant', 'Notification fatigue is the clearest leadership-level risk. The team agreed to group AI-generated tasks into daily digests.', array['18:47', '22:06']),
('msg-005', 'meeting-product-planning-q2', 5, 'user', 'Who owns the design follow-up?', array['04:03', '15:09']),
('msg-006', 'meeting-product-planning-q2', 6, 'assistant', 'Linh owns dashboard hierarchy and the visual distinction between AI suggestions and confirmed decisions.', array['04:03', '15:09'])
on conflict (id) do nothing;
