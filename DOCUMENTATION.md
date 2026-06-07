# BusGo — Project Documentation

BusGo is a full-stack bus ticketing and parcel-delivery platform built for the
Cameroon market. Passengers can search routes, pick seats, pay (simulated mobile
money), receive SMS confirmations and earn loyalty points. Administrators manage
the fleet, schedules, bookings and parcels through a dedicated dashboard.

This document explains the entire project in detail: architecture, technology,
data model, features, security, and how to run/deploy it.

---

## 1. Overview

| Item | Detail |
|------|--------|
| Project name | BusGo |
| Type | Academic degree project (web application) |
| Domain | Intercity bus booking + parcel courier service |
| Market | Cameroon (FCFA currency, +237 phones, local cities) |
| Frontend | React 18 + Vite + TypeScript + Tailwind CSS + shadcn/ui |
| Backend | Supabase (PostgreSQL, Auth, Storage, Edge Functions) via Lovable Cloud |
| Notifications | Twilio SMS (through an edge function) |
| Payments | Simulated MTN MoMo / Orange Money (no real money is moved) |

---

## 2. Technology Stack

### Frontend
- **React 18** with functional components and hooks
- **Vite 5** as the build tool / dev server (runs on `http://localhost:8080`)
- **TypeScript 5** for type safety
- **Tailwind CSS v3** with a semantic design-token system (see `src/index.css`
  and `tailwind.config.ts`)
- **shadcn/ui** (Radix UI primitives) for accessible components
- **React Router v6** for client-side routing
- **TanStack Query (React Query)** for server-state/data fetching
- **React Hook Form + Zod** for forms and validation
- **Recharts** for admin analytics charts
- **Framer Motion** for animation
- **lucide-react** for icons
- **next-themes** for light/dark theme switching
- **Sonner + Radix Toast** for notifications

### Backend (Supabase / Lovable Cloud)
- **PostgreSQL** database with Row-Level Security (RLS) on every table
- **Supabase Auth** (email/password with mandatory email verification)
- **Supabase Storage** — `bus-images` public bucket for bus photos
- **Edge Functions** (Deno) for server-side logic
- **pg_cron** scheduled job to auto-deactivate schedules before departure

---

## 3. Project Structure

```
busgo/
├── public/                     # Static assets (robots.txt, placeholder.svg)
├── src/
│   ├── App.tsx                 # Root app: providers + all routes
│   ├── main.tsx                # React entry point
│   ├── index.css               # Design tokens (light & dark themes, HSL)
│   ├── components/
│   │   ├── Navbar.tsx          # Top navigation
│   │   ├── NavLink.tsx
│   │   ├── SearchForm.tsx      # Route/date search box
│   │   ├── BusCard.tsx         # Search result card
│   │   ├── SeatMap.tsx         # Visual seat picker
│   │   ├── PaymentModal.tsx    # Simulated mobile-money payment
│   │   ├── RescheduleModal.tsx # Change a booking's schedule
│   │   ├── AuthDialog.tsx      # Login/signup prompt
│   │   ├── ProtectedRoute.tsx  # Auth + admin route guard
│   │   └── ui/                 # shadcn/ui components
│   ├── contexts/
│   │   └── AuthContext.tsx     # Session, user, isAdmin, auth actions
│   ├── pages/                  # Route pages (see Routing section)
│   ├── hooks/                  # use-mobile, use-toast
│   ├── lib/
│   │   ├── currency.ts         # FCFA formatting
│   │   ├── scheduleHelpers.ts  # Types + seat-layout generation
│   │   └── utils.ts            # cn() helper
│   ├── data/mockData.ts        # Sample/demo data & TS interfaces
│   └── integrations/supabase/
│       ├── client.ts           # Supabase client (auto-generated, do not edit)
│       └── types.ts            # DB types (auto-generated)
├── supabase/
│   ├── config.toml             # Edge function config
│   └── functions/
│       ├── send-sms/           # Sends SMS via Twilio
│       ├── deactivate-schedules/  # Cron: closes schedules before departure
│       └── seed-admin/         # Creates the default admin account
├── tailwind.config.ts
├── vite.config.ts
└── package.json
```

---

## 4. Routing

Routes are declared in `src/App.tsx`. Protected routes use `<ProtectedRoute>`;
admin-only routes add the `requireAdmin` prop.

| Path | Page | Access |
|------|------|--------|
| `/` | `Index` | Public — home + search |
| `/search` | `SearchResults` | Public — available trips |
| `/select-seat/:scheduleId` | `SeatSelection` | Authenticated |
| `/booking-confirmation` | `BookingConfirmation` | Authenticated |
| `/my-bookings` | `MyBookings` | Authenticated |
| `/track-parcel` | `TrackParcel` | Public — track by code |
| `/profile` | `Profile` | Authenticated |
| `/login`, `/signup` | `Login` | Public |
| `/forgot-password` | `ForgotPassword` | Public |
| `/reset-password` | `ResetPassword` | Public |
| `/admin` | `AdminDashboard` | Admin |
| `/admin/buses` | `AdminBuses` | Admin |
| `/admin/schedules` | `AdminSchedules` | Admin |
| `/admin/bookings` | `AdminBookings` | Admin |
| `/admin/parcels` | `AdminParcels` | Admin |
| `/admin/send-parcel` | `SendParcel` | Admin |
| `/admin/my-parcels` | `MyParcels` | Admin |
| `/admin/settings` | `AdminSettings` | Admin |
| `*` | `NotFound` | Public — 404 |

---

## 5. Authentication & Authorization

Implemented in `src/contexts/AuthContext.tsx` using Supabase Auth.

- **Sign up** with full name, email, password, optional phone. Email
  verification is **mandatory** (no auto-confirm).
- **Sign in / sign out** via Supabase session.
- The provider listens to `onAuthStateChange` first, then loads the existing
  session (the recommended order to avoid deadlocks).
- **Admin detection**: after login the app checks the `user_roles` table for an
  `admin` row and exposes `isAdmin`.
- **Password recovery** via `ForgotPassword` / `ResetPassword`.

### Role-Based Access Control (RBAC)
Roles are stored in a **separate `user_roles` table** (never on the profile) to
prevent privilege-escalation attacks. A `SECURITY DEFINER` function
`has_role(user_id, role)` is used inside RLS policies to avoid recursion. The
`app_role` enum has `admin` and `user`. New users get the `user` role
automatically via the `handle_new_user` trigger.

`ProtectedRoute` redirects unauthenticated users to login and blocks
non-admins from admin routes.

---

## 6. Database Schema

All tables live in the `public` schema with RLS enabled. Key tables:

### `profiles`
User profile (id = auth user id, full_name, email, phone). Auto-created by the
`handle_new_user` trigger on sign-up. Users can view/update only their own.

### `user_roles`
`(user_id, role)` — drives RBAC. Read by `has_role()`.

### `routes`
Origin, destination, distance_km. Publicly readable; admin-managed.

### `buses`
Fleet vehicles: name, registration_number, bus_type, total_seats, amenities,
image_url, is_active. Publicly readable; admin-managed. Images stored in the
`bus-images` storage bucket.

### `schedules`
A bus running a route at a time: bus_id, route_id, departure_time,
arrival_time, fare, available_seats, status. Publicly readable; admin-managed.

### `seat_locks`
Temporary holds on seats during checkout. Each lock expires after **5 minutes**
(`expires_at` default `now() + 5 min`). Prevents double-booking. Anyone can read
active locks; users manage their own.

### `bookings`
A confirmed reservation: schedule_id, user_id, seat_numbers[], passenger
details, total_fare, **unique PNR**, status. Users see/manage only their own;
admins see all.

### `parcels`
Courier shipments: sender/recipient details, origin, destination, weight_kg,
fare (weight-based), status, **public tracking_code**. Created/managed by admins;
senders view their own. Public tracking via the `track_parcel()` function.

### `loyalty_points`
Points ledger: user_id, points, description, booking_id. Users earn **1 point
per 100 FCFA spent**.

### Database functions
- `handle_new_user()` — trigger; creates profile + default `user` role on signup.
- `has_role(_user_id, _role)` — security-definer role check used in RLS.
- `track_parcel(_tracking_code)` — security-definer public parcel lookup.
- `update_updated_at()` — keeps `updated_at` fresh.

---

## 7. Core Features

### 7.1 Bus Search & Booking (5-step flow)
1. **Search** (`Index` → `SearchForm`): pick origin, destination, date.
2. **Results** (`SearchResults` → `BusCard`): list matching schedules with
   fare, times, amenities and available seats.
3. **Seat selection** (`SeatSelection` → `SeatMap`): visual seat grid generated
   by `generateSeatLayout()` (2 + aisle + 2 layout; window seats cost slightly
   more). Selecting seats creates 5-minute `seat_locks`.
4. **Payment** (`PaymentModal`): simulated MTN MoMo / Orange Money via a +237
   number. No real charge occurs.
5. **Confirmation** (`BookingConfirmation`): generates a unique PNR, persists the
   booking, awards loyalty points, and triggers an SMS.

### 7.2 Booking Management (`MyBookings`)
View bookings, **reschedule** to another schedule (`RescheduleModal`), and
cancel. Policy: bookings are **non-refundable**.

### 7.3 Parcel Service
- **Send** (`SendParcel`, admin): create a shipment; fare computed by weight.
- **Track** (`TrackParcel`, public): look up status by tracking code.
- **Manage** (`AdminParcels`, `MyParcels`): update statuses, view shipments.

### 7.4 Loyalty Points
Earned automatically on paid bookings (1 pt / 100 FCFA) and shown on the
passenger profile.

### 7.5 Notifications (SMS)
The `send-sms` edge function sends Twilio SMS for booking confirmations and
updates, with a ~10s fallback. Email notifications are disabled.

### 7.6 Admin Dashboard
- `AdminDashboard` — Recharts analytics (revenue, bookings, trends).
- `AdminBuses` — fleet CRUD + image upload to `bus-images`.
- `AdminSchedules` — create/manage schedules.
- `AdminBookings` — view/manage all bookings.
- `AdminParcels` — manage shipments.
- `AdminSettings` — configuration.

### 7.7 Passenger Profile (`Profile`)
Manage personal details, view booking history and loyalty points.

---

## 8. Edge Functions

Located in `supabase/functions/` (Deno runtime).

| Function | Purpose | JWT |
|----------|---------|-----|
| `send-sms` | Sends SMS via Twilio (`TWILIO_API_KEY`) | not verified |
| `deactivate-schedules` | Cron job: closes schedules **30 min before departure** | not verified |
| `seed-admin` | Creates the default admin account | — |

Backend changes (functions, migrations) deploy automatically; frontend changes
require clicking **Update** in the publish dialog.

---

## 9. Design System

- Defined entirely with **semantic HSL tokens** in `src/index.css` and
  `tailwind.config.ts`. Components never hard-code colors.
- **Theme**: transportation-themed with a **navy + amber** palette.
- **Light mode** uses the original palette; **dark mode** uses a *Midnight
  Indigo* palette, tuned so text and accents stay readable.
- Theme toggling via `next-themes`.

---

## 10. Localization

- **Currency**: FCFA, formatted by `formatCurrency()` (`src/lib/currency.ts`)
  using French (`fr-FR`) thousands separators.
- **Cities**: Cameroonian cities for routes.
- **Phones**: `+237` format.

---

## 11. Security

- **RLS on every table** — no policy means no access.
- Roles isolated in `user_roles`; checks go through `has_role()` (security
  definer) — never trust client-side flags.
- Public-readable data is limited to routes, schedules, buses, active seat locks
  and parcel tracking. Bookings, profiles and admin actions are restricted.
- Secrets (Twilio key, service-role key, etc.) live in backend secrets, never in
  client code. The frontend only uses the public anon/publishable key.
- Email verification is required before accounts become usable.

---

## 12. Running Locally

Prerequisites: **Node.js** (via nvm), **npm**, **Git**.

```sh
# 1. Clone
git clone <YOUR_GIT_URL>
cd busgo

# 2. Install dependencies
npm install

# 3. Environment variables (.env)
#    VITE_SUPABASE_URL=...
#    VITE_SUPABASE_PUBLISHABLE_KEY=...
#    VITE_SUPABASE_PROJECT_ID=...

# 4. Start the dev server
npm run dev          # http://localhost:8080
```

Other scripts:
- `npm run build` — production build to `dist/`
- `npm run preview` — preview the production build
- `npm run lint` — run ESLint
- `npm run test` — run Vitest tests

The in-Lovable preview always talks to Lovable Cloud. For local-only or
self-hosted databases, point the `.env` values at your own Supabase project and
run `supabase db push` to recreate the schema.

---

## 13. Deployment

- **Frontend**: deployable to any static host (Lovable Publish, or Vercel with
  the Vite preset — build `npm run build`, output `dist`).
- **Backend**: Supabase project hosts the database, auth, storage and edge
  functions. When moving to your own Supabase project, push migrations, deploy
  the three edge functions with their secrets, recreate the `bus-images` bucket,
  and re-seed the admin + sample data.

---

## 14. Glossary

- **PNR** — Passenger Name Record; the unique booking reference.
- **Seat lock** — a 5-minute temporary hold preventing double-booking.
- **FCFA** — Central African CFA franc, the local currency.
- **RLS** — Row-Level Security, PostgreSQL's per-row access control.
- **RBAC** — Role-Based Access Control via the `user_roles` table.
