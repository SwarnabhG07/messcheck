# 🍽️ MessCheck — Contributor Guide

Welcome to **MessCheck**! This document walks you through the project architecture, folder structure, conventions, and everything you need to get productive quickly.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Folder Structure](#folder-structure)
- [Architecture Diagram](#architecture-diagram)
- [Key Files Explained](#key-files-explained)
- [Data Flow](#data-flow)
- [Authentication](#authentication)
- [Environment Variables](#environment-variables)
- [Getting Started](#getting-started)
- [Conventions & Best Practices](#conventions--best-practices)
- [Adding a New Feature](#adding-a-new-feature)

---

## Project Overview

MessCheck is a **college mess dashboard** built with Next.js (App Router). It lets students and admins:

- View today's mess menu (Breakfast, Lunch, Snacks, Dinner)
- Rate and review meals
- Track weekly satisfaction trends via charts
- Manage users with email/password or Google OAuth login

---

## Tech Stack

| Layer            | Technology                                                    |
| ---------------- | ------------------------------------------------------------- |
| **Framework**    | [Next.js 16](https://nextjs.org/) (App Router)               |
| **Language**     | TypeScript + JavaScript                                       |
| **UI**           | React 19, [Tailwind CSS v4](https://tailwindcss.com/)        |
| **Components**   | [shadcn/ui](https://ui.shadcn.com/) + [Radix UI](https://radix-ui.com/) |
| **Icons**        | [Lucide React](https://lucide.dev/), HugeIcons               |
| **Charts**       | [Recharts](https://recharts.org/)                             |
| **Database**     | [MongoDB](https://www.mongodb.com/) (via native driver)       |
| **Auth**         | [NextAuth.js v5 (Auth.js)](https://authjs.dev/) — JWT sessions |
| **Date Utility** | [Day.js](https://day.js.org/)                                 |

---

## Folder Structure

```
messcheck/
│
├── app/                        # 🟢 Next.js App Router (all routes live here)
│   ├── layout.tsx              #    Root layout — fonts, global CSS, wraps ReviewPage
│   ├── page.tsx                #    Home / Dashboard page (Today's Menu, Charts)
│   ├── globals.css             #    Global Tailwind CSS styles
│   ├── favicon.ico             #    Site favicon
│   │
│   ├── api/                    # 🔵 Backend API routes
│   │   └── reviews/
│   │       └── route.js        #      GET /api/reviews — fetches reviews from MongoDB
│   │
│   ├── components/             # 🟡 App-level shared components
│   │   └── ReviewPage.tsx       #      Sidebar + Header shell (wraps all pages except auth)
│   │
│   ├── lib/                    # 🟠 App-level utilities & DB connection
│   │   └── mongodb.js          #      MongoDB client singleton (connection pooling)
│   │
│   ├── login/                  # 🔴 Login page
│   │   └── page.tsx            #      Email/password + Google OAuth login UI
│   │
│   └── reviews/                # 🟣 Reviews page
│       └── page.tsx            #      Displays student reviews fetched from API
│
├── components/                 # 🟢 Reusable UI primitives (shadcn/ui)
│   └── ui/
│       └── button.tsx          #      Button component (shadcn)
│
├── lib/                        # 🟠 Root-level shared utilities
│   └── utils.ts                #      cn() helper — merges Tailwind classes
│
├── public/                     # 📁 Static assets (served at /)
│   ├── breakfast.png           #      Meal images used in Today's Menu cards
│   ├── lunch.png
│   ├── snacks.png
│   ├── dinner.png
│   ├── next.svg
│   ├── vercel.svg
│   ├── file.svg
│   ├── globe.svg
│   └── window.svg
│
├── auth.ts                     # 🔐 NextAuth.js config (providers, adapter, callbacks)
├── .env                        # 🔒 Environment variables (never commit secrets!)
├── .gitignore
├── components.json             # ⚙️  shadcn/ui configuration
├── eslint.config.mjs           # ⚙️  ESLint config
├── next.config.ts              # ⚙️  Next.js config
├── postcss.config.mjs          # ⚙️  PostCSS config (Tailwind)
├── tsconfig.json               # ⚙️  TypeScript config
├── package.json                # 📦 Dependencies & scripts
└── README.md                   # 📖 Project readme
```

---

## Architecture Diagram

```
┌──────────────────────────────────────────────────┐
│                    BROWSER                        │
│                                                   │
│  ┌─────────┐  ┌──────────┐  ┌────────────────┐  │
│  │ Login   │  │Dashboard │  │ Reviews Page   │  │
│  │ Page    │  │ (Home)   │  │                │  │
│  └────┬────┘  └────┬─────┘  └───────┬────────┘  │
│       │            │                │            │
│       └────────────┼────────────────┘            │
│                    │                              │
│            ┌───────▼────────┐                    │
│            │  ReviewPage    │                    │
│            │  (Sidebar +    │                    │
│            │   Header)      │                    │
│            └───────┬────────┘                    │
└────────────────────┼─────────────────────────────┘
                     │
          ┌──────────▼──────────┐
          │   Next.js Server    │
          │   (App Router)      │
          │                     │
          │  ┌───────────────┐  │
          │  │ API Routes    │  │
          │  │ /api/reviews  │  │
          │  └───────┬───────┘  │
          │          │          │
          │  ┌───────▼───────┐  │
          │  │  auth.ts      │  │
          │  │  (NextAuth)   │  │
          │  └───────┬───────┘  │
          └──────────┼──────────┘
                     │
          ┌──────────▼──────────┐
          │     MongoDB         │
          │  ┌───────────────┐  │
          │  │ "messcheck"   │  │
          │  │  └── users    │  │
          │  │  └── reviews  │  │
          │  │  └── accounts │  │
          │  │  └── sessions │  │
          │  └───────────────┘  │
          └─────────────────────┘
```

---

## Key Files Explained

### `auth.ts`
The central authentication configuration. Sets up:
- **Google OAuth** provider
- **Credentials** provider (email + password with bcrypt hashing)
- **MongoDB Adapter** for storing users/accounts/sessions
- **JWT session strategy** (required when using Credentials provider)
- Custom callbacks for injecting `user.id` into JWT and session

### `app/layout.tsx`
Root layout that:
- Loads Google Fonts (Inter, Geist, Geist Mono)
- Imports global CSS
- Wraps all pages inside `<ReviewPage>`

### `app/components/ReviewPage.tsx`
The main shell component with:
- **Left sidebar** — navigation links (Dashboard, Today's Menu, Analytics, Reviews, etc.)
- **Top header** — search bar, notifications bell, user avatar
- **Auth route exclusion** — `/login` and `/signup` render without the sidebar

### `app/lib/mongodb.js`
MongoDB client singleton that:
- Reuses the connection in development (avoids hot-reload connection leaks)
- Creates a fresh connection in production

### `app/api/reviews/route.js`
REST API endpoint:
- `GET /api/reviews` — returns all reviews from the `reviews` collection

---

## Data Flow

```
1. User visits /reviews
2. ReviewsPage (client component) calls fetch("/api/reviews")
3. API route connects to MongoDB via clientPromise
4. MongoDB returns documents from the "reviews" collection
5. API route sends JSON response
6. ReviewsPage renders the review cards
```

---

## Authentication

NextAuth.js v5 handles all auth:

| Method         | Flow                                                          |
| -------------- | ------------------------------------------------------------- |
| **Google**     | OAuth → MongoDB adapter stores user in `users` collection     |
| **Credentials**| Email + password → bcrypt compare → JWT issued                |

- Sessions use **JWT strategy** (no server-side sessions)
- Custom sign-in page at `/login`
- Auth config lives in the root `auth.ts` file

---

## Environment Variables

Create a `.env` file in the project root:

```env
# MongoDB connection string
MONGODB_URI="mongodb://localhost:27017"

# NextAuth secret (generate with: openssl rand -hex 32)
AUTH_SECRET=your_secret_here

# Google OAuth (get from Google Cloud Console)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

> ⚠️ **Never commit `.env` to git.** It's already in `.gitignore`.

---

## Getting Started

```bash
# 1. Clone the repo
git clone https://github.com/SwarnabhG07/messcheck.git
cd messcheck

# 2. Install dependencies
npm install

# 3. Set up environment variables
#    Copy .env.example (or create .env) and fill in your values

# 4. Start MongoDB locally
#    Make sure MongoDB is running on localhost:27017

# 5. Run the dev server
npm run dev

# 6. Open in browser
#    http://localhost:3000
```

---

## Conventions & Best Practices

### File Naming
- **Pages**: `page.tsx` inside route folders (Next.js App Router convention)
- **Components**: PascalCase (e.g., `ReviewPage.tsx`)
- **Utilities / Libs**: camelCase (e.g., `mongodb.js`, `utils.ts`)
- **API routes**: `route.js` or `route.ts` inside `app/api/` folders

### Component Organization
| Location                  | What goes here                                      |
| ------------------------- | --------------------------------------------------- |
| `app/components/`         | App-specific shared components (layout, nav, etc.)  |
| `components/ui/`          | Reusable UI primitives from shadcn/ui               |
| `app/<route>/page.tsx`    | Page-level components tied to a route               |

### Styling
- Use **Tailwind CSS** utility classes
- Use the `cn()` helper from `lib/utils.ts` for conditional class merging
- Follow shadcn/ui patterns for new UI components

### Data Fetching
- Use **API routes** (`app/api/`) for server-side data operations
- Client components fetch via `fetch("/api/...")` in `useEffect`

### TypeScript
- Prefer TypeScript (`.tsx`, `.ts`) for all new files
- Define interfaces for data shapes (see the `Review` interface in `app/reviews/page.tsx`)

---

## Adding a New Feature

Here's a step-by-step guide to add a new page/feature:

### 1. Create the Route
```
app/
└── your-feature/
    └── page.tsx        ← your new page
```

### 2. Add Navigation
Update the `menuItems` array in `app/components/ReviewPage.tsx`:
```tsx
{ name: "Your Feature", icon: SomeIcon, href: "/your-feature" },
```

### 3. Add an API Route (if needed)
```
app/
└── api/
    └── your-feature/
        └── route.ts    ← GET, POST, etc.
```

### 4. Add Reusable Components
- **App-specific** → `app/components/YourComponent.tsx`
- **Generic UI** → `components/ui/your-component.tsx` (follow shadcn patterns)

### 5. Add Static Assets
Place images, icons, etc. in the `public/` folder and reference them as `/filename.ext`.

---

## Questions?

If you have questions about the codebase or want to discuss a new feature, open an issue on the repo or reach out to the maintainers.

Happy contributing! 🚀
