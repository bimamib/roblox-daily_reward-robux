# RbxDaily

Production starter for a Roblox attendance/reward tracker using Next.js App Router, HeroUI, Supabase Auth, PostgreSQL, Prisma, and Vercel.

## Features

- 7 / 14 / 30 day attendance maps.
- Robux milestones can occur on arbitrary days.
- Attendance timestamp per day.
- Missed day automatically abandons the active cycle; next check-in starts a new cycle at Day 1.
- User can manually restart a cycle without admin help.
- Previous cycles remain as history.
- Per-Robux delivery status: pending / sent.
- Map submissions by users go to pending review.
- Admin approval and map CRUD.
- Map phases using parentMapId + phaseNumber. User timezone is stored per profile; the starter defaults to Asia/Jakarta for attendance-day boundaries.
- Admin reward CRUD.
- HeroUI components with custom skeuomorphic button styling.

## Setup

1. Create a Supabase project.
2. Copy `.env.example` to `.env.local` and fill Supabase URL, publishable key, pooled `DATABASE_URL`, and direct `DIRECT_URL`.
3. Install packages: `npm install`.
4. Run Prisma migration: `npx prisma migrate dev --name init`.
5. Run `npx prisma db seed`.
6. Run the SQL in `supabase/migrations/001_profiles_trigger.sql` in Supabase SQL Editor.
7. Start: `npm run dev`.

## Make yourself admin

After registering an account, find your auth user UUID in Supabase Authentication > Users and run:

```sql
update public.profiles
set role = 'ADMIN'
where id = 'YOUR_AUTH_USER_UUID';
```

Do not expose service-role keys in the browser.

## Vercel

Add the four environment variables in Vercel for Production and Preview. The `postinstall` script runs `prisma generate`. Before the first production release, run migrations against the production database with your migration workflow.
