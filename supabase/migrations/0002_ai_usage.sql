-- STUS: daily AI usage limit per user. Run in Supabase → SQL Editor.
--
-- Every AI action (summary, flashcards, test, chat message) uses one credit.
-- Credits reset at midnight Israel time. To change the limit, edit the number
-- in ai_daily_limit() below and run just that function again.

create function public.ai_daily_limit()
returns integer
language sql
immutable
as $$ select 20 $$;

create table public.ai_usage (
  user_id uuid not null references auth.users on delete cascade,
  day date not null,
  count integer not null default 0,
  primary key (user_id, day)
);

-- Users can read their own usage but never write it directly.
alter table public.ai_usage enable row level security;
create policy "read own usage" on public.ai_usage
  for select using (user_id = auth.uid());

create function public.ai_today()
returns date
language sql
stable
as $$ select (now() at time zone 'Asia/Jerusalem')::date $$;

-- Atomically uses one credit. Returns credits left after this one,
-- or -1 when today's limit is already reached (nothing is used then).
create function public.consume_ai_credit()
returns integer
language plpgsql
security definer set search_path = ''
as $$
declare
  used integer;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;

  insert into public.ai_usage (user_id, day, count)
  values (auth.uid(), public.ai_today(), 1)
  on conflict (user_id, day) do update
    set count = public.ai_usage.count + 1
    where public.ai_usage.count < public.ai_daily_limit()
  returning count into used;

  if used is null then
    return -1;
  end if;
  return public.ai_daily_limit() - used;
end;
$$;

-- Credits left today for the signed-in user.
create function public.ai_credits_left()
returns integer
language sql
stable
security definer set search_path = ''
as $$
  select public.ai_daily_limit() - coalesce(
    (select count from public.ai_usage where user_id = auth.uid() and day = public.ai_today()),
    0
  );
$$;

revoke execute on function public.consume_ai_credit() from public, anon;
revoke execute on function public.ai_credits_left() from public, anon;
grant execute on function public.consume_ai_credit() to authenticated;
grant execute on function public.ai_credits_left() to authenticated;
