# CLAUDE.md — cf-sales-inventory-system

## Project Overview

A sales and inventory management system for a Honduran food business (comida típica). Built as a full-stack Next.js app with a PostgreSQL backend via Drizzle ORM on Neon serverless.

**Author:** Dennis Anariba @MasterTechHn

---

## Tech Stack

| Layer | Tool |
|---|---|
| Framework | Next.js 15 (App Router, Turbopack) |
| Language | TypeScript 5 |
| UI | React 19, Tailwind CSS v4, Radix UI, Lucide React |
| ORM | Drizzle ORM |
| Database | PostgreSQL via Neon (serverless) |
| Validation | Manual DTO interfaces (no Zod yet) |
| Package Manager | npm |

---

## Architecture

This project follows a strict layered architecture. Every vertical feature must follow this pattern:

```
schema.ts (DB table + relations)
  └── dtos/<feature>.dto.ts       (input/output shape contracts)
  └── models/<feature>.model.ts   (domain types returned to FE)
  └── services/<feature>.service.ts (DB logic, static class methods)
  └── actions/<feature>.ts         ('use server' Next.js server actions)
  └── app/components/<feature>/    (React UI components)
  └── app/(protected)/<feature>/page.tsx
```

**Rules:**
- Services use Drizzle directly — no raw SQL except migrations.
- DTOs define what comes _in_; Models define what goes _out_.
- Server Actions are the only bridge between client and server — no API routes.
- `revalidatePath` is called in actions after mutations.
- Client components are `'use client'` and fetch via server actions (not `fetch`).
- `useTransition` for non-blocking async form submissions.

---

## Database

- **Driver:** `@neondatabase/serverless` (HTTP transport, edge-compatible)
- **ORM:** Drizzle ORM with schema-first approach
- **Config:** `drizzle.config.ts` — schema at `src/db/schema.ts`, migrations at `src/db/migrations/`
- **Connection:** `src/db/index.ts` — single `db` export, logger enabled in dev

### Scripts

```bash
npm run db:generate   # generate migration from schema changes
npm run db:migrate    # run pending migrations
npm run db:seed       # seed with sample data (idempotency not guaranteed — use once)
```

### Environment

Requires `.env.local` at project root:

```env
DATABASE_URL=postgres://...  # Neon connection string
JWT_SECRET=...               # ≥32 char random string for session signing
```

---

## Running Locally

```bash
npm install
npm run dev       # starts on http://localhost:3000 with Turbopack
```

---

## Commit Conventions

Follows **Conventional Commits**:

```
<type>: <subject>
```

Types in use: `init`, `build`, `chore`, `feat`, `fix`, `refactor`, `style`, `docs`, `test`

### Branching Strategy

```
epic/<epic-name>
  └── feat/<epic-name>/<ticket-number>-short-description
  └── fix/<epic-name>/<ticket-number>-short-description
```

Example:
```
epic/sales
  └── feat/sales/SI-001-sales-service
  └── feat/sales/SI-002-sales-ui
```

---

## Domain Model

The domain is a **Honduran food business** (baleadas, almuerzos típicos, etc).

```
productType         — category of product (e.g. "Baleada con todo")
product             — sellable menu item with price, linked to a productType
productItem         — raw ingredient/SKU (tracked by unit or pound, with cost)
productTypeItem     — M:M: which ingredients belong to which product type

saleType            — Contado / Crédito
paymentMethod       — Efectivo / Tarjeta / Transferencia
sales               — a transaction (subtotal, total, timestamps)
saleProduct         — line items: which products sold in a sale, with qty
```

---

## Feature Status

| Feature | Status |
|---|---|
| Product CRUD (type + product) | Done |
| Responsive sidebar/header layout | Done |
| Auth guard on `(protected)` routes | Done |
| Inventory module (ingredient CRUD) | Done |
| Sales module (POS flow + cart + cashback) | Done |
| Sales history (period filter, pagination, KPIs) | Done |
| Users module (admin-only, list/create/delete) | Done |
| Unit tests — services + session (90%+ coverage) | Done |
| Health check endpoint (`GET /api/health`) | Done |
| Recipe manager — ingredient ↔ product linking UI | Done |
| Dashboard with real metrics | Pending |
| ISV tax 15% (schema + sales flow) | Pending |
| Vercel UAT deployment | Pending |
| Neon UAT branch (staging DB) | Pending |

---

## Code Style

- **No comments** unless the WHY is non-obvious (hidden constraint, workaround, subtle invariant).
- **No docstrings** or multi-line comment blocks.
- Prefer editing existing files over creating new ones.
- No unnecessary abstractions — three similar lines beat a premature helper.
- Spanish labels in the UI are intentional (target users are Spanish-speaking).
