-- Run this in Supabase SQL Editor for the test environment.

create table if not exists public.otp_sessions (
  session_key text primary key,
  channel text not null check (channel in ('principal', 'coordinator')),
  mobile text not null,
  otp_hash text not null,
  expires_at timestamptz not null,
  attempts integer not null default 0,
  last_sent_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists otp_sessions_mobile_idx on public.otp_sessions (mobile);
create index if not exists otp_sessions_expires_at_idx on public.otp_sessions (expires_at);

create table if not exists public.registrations (
  id uuid primary key default gen_random_uuid(),
  registration_id text not null unique,
  created_at timestamptz not null,
  school_name text not null,
  school_address text not null,
  school_email text not null,
  school_phone text not null,
  city text not null,
  state text not null,
  board text not null,
  strength text not null,
  lab_available text not null check (lab_available in ('yes', 'no')),
  computer_count text,
  principal_name text not null,
  principal_email text not null,
  principal_mobile text not null,
  coordinator_name text not null,
  coordinator_designation text not null,
  coordinator_email text not null,
  coordinator_mobile text not null,
  expected_participants text not null,
  exam_window text not null,
  declaration boolean not null,
  updated_at timestamptz not null default now()
);

create index if not exists registrations_created_at_idx on public.registrations (created_at desc);
create index if not exists registrations_school_email_idx on public.registrations (school_email);
create index if not exists registrations_principal_mobile_idx on public.registrations (principal_mobile);
create index if not exists registrations_coordinator_mobile_idx on public.registrations (coordinator_mobile);
