create table public.profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.user_preferences (
  user_id uuid primary key references auth.users (id) on delete cascade,
  interface_locale text not null default 'fr' check (interface_locale in ('fr', 'en', 'es')),
  last_quiz_config jsonb not null default '{}'::jsonb check (jsonb_typeof(last_quiz_config) = 'object'),
  speech_auto_play boolean not null default false,
  speech_rate numeric(3, 2) not null default 1.00 check (speech_rate between 0.50 and 2.00),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.review_events (
  id uuid primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  word_id text not null check (length(btrim(word_id)) > 0),
  direction text not null check (direction in ('japanese_to_meaning', 'meaning_to_japanese')),
  prompt_snapshot jsonb not null check (jsonb_typeof(prompt_snapshot) = 'object'),
  submitted_answer text not null,
  normalized_answer text not null,
  result text not null check (result in ('correct', 'incorrect', 'skipped')),
  response_time_ms integer check (response_time_ms is null or response_time_ms >= 0),
  reviewed_at timestamptz not null default now()
);

create table public.word_progress (
  user_id uuid not null references auth.users (id) on delete cascade,
  word_id text not null check (length(btrim(word_id)) > 0),
  direction text not null check (direction in ('japanese_to_meaning', 'meaning_to_japanese')),
  mastery_score smallint not null default 0 check (mastery_score between 0 and 3),
  status text generated always as (
    case
      when mastery_score = 0 then 'red'
      when mastery_score = 3 then 'green'
      else 'yellow'
    end
  ) stored,
  correct_total integer not null default 0 check (correct_total >= 0),
  incorrect_total integer not null default 0 check (incorrect_total >= 0),
  last_reviewed_at timestamptz,
  last_result text check (last_result is null or last_result in ('correct', 'incorrect', 'skipped')),
  updated_at timestamptz not null default now(),
  primary key (user_id, word_id, direction)
);

create index review_events_user_reviewed_at_idx
  on public.review_events (user_id, reviewed_at desc);
create index review_events_user_word_idx
  on public.review_events (user_id, word_id);
create index word_progress_user_status_idx
  on public.word_progress (user_id, status);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger user_preferences_set_updated_at
before update on public.user_preferences
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (user_id, display_name, avatar_url)
  values (
    new.id,
    coalesce(
      nullif(new.raw_user_meta_data ->> 'full_name', ''),
      nullif(new.raw_user_meta_data ->> 'name', '')
    ),
    nullif(new.raw_user_meta_data ->> 'avatar_url', '')
  )
  on conflict (user_id) do nothing;

  insert into public.user_preferences (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.user_preferences enable row level security;
alter table public.review_events enable row level security;
alter table public.word_progress enable row level security;

revoke all on table public.profiles from anon, authenticated;
revoke all on table public.user_preferences from anon, authenticated;
revoke all on table public.review_events from anon, authenticated;
revoke all on table public.word_progress from anon, authenticated;

grant select, insert, update on table public.profiles to authenticated;
grant select, insert, update, delete on table public.user_preferences to authenticated;
grant select on table public.review_events to authenticated;
grant select on table public.word_progress to authenticated;

create policy "profiles_select_own"
on public.profiles for select
to authenticated
using ((select auth.uid()) is not null and (select auth.uid()) = user_id);

create policy "profiles_insert_own"
on public.profiles for insert
to authenticated
with check ((select auth.uid()) is not null and (select auth.uid()) = user_id);

create policy "profiles_update_own"
on public.profiles for update
to authenticated
using ((select auth.uid()) is not null and (select auth.uid()) = user_id)
with check ((select auth.uid()) is not null and (select auth.uid()) = user_id);

create policy "preferences_select_own"
on public.user_preferences for select
to authenticated
using ((select auth.uid()) is not null and (select auth.uid()) = user_id);

create policy "preferences_insert_own"
on public.user_preferences for insert
to authenticated
with check ((select auth.uid()) is not null and (select auth.uid()) = user_id);

create policy "preferences_update_own"
on public.user_preferences for update
to authenticated
using ((select auth.uid()) is not null and (select auth.uid()) = user_id)
with check ((select auth.uid()) is not null and (select auth.uid()) = user_id);

create policy "preferences_delete_own"
on public.user_preferences for delete
to authenticated
using ((select auth.uid()) is not null and (select auth.uid()) = user_id);

create policy "review_events_select_own"
on public.review_events for select
to authenticated
using ((select auth.uid()) is not null and (select auth.uid()) = user_id);

create policy "word_progress_select_own"
on public.word_progress for select
to authenticated
using ((select auth.uid()) is not null and (select auth.uid()) = user_id);

create or replace function public.record_review(
  p_review_id uuid,
  p_word_id text,
  p_direction text,
  p_prompt_snapshot jsonb,
  p_submitted_answer text,
  p_normalized_answer text,
  p_result text,
  p_response_time_ms integer default null
)
returns table (
  word_id text,
  direction text,
  mastery_score smallint,
  status text,
  correct_total integer,
  incorrect_total integer,
  last_reviewed_at timestamptz,
  last_result text
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_reviewed_at timestamptz := statement_timestamp();
  v_inserted_review_id uuid;
begin
  if v_user_id is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;

  if p_review_id is null or length(btrim(p_word_id)) = 0 then
    raise exception 'invalid review identity' using errcode = '22023';
  end if;

  if p_direction not in ('japanese_to_meaning', 'meaning_to_japanese') then
    raise exception 'invalid review direction' using errcode = '22023';
  end if;

  if p_result not in ('correct', 'incorrect', 'skipped') then
    raise exception 'invalid review result' using errcode = '22023';
  end if;

  if p_prompt_snapshot is null or jsonb_typeof(p_prompt_snapshot) <> 'object' then
    raise exception 'invalid prompt snapshot' using errcode = '22023';
  end if;

  if p_response_time_ms is not null and p_response_time_ms < 0 then
    raise exception 'invalid response time' using errcode = '22023';
  end if;

  insert into public.review_events (
    id,
    user_id,
    word_id,
    direction,
    prompt_snapshot,
    submitted_answer,
    normalized_answer,
    result,
    response_time_ms,
    reviewed_at
  )
  values (
    p_review_id,
    v_user_id,
    p_word_id,
    p_direction,
    p_prompt_snapshot,
    p_submitted_answer,
    p_normalized_answer,
    p_result,
    p_response_time_ms,
    v_reviewed_at
  )
  on conflict (id) do nothing
  returning id into v_inserted_review_id;

  if v_inserted_review_id is null then
    if not exists (
      select 1
      from public.review_events existing
      where existing.id = p_review_id
        and existing.user_id = v_user_id
        and existing.word_id = p_word_id
        and existing.direction = p_direction
        and existing.prompt_snapshot = p_prompt_snapshot
        and existing.submitted_answer = p_submitted_answer
        and existing.normalized_answer = p_normalized_answer
        and existing.result = p_result
        and existing.response_time_ms is not distinct from p_response_time_ms
    ) then
      raise exception 'review id already used with different content' using errcode = '23505';
    end if;

    return query
    select
      current_progress.word_id,
      current_progress.direction,
      current_progress.mastery_score,
      current_progress.status,
      current_progress.correct_total,
      current_progress.incorrect_total,
      current_progress.last_reviewed_at,
      current_progress.last_result
    from public.word_progress current_progress
    where current_progress.user_id = v_user_id
      and current_progress.word_id = p_word_id
      and current_progress.direction = p_direction;
    return;
  end if;

  return query
  insert into public.word_progress (
    user_id,
    word_id,
    direction,
    mastery_score,
    correct_total,
    incorrect_total,
    last_reviewed_at,
    last_result
  )
  values (
    v_user_id,
    p_word_id,
    p_direction,
    case when p_result = 'correct' then 1 else 0 end,
    case when p_result = 'correct' then 1 else 0 end,
    case when p_result = 'correct' then 0 else 1 end,
    v_reviewed_at,
    p_result
  )
  on conflict (user_id, word_id, direction) do update
  set
    mastery_score = case
      when p_result = 'correct' then least(public.word_progress.mastery_score + 1, 3)
      when public.word_progress.mastery_score = 3 then 2
      else public.word_progress.mastery_score
    end,
    correct_total = public.word_progress.correct_total + case when p_result = 'correct' then 1 else 0 end,
    incorrect_total = public.word_progress.incorrect_total + case when p_result = 'correct' then 0 else 1 end,
    last_reviewed_at = v_reviewed_at,
    last_result = p_result,
    updated_at = v_reviewed_at
  returning
    public.word_progress.word_id,
    public.word_progress.direction,
    public.word_progress.mastery_score,
    public.word_progress.status,
    public.word_progress.correct_total,
    public.word_progress.incorrect_total,
    public.word_progress.last_reviewed_at,
    public.word_progress.last_result;
end;
$$;

revoke execute on function public.record_review(uuid, text, text, jsonb, text, text, text, integer)
from public, anon;
grant execute on function public.record_review(uuid, text, text, jsonb, text, text, text, integer)
to authenticated;
