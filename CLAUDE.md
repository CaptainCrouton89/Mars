# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is Mars CRM - a minimalist, single-user personal CRM built with Next.js 15 and Supabase. The project consists of:

- **Frontend**: Next.js 15 with App Router, TypeScript, Tailwind CSS v4
- **Backend**: Supabase (PostgreSQL + Auth) with Row-Level Security (RLS)
- **Architecture**: Server-side rendering with API routes, hosted on Vercel

## Development Commands

```bash
# Development server (uses Turbopack)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Linting
npm run lint
```

## Core Architecture

### Database Schema
The application centers around three main entities with RLS policies:

- **contacts**: Personal/company profiles with contact information
- **opportunities**: Sales opportunities linked to contacts
- **interactions**: Communication logs tied to contacts/opportunities
- **profiles**: User settings and preferences

All tables enforce `auth.uid() = user_id` via RLS for data isolation.

### Data Access Patterns
- Use Supabase server client for server-side operations (SSR, API routes)
- Use Supabase client for client-side operations (automatic RLS enforcement)
- All data queries must respect the single-user, RLS-protected architecture

### UI Framework
- Tailwind CSS v4 with PostCSS configuration
- React Hook Form + Zod for form validation
- Headless UI components for accessible behavior where needed
- Mobile-first responsive design

## File Structure
```
/personal-crm/
├── src/app/           # Next.js App Router pages
├── package.json       # Dependencies and scripts
├── tsconfig.json      # TypeScript configuration (uses @/* path mapping)
└── eslint.config.mjs  # ESLint with Next.js presets
```

## Environment Variables
Required environment variables (from prd.md):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_PASSWORD`

## Key Implementation Notes

- All database operations must enforce RLS policies for user data isolation
- Use Next.js SSR (getServerSideProps) for initial data loading
- Forms should use React Hook Form with Zod validation
- Navigation: Sidebar with Contacts · Opportunities · Interactions · Settings
- Target <250ms TTFB on cold load
- Opportunity stages: Lead → Contacted → Proposal → Negotiation → Won/Lost