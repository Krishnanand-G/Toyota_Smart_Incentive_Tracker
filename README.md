# Toyota Smart Incentive Tracker

Production-style Toyota incentive tracking app with role-based auth, admin tools, slab engine, officer sales workflow, and history views.

## Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS + custom light Liquid Glass design system
- Supabase Auth (`@supabase/ssr`)
- Prisma ORM + PostgreSQL

## Features

- Secure role routing for `ADMIN` and `OFFICER`
- Admin car catalog CRUD with soft-delete and image preview
- Admin slab editor with validation and live payout preview
- Officer monthly sales dashboard with draft/save/submit flow
- Officer/admin history APIs and history views
- Officers management list + create-officer flow

## Environment Setup

1. Copy `.env.example` to `.env`
2. Set:
   - `DATABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Local Development

```bash
npm install
npm run prisma:migrate
npm run prisma:generate
npm run prisma:seed
npm run dev
```

App starts at [http://localhost:3000](http://localhost:3000).

## Demo Accounts (Seed Data)

- Admin: `admin@toyota.local`
- Officer: `officer@toyota.local`
- Passwords must exist in your Supabase project auth users to match these emails/auth IDs.

## Deployment Checklist (Vercel)

- Add all `.env` keys in Vercel Project Settings
- Run migrations against production database before first deploy
- Ensure Supabase URL/Anon key belong to the same environment
- Redeploy after seed or schema changes

## Useful Commands

```bash
npm run lint
npm run build
npm run prisma:migrate
npm run prisma:seed
```
