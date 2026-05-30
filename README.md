# Toyota Smart Incentive Tracker

Hey! This is a web app I made for tracking Toyota car sales and calculating incentives for sales officers.

Basically admins can add cars, set up payout tiers (slabs), and manage officers. Officers log their sales and see how much incentive money they might get based on how many cars they sold that month.

**Live site:** put your vercel link here when you deploy

## What I used

- Next.js 14 with TypeScript
- Tailwind CSS for styling (dark theme)
- Supabase for login stuff
- Prisma + PostgreSQL for the database
- Framer Motion for some animations
- Recharts for graphs on the dashboard

## Main features

**Admin side (`/admin`)**
- Dashboard with sales stats
- Add/edit/delete car models (with images from CarWale)
- Configure incentive slabs (different payout rates for different unit ranges)
- Create and manage sales officer accounts

**Sales officer side (`/officer`)**
- Dashboard with metrics, progress chart, tier ladder, and recent sales
- Log sale page where you pick a car from a grid and enter the date
- History page showing past months and individual sales

Login is split so admins and officers go to different pages (`/login/admin` and `/login/officer`).

## How to run it locally

1. Clone the repo
2. Copy `.env.example` to `.env` and fill in your values:
   - `DATABASE_URL` (postgres connection string)
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (needed for creating officers with passwords)

3. Run these commands:

```bash
npm install
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

4. Open http://localhost:3000 in your browser

## Test accounts

The seed script adds users to the database but you also need to create them in Supabase Auth (Authentication > Users) with the same email and password:

**Admin:** admin@toyota.local → goes to /admin

**Officer:** officer@toyota.local → goes to /officer

Password is whatever you set in Supabase when creating the user.

## Deploying to Vercel

1. Push code to GitHub
2. Import project on Vercel
3. Add the same env variables from your `.env` file
4. Run migrations on your production database before testing:

```bash
npm run db:deploy
npm run prisma:seed
```

5. Deploy and update the live site link at the top of this readme

## Project folders (rough idea)

```
src/app/          pages and API routes
src/components/   UI components (glass design, charts, forms, etc)
src/lib/          helper functions (incentive math, auth, validations)
prisma/           database schema and seed file
```

The incentive calculation logic is in `src/lib/incentive.ts` and both admin and officer pages use it so the numbers stay consistent.

## Commands I use a lot

```bash
npm run dev              # start dev server
npm run build            # check if it builds
npm run lint             # run eslint
npm run prisma:migrate   # run db migrations
npm run prisma:seed      # reset/seed demo data
npm run db:deploy        # deploy migrations (production)
npm run cars:refresh-images   # refresh car images from CarWale
```

## Screenshots

TODO: add screenshots after deploying
- login page
- admin slab editor
- officer dashboard with chart
- log sale page

## Notes

This was a learning project so the code might not be perfect everywhere. If something breaks check the browser console and terminal first lol.

Made by Krishnanand G
