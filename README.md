# Toyota Smart Incentive Tracker

Stage 1 foundation for a Toyota incentive tracking application with role-based authentication.

## Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- Supabase Auth (`@supabase/ssr`)
- Prisma ORM + PostgreSQL

## Environment Setup

1. Copy `.env.example` to `.env`.
2. Fill in:
   - `DATABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Local Development

```bash
npm install
npm run prisma:generate
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The root route redirects to `/login`.

## Prisma Notes

- Schema is defined in `prisma/schema.prisma`.
- Seed script is `prisma/seed.ts`.
- Useful commands:

```bash
npm run prisma:migrate
npm run prisma:seed
```

## Stage 1 Coverage

- Glass-style `/login` page with Supabase email/password sign-in
- `/api/me` route for authenticated role/profile lookup
- Protected `/admin` and `/officer` routes
- Middleware redirects:
  - signed-out users to `/login`
  - signed-in users away from `/login` to role dashboard
  - cross-role access attempts to the correct role area
