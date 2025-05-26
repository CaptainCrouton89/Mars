# Main Context Document: Mars CRM

> **Purpose**  
> This document is the single source of truth for a minimalist, single-user personal CRM. It captures the explicit requirements, data structures, and implementation plan needed to remove ambiguity during development.

---

## 1. Overview & Goals

### 1.1 Project Vision

A streamlined and private personal CRM that lets an individual efficiently **manage contacts, track opportunities, and log interactions**. Built with **Next.js (SSR)** for a responsive UI and **Supabase (PostgreSQL + Auth)** for secure data storage.

### 1.2 Primary Goals

| Goal                     | Description                                                                                                    |
| ------------------------ | -------------------------------------------------------------------------------------------------------------- |
| **Contact Management**   | Create, read, update, delete (CRUD) contact records with rich profile fields.                                  |
| **Opportunity Tracking** | Link opportunities to primary contacts and move them through well-defined sales stages.                        |
| **Interaction Logging**  | Record and reference every touch-point (email, call, meeting, note) with automatic follow-up reminders.        |
| **Privacy & Ownership**  | All data is isolated to the authenticated user via Supabase Row-Level Security (RLS). No multi-tenant sharing. |
| **Simplicity**           | No third-party integrations, analytics, or real-time features in v1.                                           |

### 1.3 Scope

_In Scope (v1)_

- Next.js SSR pages and APIs.
- Supabase Auth (email/password) & RLS-protected Postgres.
  - Details at https://supabase.com/docs/guides/auth/server-side/nextjs?queryGroups=router&router=app\
- Tailwind CSS-styled UI, https://tailwindcss.com/docs/installation/using-postcss
- Full CRUD for Contacts, Opportunities, Interactions.
- Basic keyword search & stage filters (server-side).

_Out of Scope (v1)_

- Team accounts or data sharing.
- Third-party APIs (email sync, social scraping, analytics).
- Real-time subscriptions / edge functions.
- Complex BI reporting or dashboards.

### 1.4 Success Criteria

- All CRUD flows complete in ≤3 clicks.
- Page <250 ms TTFB on cold load (SSR).
- 100 % unit-tested RLS policies (no cross-user leaks).
- Zero PII stored outside encrypted Postgres at rest.

---

## 2. Context & Architecture

### 2.1 System Context

┌─────────────────────────────────────┐
│ Authenticated User │
└───────────────┬─────────────────────┘
▼
┌─────────────────────────────────────┐
│ Next.js App (SSR, API routes) │
│ • Tailwind UI │
│ • getServerSideProps data access │
└──────┬───────────────┬──────────────┘
│ │
Reads/Writes Auth (JWT)
│ │
┌──────▼───────────────▼──────────────┐
│ Supabase Postgres │
│ • contacts │
│ • opportunities │
│ • interactions │
│ • profiles │
│ • RLS policies │
└─────────────────────────────────────┘

_Hosting_: Vercel (Next.js) • Supabase (DB + Auth)  
_Runtime_: Node 18
_State_: All persistent data in Postgres; no Redis / external queues.

### 2.2 Key Concepts

| Term            | Definition                                                                          |
| --------------- | ----------------------------------------------------------------------------------- |
| **Contact**     | A person or organization of interest.                                               |
| **Opportunity** | A potential deal linked to one primary contact.                                     |
| **Interaction** | Any logged communication or note tied to a contact (and optionally an opportunity). |
| **Stage**       | Canonical sales step for an opportunity (Lead → Won/Lost).                          |
| **RLS**         | Supabase Row-Level Security ensuring `auth.uid() = user_id`.                        |

---

## 3. Data Model / Schema

### 3.1 contacts

| Column       | Type        | Constraints                          |
| ------------ | ----------- | ------------------------------------ |
| id           | uuid (PK)   | default uuid_generate_v4()           |
| user_id      | uuid        | FK ↦ auth.users.id                   |
| first_name   | text        | nullable                             |
| last_name    | text        | nullable                             |
| email        | text        | unique per (user_id, email) nullable |
| phone        | text        | nullable                             |
| company      | text        | nullable                             |
| role_title   | text        | nullable                             |
| notes        | text        | nullable                             |
| source       | text        | nullable                             |
| linkedin_url | text        | nullable                             |
| twitter_url  | text        | nullable                             |
| website      | text        | nullable                             |
| address      | text        | nullable                             |
| birthday     | date        | nullable                             |
| created_at   | timestamptz | default now()                        |
| updated_at   | timestamptz | default now()                        |

### 3.2 opportunities

| Column              | Type        | Constraints                |
| ------------------- | ----------- | -------------------------- |
| id                  | uuid (PK)   | default uuid_generate_v4() |
| user_id             | uuid        | FK ↦ auth.users.id         |
| contact_id          | uuid        | FK ↦ contacts.id           |
| name                | text        | not null                   |
| description         | text        | nullable                   |
| value               | numeric     | nullable                   |
| currency            | text        | nullable                   |
| stage               | text        | not null (enum seed)       |
| expected_close_date | date        | nullable                   |
| actual_close_date   | date        | nullable                   |
| priority            | int         | nullable (1–5)             |
| created_at          | timestamptz | default now()              |
| updated_at          | timestamptz | default now()              |

### 3.3 interactions

| Column              | Type        | Constraints                    |
| ------------------- | ----------- | ------------------------------ |
| id                  | uuid (PK)   | default uuid_generate_v4()     |
| user_id             | uuid        | FK ↦ auth.users.id             |
| contact_id          | uuid        | FK ↦ contacts.id               |
| opportunity_id      | uuid        | FK ↦ opportunities.id nullable |
| type                | text        | not null                       |
| date_of_interaction | timestamptz | default now()                  |
| summary             | text        | not null                       |
| follow_up_needed    | boolean     | default false                  |
| follow_up_date      | date        | nullable                       |
| created_at          | timestamptz | default now()                  |
| updated_at          | timestamptz | default now()                  |

### 3.4 profiles _(minimal for v1)_

| Column    | Type      | Constraints        |
| --------- | --------- | ------------------ |
| id        | uuid (PK) | FK ↦ auth.users.id |
| user_id   | uuid      | FK ↦ auth.users.id |
| time_zone | text      | nullable           |
| currency  | text      | nullable           |

### 3.5 RLS Policies

```sql
-- All tables follow the same pattern
create policy "User owns row"
on contacts for all
using ( auth.uid() = user_id )
with check ( auth.uid() = user_id );

Unit tests must cover every table for both positive and negative cases.

⸻

4. Functional Requirements

4.1 Authentication & Profiles
	•	User registers and logs in via Supabase Auth (email + password).
	•	Upon signup, a profiles row is created.

4.2 Contact Management

User Story	Acceptance Criteria
Create contact	Form saves row; redirects to detail page.
Edit contact	Inline or dedicated edit page; timestamps updated.
Delete contact	Soft-delete flag NOT required v1; hard delete allowed.
Search contacts	Case-insensitive search across first name, last name, email, company.

4.3 Opportunity Tracking

Story	AC
Create opportunity linked to a contact	Contact dropdown, default stage “Lead”.
Update stage	Stage list: Lead → Contacted → Proposal → Negotiation → Won/Lost.
View pipeline	Kanban or table grouped by stage.
Delete opportunity	Removes row; interactions remain but opportunity_id set NULL.

4.4 Interaction Logging

Story	AC
Log interaction	Select contact (and optional opportunity), choose type, enter summary.
Edit interaction	Update any field; updated_at set.
Follow-up	If follow_up_needed = true, show upcoming list ordered by follow_up_date.

4.5 Navigation & UX
	•	Sidebar: Contacts · Opportunities · Interactions · Settings.
	•	Responsive layout (mobile first).
	•	Breadcrumbs or header for contextual navigation.
	•	Minimal page count (<10 total).

⸻

5. Design Specification

5.1 UI/UX
	•	Tailwind CSS
	•	Headless UI components (Dialog, Menu) where accessible behavior is non-trivial.
	•	Form library: React Hook Form + Zod schema validation.

5.3 Server-Side Data Access
	•	Use supabase server client to run SQL queries (RLS enforced) when on server
    •   Use supabase client for client-side access (utilizes RLS automatically for security)

5.4 Environment Variables

SUPABASE_PASSWORD=5J8hUKkRdHE26nX#
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlpd2tiYWZsZHNxanZya3RybGJ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MjM2Mzk1MiwiZXhwIjoyMDU3OTM5OTUyfQ.CkuQ95MQ-FPWNNR1BVxCA13MsihRvubo_spZYy2zHZc
NEXT_PUBLIC_SUPABASE_URL=https://yiwkbafldsqjvrktrlbu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlpd2tiYWZsZHNxanZya3RybGJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIzNjM5NTIsImV4cCI6MjA1NzkzOTk1Mn0.gt-O8nGEJs57RUBV-jikh0OwjGHAHkUHp1djYgyQ6H4
```
