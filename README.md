# Ajo — The Savings Circle

Chairman Ade runs too many ajo circles and the arithmetic has defeated him. This service keeps the books: a member joins, pays in once a week, sees the pot and whose turn it is, and only the circle admin can declare the payout — and only to the person whose turn it actually is.

There are two parts in this repo:

| Piece | Where | Local URL | Live |
| --- | --- | --- | --- |
| API (FastAPI) | `app/` | http://127.0.0.1:8000/docs | [Swagger docs](https://argon-savings-circle-ebko6idtd-majesty4.vercel.app/docs) |
| Website (Next.js) | `frontend/` | http://localhost:3000 | Vercel (set `NEXT_PUBLIC_API_URL` to the API origin) |

Live API origin (no `/docs`, no trailing slash):

`https://argon-savings-circle-ebko6idtd-majesty4.vercel.app`

Secrets are hard-coded on purpose so the lesson stays readable. That is a sin in production.

## Demo accounts

| Who | Username (email) | Password | Role |
| --- | --- | --- | --- |
| Chairman Ade | `ade@ajo.com` | `secret123` | admin |
| Amaka | `amaka@ajo.com` | `secret123` | member |
| Chinedu | `chinedu@ajo.com` | `secret123` | member |

Bank robot: header `X-API-Key` = `argon-secret-ajo` (no password, no JWT).

Amaka is user `2`, Chinedu is user `3`, if you have not registered anyone else.

On `/docs` login (Authorize), put the email in **username**.

## Run locally

API first, from this folder:

```
.venv\Scripts\activate
fastapi dev app/main.py
```

Or: `uv run fastapi dev`

Then the website, with the API already running:

```
cd frontend
npm install
npm run dev
```

Open http://localhost:3000

The site talks to `http://127.0.0.1:8000` unless you set `NEXT_PUBLIC_API_URL`. To use the hosted API locally, copy `frontend/.env.example` to `frontend/.env.local` and set:

```
NEXT_PUBLIC_API_URL=https://argon-savings-circle-ebko6idtd-majesty4.vercel.app
```

If you already had an old `ajo.db` from earlier work, delete it once so the tables match (the join-request table is new).

## API shape (team update)

Join is a **request**, not an instant membership. Ade approves it.

| Method | Path | Who |
| --- | --- | --- |
| POST | `/auth/register`, `/auth/login` | Anyone |
| GET | `/auth/me` | Signed-in user |
| GET | `/circles` | Signed-in user (all circles) |
| GET | `/circles/{id}`, `/circles/{id}/health` | Circle admin or member |
| POST | `/circles/{id}/join` | Signed-in user (creates a pending request) |
| POST | `/circles/{id}/contributions` | Member |
| GET | `/circles/{id}/contributions/me` | Member |
| GET | `/circles/my_contributions` | Signed-in user |
| POST | `/circles/{id}/payouts` | Circle admin |
| POST | `/admin/circles` | Admin |
| GET | `/admin/users` | Admin |
| GET | `/admin/requests` | Admin |
| GET | `/admin/circles/{id}/requests` | Circle admin |
| POST | `/admin/circles/{id}/requests/{request_id}/approve` | Circle admin |
| PUT | `/admin/circles/{id}/turn-order` | Circle admin |
| POST | `/bank/confirm`, GET `/bank/ledger` | `X-API-Key` |

## Host on Vercel

Two Vercel projects, one GitHub repo. No Supabase — SQLite is enough for the hackathon.

On Vercel the database file lives in `/tmp`. Demo users are reseeded when a new instance starts. Circles and payments you create may disappear after a quiet spell or a redeploy.

### 1. Push this repo to GitHub

### 2. API project

1. Vercel → **Add New → Project** → import the repo.
2. **Root Directory:** leave as the repo root (not `frontend`).
3. Framework should detect **FastAPI** (`app/main.py`).
4. Deploy.
5. Open [the live docs](https://argon-savings-circle-ebko6idtd-majesty4.vercel.app/docs) and check it loads.

CORS is open (`allow_origins=["*"]`) for the hackathon.

### 3. Website project

1. Vercel → **Add New → Project** → the **same** repo again.
2. **Root Directory:** `frontend`.
3. Framework: **Next.js**.
4. Env (Production and Preview):

| Name | Value |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | `https://argon-savings-circle-ebko6idtd-majesty4.vercel.app` |

No trailing slash.

5. Deploy.
6. Log in as `ade@ajo.com` / `secret123`.

### 4. If the site cannot reach the API

Confirm `NEXT_PUBLIC_API_URL` on the website project is `https://argon-savings-circle-ebko6idtd-majesty4.vercel.app` (no trailing slash, no `/docs`) and redeploy the website.

## Why this auth style

People use the app: they type a password once and get a JWT. The bank's payment machine is not a person — it cannot type a password — so it does not get an account. It sends a secret key on `X-API-Key`. A member's token cannot confirm a transfer, and the robot's key cannot declare a payout.
