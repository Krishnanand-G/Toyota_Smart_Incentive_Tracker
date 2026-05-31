# Toyota Smart Incentive Tracker

**Task 2 submission, Smart Incentive Calculator with Dynamic Slab Admin Panel**  
**Nippon Toyota, SDE Internship Round 2**

A web app where **admins** configure Toyota car models and incentive payout slabs, and **sales officers** log monthly sales and see their tier + estimated payout update in real time.

| | |
|---|---|
| **Live app** | https://toyota-smart-incentive-tracker.vercel.app |
| **GitHub** | https://github.com/Krishnanand-G/Toyota_Smart_Incentive_Tracker |
| **Author** | Krishnanand G — B.Tech CSE, 2026 |

---

## How this maps to the task

### Role A — Admin Portal (configuration engine)

| Requirement | What I built |
|---|---|
| Car inventory (add / edit / delete) | `/admin/cars` — model name, base suffix, variant, image |
| Dynamic slab engine | `/admin/slabs` — tiered ranges with ₹ per unit, drag/reorder style panel |
| Update ranges anytime | Saved to PostgreSQL; officer dashboards pick up new slabs |
| Clean admin dashboard | `/admin` — stats, charts, officer leaderboard |

### Role B — Sales Officer Portal (calculation dashboard)

| Requirement | What I built |
|---|---|
| Secure login | Separate pages: `/login/admin` and `/login/officer` (RBAC) |
| Select month + log sales per model | `/officer/log-sale` — pick car, set date, log each sale |
| Real-time tracker | `/officer` — live tier, payout estimate, progress chart, tier ladder |
| Monthly history | `/officer/history` — past months with per-sale breakdown |

---

## Tech stack

- **Frontend:** Next.js 14, React, TypeScript, Tailwind CSS
- **Backend:** Next.js API routes
- **Database:** PostgreSQL (Supabase) + Prisma ORM
- **Auth:** Supabase Auth + app-level roles in the database
- **Charts:** Recharts
- **Deploy:** Vercel
- **Storage:** Supabase Storage (officer profile photos on live site)

---

## Screenshots

Ten screens from the live app (`docs/screenshots/`). Click any image on GitHub to open full size.

<table>
  <tr>
    <td width="50%" valign="top">
      <img src="./docs/screenshots/01-home-portal.png" width="100%" alt="Home portal" />
      <br /><sub><b>1.</b> Home — portal selection</sub>
    </td>
    <td width="50%" valign="top">
      <img src="./docs/screenshots/02-admin-login.png" width="100%" alt="Admin login" />
      <br /><sub><b>2.</b> Admin login</sub>
    </td>
  </tr>
  <tr>
    <td valign="top">
      <img src="./docs/screenshots/03-admin-dashboard.png" width="100%" alt="Admin dashboard" />
      <br /><sub><b>3.</b> Admin dashboard</sub>
    </td>
    <td valign="top">
      <img src="./docs/screenshots/04-admin-cars.png" width="100%" alt="Admin cars" />
      <br /><sub><b>4.</b> Car inventory</sub>
    </td>
  </tr>
  <tr>
    <td valign="top">
      <img src="./docs/screenshots/05-admin-slabs.png" width="100%" alt="Admin slabs" />
      <br /><sub><b>5.</b> Dynamic slab panel</sub>
    </td>
    <td valign="top">
      <img src="./docs/screenshots/06-admin-officers.png" width="100%" alt="Admin officers" />
      <br /><sub><b>6.</b> Sales officer management</sub>
    </td>
  </tr>
  <tr>
    <td valign="top">
      <img src="./docs/screenshots/07-officer-login.png" width="100%" alt="Officer login" />
      <br /><sub><b>7.</b> Officer login</sub>
    </td>
    <td valign="top">
      <img src="./docs/screenshots/08-officer-dashboard.png" width="100%" alt="Officer dashboard" />
      <br /><sub><b>8.</b> Officer dashboard — tier & payout</sub>
    </td>
  </tr>
  <tr>
    <td valign="top">
      <img src="./docs/screenshots/09-officer-log-sale.png" width="100%" alt="Log sale" />
      <br /><sub><b>9.</b> Log a sale</sub>
    </td>
    <td valign="top">
      <img src="./docs/screenshots/10-officer-history.png" width="100%" alt="Officer history" />
      <br /><sub><b>10.</b> Monthly history</sub>
    </td>
  </tr>
</table>

---

## Demo login (live site)

| Role | URL | Email | Password |
|---|---|---|---|
| Admin | `/login/admin` | `admin@toyota.local` | `admin123` |
| Officer | `/login/officer` | `officer@toyota.local` | `officer123` |

---

## Incentive logic (short explanation)

Slabs are stored in the **`IncentiveSlab`** table. Example default tiers:

| Units sold (month) | Tier | ₹ per car |
|---|---|---|
| 0–9 | Foundation | 1,000 |
| 10–19 | Achiever | 1,400 |
| 20–29 | Performer | 1,800 |
| 30+ | Elite | 2,200 |

When an officer logs a sale, the app counts **total units that month**, finds the matching slab, and calculates payout. The same helper (`src/lib/incentive.ts`) is used on admin and officer pages so numbers stay consistent.

---

## Database schema (persistence)

PostgreSQL via Prisma:

| Table | Purpose |
|---|---|
| `User` | Admins & officers — email, role, officer ID, photo |
| `CarModel` | Sellable Toyota models |
| `IncentiveSlab` | Admin-defined tier ranges + payout rates |
| `SaleEntry` | Each logged sale (officer, car, date) |
| `MonthlySale` / `MonthlySaleItem` | Monthly summary structures |

Auth passwords live in **Supabase Auth**. App roles and business data live in **PostgreSQL**.

---

## Project structure

```
src/app/              Pages + API routes (/api/admin, /api/officer, /api/auth)
src/components/       UI (admin panels, officer dashboard, glass design system)
src/lib/              Incentive math, auth, validations, data loaders
prisma/               schema.prisma, migrations, seed.ts
docs/screenshots/     Put submission screenshots here
```

---

## Run locally

1. Clone the repo  
2. Copy `.env.example` → `.env` and fill in:
   - `DATABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

3. Install and set up:

```bash
npm install
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

4. Open http://localhost:3000  
5. Create the same emails in **Supabase → Authentication → Users**

---

## Notes for reviewers

- **RBAC:** Admins cannot access `/officer` routes and vice versa (middleware + role checks).
- **Errors:** API routes return JSON errors instead of crashing silently.
- **Responsive:** Mobile layouts use grids and collapsible sections (slabs, history, tier ladder).
- **Deployment:** Live URL tested for login, log sale, history, admin slab edits, and car CRUD.

---

Built by **Krishnanand G** for the Nippon Toyota SDE internship task.
