-- STUS initial schema. Run in Supabase → SQL Editor.

-- PROFILES ------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  username text unique not null,
  student_type text,
  year text,
  field text,
  goals text[] default '{}',
  locale text default 'en' check (locale in ('en', 'he')),
  onboarded boolean not null default false,
  created_at timestamptz not null default now()
);

-- Create the profile row automatically on sign-up (username from metadata).
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, username)
  values (new.id, new.raw_user_meta_data ->> 'username');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Lets the sign-up form check if a username is taken without exposing profiles.
create function public.username_available(name text)
returns boolean
language sql
security definer set search_path = ''
as $$
  select not exists (select 1 from public.profiles where username = lower(name));
$$;
grant execute on function public.username_available(text) to anon, authenticated;

-- COURSES -------------------------------------------------------------
create table public.courses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  name text not null,
  emoji text,
  color text not null default 'violet',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index courses_user_idx on public.courses (user_id, created_at desc);

-- MATERIALS -----------------------------------------------------------
create table public.materials (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses on delete cascade,
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  title text not null,
  kind text not null check (kind in ('pdf', 'txt', 'text')),
  content text not null,
  storage_path text,
  char_count integer not null default 0,
  selected boolean not null default true,
  created_at timestamptz not null default now()
);
create index materials_course_idx on public.materials (course_id, created_at desc);

-- FOLDERS -------------------------------------------------------------
create table public.folders (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses on delete cascade,
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

-- PRODUCTS (summaries, flashcards, tests, chats) -----------------------
create table public.products (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses on delete cascade,
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  folder_id uuid references public.folders on delete set null,
  type text not null check (type in ('summary', 'flashcards', 'test', 'chat')),
  title text not null,
  options jsonb not null default '{}',
  content jsonb not null default '{}',
  material_ids uuid[] not null default '{}',
  created_at timestamptz not null default now()
);
create index products_course_idx on public.products (course_id, created_at desc);

-- ROW LEVEL SECURITY: every user sees only their own rows --------------
alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.materials enable row level security;
alter table public.folders enable row level security;
alter table public.products enable row level security;

create policy "own profile" on public.profiles
  for all using (id = auth.uid()) with check (id = auth.uid());
create policy "own courses" on public.courses
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own materials" on public.materials
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own folders" on public.folders
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own products" on public.products
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- STORAGE: private bucket, files under <user_id>/... -------------------
insert into storage.buckets (id, name, public) values ('materials', 'materials', false);

create policy "own files read" on storage.objects for select
  using (bucket_id = 'materials' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "own files write" on storage.objects for insert
  with check (bucket_id = 'materials' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "own files delete" on storage.objects for delete
  using (bucket_id = 'materials' and (storage.foldername(name))[1] = auth.uid()::text);
