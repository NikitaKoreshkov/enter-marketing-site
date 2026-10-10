<div align="center">

# Enter Marketing (site)

**The same agency site, rebuilt around an admin panel instead of a shader.**
A Postgres-backed portfolio CMS — 125 cases with JSONB work/result/media arrays and
drag-order — plus a client cabinet with e-mail code verification, Google OAuth,
database-level rate limiting and support tickets.

![Next.js](https://img.shields.io/badge/next.js-App%20Router-black?logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-on-red?logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/postgreSQL-11%20tables-336791?logo=postgresql&logoColor=white)
![Cases](https://img.shields.io/badge/portfolio%20CMS-125%20seeded%20cases-brightgreen)
![Auth](https://img.shields.io/badge/auth-JWT%20%2B%20codes%20%2B%20Google-blueviolet)
![LOC](https://img.shields.io/badge/TypeScript-11.3k%20lines-blue)
![License](https://img.shields.io/badge/license-all%20rights%20reserved-red)

</div>

---

## The problem

The motion-heavy build of this agency
([`enter-marketing`](https://github.com/NikitaKoreshkov/enter-marketing)) proves the
point in a browser tab, but it cannot answer the question an agency actually gets
every week: *"can you add last week's project yourself?"*

This build inverts the priorities. The first screen is static and `framer-motion`
does the only animation left; everything heavy moved into the data layer, so a
marketer edits cases, uploads the cover and video, reorders the grid, and the site
changes on the next request — no deploy, no developer, no shader.

## What this is (and what it isn't)

**It is a content-managed site, not a platform.** Eleven tables, one admin role, one
customer role. `DATABASE_URL` is not optional: `lib/env.ts` throws
`Missing environment variable: DATABASE_URL` on the first query, and the public home
page reads cases from Postgres, so without a database nothing renders at all.

**It is not the LUNO build.** `app/layout.tsx:14` still titles the site
`"Enter Marketing — Digital агентство"`, `lib/admin/constants.ts` hardcodes
`ADMIN_NAME = "Enter Marketing Admin"`. The rebrand lives in the sibling repository.

**Not deployed.** The public showcase of this exact code runs at
`enter-marketing.vercel.app` only as the sibling build; this repository's admin panel
has no public URL by design, because it seeds a real admin account from
`ADMIN_PASSWORD` at migrate time.

## The map

```
 public                 /            cases grid from site_cases
                        /cases       full portfolio

 cabinet               /login /register /forgot-password /profile
                        19 route handlers:
                          auth/{login,register,me,logout,send-code,verify-code,
                                reset-password,google,google/callback}
                          profile/{company,orders,tickets,tickets/[id],workspace}
                          admin/{login,cases,cases/[id],upload}
                          media/[id]

 admin                 /admin                case list, counts, reorder
                        /admin/cases/new     create
                        /admin/cases/[id]    edit

 PostgreSQL (lib/db/pool.ts, schema in lib/db/schema.sql)
   users · sessions · verification_codes · auth_rate_limits
   company_profiles · support_tickets · ticket_messages · user_orders
   site_cases · site_meta · site_uploads
```

## What makes it different

- **A case is a document, not a row of columns.** `site_cases` stores `work`,
  `results`, `images` and `videos` as JSONB with `sort_order`, `cover`, `instagram`
  and `website` as scalars — so the editor can grow a case's structure without a
  migration, while ordering stays a single indexed integer.
- **Media lives in the database.** Uploads are capped at 12 MB for images and 80 MB
  for video (`lib/admin/constants.ts`), stored in `site_uploads.data` as `BYTEA`, and
  served by `GET /api/media/[id]` — which is why `next.config.ts` raises both
  `proxyClientMaxBodySize` and `serverActions.bodySizeLimit` to 100 mb. No object
  storage, no signed URLs, one backup.
- **Auth has three ways in and one rate limiter.** Password (`bcryptjs`, 12 rounds,
  policy: ≥8 chars with letters *and* digits), e-mail verification codes, and Google
  OAuth with a state cookie. All of them are throttled by `auth_rate_limits` — rows
  inserted per attempt and counted in SQL, so the limit survives a process restart
  and is shared across instances.
- **Auth hygiene runs as a maintenance pass, not a cron.**
  `runAuthMaintenance()` deletes expired/used codes (used rows live 24 h, codes
  expire in 15 min) and rate-limit rows older than 2 h, in parallel.
- **The admin account is seeded, not registered.** `npm run db:migrate` calls
  `ensureAdminUser()`; with no `ADMIN_PASSWORD` in the environment, seeding and the
  admin login both throw instead of creating a default account.
- **Admin is a column, not a role table.** `isAdminUser()` is `user.is_admin || user.email === ADMIN_EMAIL`
  — checked in `requireAdminUser()` inside server code. There is no `middleware.ts`
  in this build (an earlier version of this README said otherwise; it was wrong).
- **Reordering is a first-class action.** The case list has up/down controls per row
  and persists `sort_order`, which is the whole reason the grid can be trusted to a
  non-developer.

## Feature map

| Area | Where | What it does |
|---|---|---|
| Portfolio CMS | `lib/site/cases-store.ts`, `app/admin/cases/*` | CRUD + reorder + counts (projects / photos / videos) |
| Seed | `lib/site/cases-seed-db.ts` | 125 cases loaded on first read of an empty table |
| Uploads | `lib/site/uploads.ts`, `app/api/media/[id]` | MIME allow-list, size caps, BYTEA storage, `/api/media/{id}` URLs |
| Sessions | `lib/auth/session.ts` | `createSession()` writes a row and returns an HS256 JWT; legacy plain-UUID cookies still resolve |
| Rate limiting | `lib/auth/rate-limit.ts`, `lib/auth/cleanup.ts` | SQL-counted attempts, 2 h window, purged with codes |
| Google OAuth | `app/api/auth/google{,/callback}`, `lib/auth/google.ts` | state cookie, `?error=google_config` fallback when unconfigured |
| Cabinet | `app/profile`, `components/profile/*` | company profile, orders, tickets with threaded messages, workspace dashboard |
| Charts | `recharts` | growth metrics inside case cards and the cabinet |
| Mail | `nodemailer` | verification and reset e-mail over SMTP credentials |

## Stack and size

| 11 296 | 98 | 10 | 19 | 11 | 5 028 | 169 |
| --- | --- | --- | --- | --- | --- | --- |
| lines of TS/TSX | source files | pages | API routes | Postgres tables | lines of CSS | case images in `public/cases` |

Next.js App Router, TypeScript, Tailwind, `framer-motion`. Runtime dependencies are
`next`, `react`, `react-dom`, `pg`, `jose`, `bcryptjs`, `nodemailer`, `recharts`,
`framer-motion`, `dotenv`, `clsx`, `tailwind-merge`. No ORM, no auth provider, no UI
kit, no GSAP, no three.js, no Lenis — verified by grep, not by memory.

## Run it

```bash
git clone https://github.com/NikitaKoreshkov/enter-marketing-site
cd enter-marketing-site
npm install
createdb enter_marketing            # or any reachable Postgres
cat > .env.local <<'ENV'
DATABASE_URL=postgresql://you:pass@127.0.0.1:5432/enter_marketing
ADMIN_PASSWORD=<your own>
AUTH_SECRET=<32+ random chars>
APP_URL=http://localhost:3000
ENV
npm run dev        # runs db:migrate first, then next dev
```

`npm run dev` is `npm run db:migrate && next dev` on purpose: the schema, the admin
account and the 125 seed cases are guaranteed before the first request. Verified
against a throwaway Postgres 16: `/` 200, `/admin/login` 200, `/login` 200,
`/register` 200, and `/profile` + `/cases` behave as guarded/redirected as expected.

## Known limits

- **No deployment, so no public demo of the admin.** The screenshots below were
  captured from a local run against a throwaway database.
- **`BYTEA` media in Postgres is a deliberate trade, not a recommendation.** It
  makes the site trivially portable and the backup one `pg_dump`, at the cost of
  memory pressure on large video and no CDN in front of media.
- **One admin, identified by a boolean column plus a hardcoded e-mail.** No roles,
  no invitations, no audit log of who edited which case.
- **`ADMIN_EMAIL` is a literal in `lib/admin/constants.ts`.** Changing the admin
  identity is a code change, not a setting.
- **No tests, no lint gate in CI.**
- **`users.*` is selected with `SELECT u.*`** through the session join, so a new
  column becomes implicitly part of the auth path.

## Screenshots

<table>
  <tr>
    <td width="50%"><img src=".github/assets/hero.jpg" alt="Public landing page with the cases grid" /></td>
    <td width="50%"><img src=".github/assets/admin-cases.jpg" alt="Admin: case list with counts, reorder, edit and delete" /></td>
  </tr>
  <tr>
    <td><img src=".github/assets/admin-case-new.jpg" alt="Admin: case editor with media fields" /></td>
    <td><img src=".github/assets/admin-login.jpg" alt="Admin login" /></td>
  </tr>
  <tr>
    <td><img src=".github/assets/login.jpg" alt="Client cabinet login" /></td>
    <td></td>
  </tr>
</table>

`/cases` is not a route: it 307s to `/#cases`, because the portfolio is a section of
the landing page. The routes that exist are the ten listed in the map above.

## Коротко по-русски

Это та же витрина агентства, собранная наоборот: вместо WebGPU-шейдера и GSAP тут
статичный первый экран на `framer-motion`, а вся тяжёлая работа уехала в слой данных.
Портфолио стало редактируемым: `site_cases` хранит `work`, `results`, `images` и
`videos` как JSONB, порядок задаётся `sort_order` и меняется кнопками вверх/вниз прямо
в списке админки, поэтому маркетолог добавляет кейс, загружает обложку и ролик и
переставляет карточки без деплоя. Медиа лежит в самой базе (`site_uploads.data`,
BYTEA) с лимитами 12 МБ на картинку и 80 МБ на видео и отдаётся через
`GET /api/media/[id]` — ради этого в `next.config.ts` подняты `proxyClientMaxBodySize`
и `bodySizeLimit` до 100 МБ, зато бэкап остаётся одним `pg_dump` без объектного
хранилища. Вход в кабинет клиента — три способа (пароль на bcrypt 12 раундов с
политикой «буквы и цифры», код на почту, Google OAuth с state-кукой), и все три
троттлятся таблицей `auth_rate_limits`: попытки считаются SQL-запросом, поэтому
лимит переживает перезапуск процесса и общий для нескольких инстансов; просроченные
коды и строки лимита чистит `runAuthMaintenance()`. Админская учётка создаётся на
`npm run db:migrate` и без `ADMIN_PASSWORD` не создаётся вовсе — код падает явно, а не
заводит дефолтный пароль. Правильность пути проверена локально на временной
PostgreSQL 16: `/` 200, `/admin/login` 200, `/login` 200, `/register` 200. Из минусов:
публичного демо админки нет, ролей и аудита нет, `ADMIN_EMAIL` зашит константой,
тестов нет, а сессии читают `users.*` целиком.

## Rights

© 2026 Nikita Koreshkov. Portfolio piece, all rights reserved. Agency brand
assets, case imagery and client names belong to their owners.
