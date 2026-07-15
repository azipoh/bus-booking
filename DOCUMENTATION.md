# Moghamo Project Documentation

## 1. Project Overview

Moghamo is a React + TypeScript web application for booking bus tickets and registering parcel deliveries. It combines a public-facing customer experience with a role-based staff/admin panel for daily operations.

### What the app does

- Lets passengers search available buses by route and date
- Supports seat selection and booking with payment confirmation
- Stores booking history and loyalty points for returning users
- Allows users to register parcels and track them with a tracking code
- Gives staff and administrators tools to manage branches, buses, schedules, bookings, parcels, and users

### Primary user roles

- Passenger: browse schedules, book seats, view bookings, send parcels
- Cashier: register parcels and view parcel operations
- Manager: oversee branch-level operations and reports
- Admin: manage the wider platform and staff accounts

---

## 2. Tech Stack

- Frontend: React 18, TypeScript, Vite
- Styling: Tailwind CSS, shadcn/ui, Radix UI primitives
- Routing: React Router DOM
- State/data fetching: TanStack Query, React Context
- Backend/services: Supabase Postgres, Supabase Auth, Supabase Storage, Edge Functions
- Payments: Campay mobile money integration
- Testing: Vitest + Testing Library
- Animation: Framer Motion

---

## 3. Project Structure

- src/App.tsx — main app router and providers
- src/components — shared UI and feature components
- src/contexts — authentication and app-wide context
- src/pages — route-level screens for public and admin experiences
- src/lib — utilities, validation, formatting, and business helpers
- src/integrations/supabase — Supabase client and generated database types
- src/data — mock/static data used by the UI
- supabase/functions — edge functions for payments and SMS
- supabase/migrations — database migrations

### Important folders

- src/pages/Index.tsx — landing page and hero search experience
- src/pages/SearchResults.tsx — result list of matching schedules
- src/pages/SeatSelection.tsx — seat picker and booking flow
- src/pages/TrackParcel.tsx — public parcel tracking experience
- src/pages/Admin\* — admin dashboard and management pages
- src/components/PaymentModal.tsx — mobile money payment workflow

---

## 4. Core User Flows

### Passenger booking flow

1. User lands on the home page and searches for origin, destination, and date.
2. The app queries schedules from Supabase and displays matching buses.
3. The user selects a schedule and proceeds to seat selection.
4. The app locks seats temporarily and asks for passenger contact details.
5. Payment is initiated through the mobile-money modal.
6. Once payment succeeds, a booking record is created and the user is redirected to confirmation.

### My bookings

Authenticated users can review their booking history, download an e-ticket, and reschedule confirmed bookings when allowed.

### Parcel flow

1. A logged-in user registers a parcel with sender/recipient information and a route.
2. The system calculates fare by weight and creates a parcel record.
3. The parcel can later be tracked through the public tracking page using a generated tracking code.

### Admin flow

Admins and managers can manage:

- branches
- buses
- schedules
- bookings
- parcels
- staff and user roles
- settings and reporting

---

## 5. Authentication and Authorization

Authentication is handled through Supabase Auth and a custom React context in src/contexts/AuthContext.tsx.

### Role model

The app uses role-based access via the user_roles table and the ProtectedRoute component.

Supported roles:

- admin
- manager
- cashier
- user

### Route protection

The app protects routes based on authentication and role requirements. For example:

- public routes: home, search, track parcel, login
- passenger-only routes: bookings, profile, parcel registration for some contexts
- staff/admin routes: dashboards, reporting, schedule and branch management

---

## 6. Data Model Highlights

The application relies on several core database entities:

- branches — company offices or operational locations
- buses — fleet information, seats, and images
- routes — origin and destination combinations
- schedules — departures, fares, and availability for a route and bus
- bookings — ticket reservations and passenger details
- parcels — parcel shipment records and status
- profiles — user profile data including branch assignment
- user_roles — role mapping for each user
- seat_locks — temporary seat reservation state
- loyalty_points — user reward points earned from bookings

These entities are queried directly by the React app through the Supabase client.

---

## 7. Environment Setup

Create a local environment file before running the app.

### Required variables

- VITE_SUPABASE_URL
- VITE_SUPABASE_PUBLISHABLE_KEY

### Optional variable

- VITE_GOOGLE_FORM_URL — used by the questionnaire page if enabled

Example:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
VITE_GOOGLE_FORM_URL=https://forms.example.com
```

---

## 8. Local Development

### Install dependencies

```bash
npm install
```

### Run the app locally

```bash
npm run dev
```

The development server is configured in vite.config.ts and runs on port 8080.

### Build for production

```bash
npm run build
```

### Run tests

```bash
npm run test
```

### Lint the project

```bash
npm run lint
```

---

## 9. Testing and Quality Notes

The project uses Vitest and Testing Library. Tests live alongside or near the relevant feature area, such as:

- src/contexts/AuthContext.test.tsx
- src/components/PaymentModal.test.tsx
- src/lib/\*.test.ts

When adding new logic, prefer small unit tests for helpers and focused UI tests for important user workflows.

---

## 10. Integration Notes

### Supabase

The app uses Supabase for data storage, authentication, and file uploads. Most page-level data fetches go through the shared client in src/integrations/supabase/client.ts.

### Payments

Payment flows are handled through edge functions in the supabase/functions directory. The current implementation uses Campay for mobile money collection and status polling.

### SMS notifications

Booking confirmations can trigger SMS delivery through the send-sms edge function, with an in-app fallback if SMS delivery is unavailable.

---

## 11. Contributor Guidance

### When adding a new page

- Create the page in src/pages
- Add a route to src/App.tsx
- Use the appropriate protection wrapper if the page requires login or staff access
- Keep route-specific components small and delegate shared logic to hooks or utilities

### When adding a new data query

- Prefer TanStack Query for server state
- Keep queries scoped to the feature that uses them
- Use the shared Supabase client rather than creating a separate client instance

### When changing permissions

- Update the route protection logic in src/App.tsx or src/components/ProtectedRoute.tsx
- Make sure admin/staff UI controls match the access rules

### When changing styling

- Follow the existing Tailwind conventions already used across the app
- Reuse the UI primitives under src/components/ui when possible

---

## 12. Deployment Notes

The app is configured for Vite and can be deployed to Vercel or a similar static hosting platform. The repository includes a Vercel rewrite config in vercel.json to support client-side routing.

For deployment, ensure that:

- environment variables are configured in the hosting environment
- Supabase Auth redirect URLs match your production domain
- payment and SMS edge functions are deployed alongside the database

---

## 13. Summary

Moghamo is a full-featured travel and parcel platform with a polished public experience and a structured internal admin workflow. The codebase is organized around React pages, shared UI components, and Supabase-backed data services, making it suitable for both customer-facing use and operational management.
