# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Full-stack e-commerce/product management system with separate admin and guest surfaces. Monorepo with 4 active services:

- `frontend-admin/` — Next.js 15 admin dashboard (React 19, TypeScript, App Router)
- `frontend-guest/` — Vite+React guest storefront (React 19, TypeScript)
- `backend-admin/` — FastAPI admin backend (Python 3.13, async SQLAlchemy, JWT auth) — serves both admin and guest frontends
- `backend-guest/` — **deprecated** Actix-web guest backend (Rust, SQLx) — no longer deployed
- `monitor/` — Python health check service (APScheduler, email alerts)

## Commands

### Frontend Admin (`frontend-admin/`)
```bash
npm install
npm run dev      # Dev server on port 3000 (Turbopack)
npm run build
npm run lint
```

### Frontend Guest (`frontend-guest/`)
```bash
npm install
npm run dev      # Dev server on port 3001
npm run build
npm run lint
npm run preview
```

### Backend Admin (`backend-admin/`)
```bash
uv sync          # Install deps (uses UV, not pip)
python main.py   # Reads .env.dev or .env.prod based on ENVIRONMENT
```

Alembic migrations:
```bash
alembic upgrade head
alembic revision --autogenerate -m "description"
```

### Monitor (`monitor/`)
```bash
uv sync
python main.py
```

## Architecture

### Data Flow
```
Guest Frontend (Vite) → Admin Backend (FastAPI :8001) → PostgreSQL + local assets/
Admin Frontend (Next.js) → Admin Backend (FastAPI :8001) → PostgreSQL + local assets/
Monitor → /health_check endpoint (admin backend) → email alert on 3 consecutive failures
```

### API Structure

**Admin Backend** — all admin routes protected by `login_guard` JWT middleware:
- `POST /guest/login` — public login
- `/admin/v1/{nav,category,sub_category,product,series,size,gender,color,sub_product,product_card}` — CRUD

**Guest routes** (public, no auth) — also accessible without `/guest` prefix:
- `GET /v1/guest/navs`, `/v1/guest/navs/{nav_route}`
- `GET /v1/guest/categorys` (filtered by nav_route or product_id)
- `GET /v1/guest/series`
- `GET /v1/guest/products`, `/v1/guest/products/nav_index`

### Frontend Patterns

**Admin (Next.js App Router):**
- All API calls go through `baseFetch()` in `src/api/base.ts` — handles JWT injection, loading state, Redux alert dispatch
- Redux store manages global alerts and loading spinner
- Dynamic routes: `/category/[nav_route]/[category_route]/[sub_category_route]`

**Guest (React Router v7):**
- Uses React Router loaders for data fetching (no Redux)
- Routes: `/`, `/home/:nav_route`, `/category/:nav_route/:category_route/:sub_category_route`, `/product/:product_id`

### Backend Patterns

**Admin Backend (FastAPI):**
- Async throughout — `asyncpg` driver, `async def` route handlers
- SQLAlchemy models extend `Base` from `src/models/base.py` (includes `id`, `created_at`, `updated_at`)
- Environment config loaded from `.env.{ENVIRONMENT}` via `python-dotenv`
- Images stored locally under `assets/{env}/`

## Environment Config

Each service reads `.env.dev` or `.env.prod` (not committed). Key variables:

**backend-admin:** `SQL_URL`, `JWT_KEY`, `ADMIN_PASSWORD`, `FRONETEND_ADMIN_ORIGIN`, `FRONTEND_GUEST_ORIGIN`, `MONITOR_ORIGIN`, `PORT=8001`

## CI/CD

`.github/workflows/backend.yml` triggers on push to `main`:
1. SSH into Lightsail
2. Pull latest code
3. `uv sync` + systemd restart for admin backend
4. Run `monitor/run.sh`

Frontend deploys are handled automatically by Vercel on push.
