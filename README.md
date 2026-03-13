<p align="center">
  <h1 align="center">Social Saver Pro</h1>
  <p align="center">
    Save, categorize, and act on your Twitter/X bookmarks with AI
  </p>
</p>

<p align="center">
  <a href="https://social-saver-dashboard.vercel.app">Live Dashboard</a> ·
  <a href="#chrome-extension">Chrome Extension</a> ·
  <a href="#edge-function">Edge Function</a>
</p>

---

## What It Does

Social Saver Pro is a three-part system that turns your Twitter/X bookmarks into an organized, actionable knowledge base:

1. **Chrome Extension** — One-click save from any tweet, thread, or article on X. Nightly auto-sync pulls all your bookmarks.
2. **AI Categorization** — A Supabase Edge Function classifies each bookmark into categories, extracts key insights, and generates action items using Gemini Flash (with Claude Haiku as fallback).
3. **Dashboard** — A Next.js web app to search, filter, and act on your saved bookmarks.

## Dashboard

| Feature | Description |
|---------|-------------|
| **Card Grid** | Responsive 3-column layout with type icons, color-coded category badges, and inline action checkboxes |
| **Search** | Full-text search across titles, content, and authors with 300ms debounce |
| **Filters** | Filter by type (tweet/thread/article), category, and action status |
| **Action Items** | Dedicated checklist view with "Mark all done" batch operation |
| **Stats Bar** | Total bookmarks, type breakdown, pending actions, top category |
| **Expand View** | Full text, images, key insights with accent border, skip/done/pending toggles |

### Category Colors

| Category | Color |
|----------|-------|
| AI/ML & Tech | 🟢 Emerald |
| Trading & Finance | 🟡 Amber |
| AI Project Ideas | 🟣 Violet |
| Career & Productivity | 🩷 Pink |
| Other | ⚪ Gray |

## Tech Stack

- **Frontend** — Next.js 14, React 18, TypeScript, Tailwind CSS
- **Database** — Supabase (PostgreSQL + Row Level Security)
- **AI** — Gemini 2.0 Flash (primary), Claude Haiku (fallback)
- **Edge Function** — Supabase Edge Functions (Deno runtime)
- **Hosting** — Vercel
- **Extension** — Chrome Manifest V3

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project
- Gemini API key ([Google AI Studio](https://aistudio.google.com/apikey))
- Anthropic API key (optional fallback)

### 1. Clone and Install

```bash
git clone https://github.com/arunkumar3/social-saver-dashboard.git
cd social-saver-dashboard
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env.local
```

Fill in your Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Set Up Database

Run the schema from the Chrome extension repo:

```sql
-- See social-saver-pro-v2/social-saver-v2/supabase-schema.sql
-- Creates the bookmarks table with full-text search indexes
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 5. Deploy to Vercel

```bash
vercel --prod
```

Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` as environment variables in Vercel.

## Edge Function

The `process-bookmark` Edge Function handles AI categorization.

### Deploy

```bash
npx supabase link --project-ref your-project-ref
npx supabase secrets set GEMINI_API_KEY=xxx ANTHROPIC_API_KEY=xxx
npx supabase functions deploy process-bookmark --no-verify-jwt
```

### API

**Single bookmark:**
```bash
curl -X POST https://your-project.supabase.co/functions/v1/process-bookmark \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"bookmarkId": "uuid"}'
```

**Batch processing:**
```bash
curl -X POST https://your-project.supabase.co/functions/v1/process-bookmark \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"batch": true}'
```

Batch processes up to 50 bookmarks per call with 500ms delay between requests.

## Chrome Extension

The companion Chrome extension lives in a [separate repo](https://github.com/arunkumar3/social-saver-pro-v2).

**Features:**
- One-click save button on tweets, threads, and articles
- Auto-triggers AI categorization after each save
- Nightly bookmark sync with scroll-based extraction
- Settings popup for Supabase credential management

## Project Structure

```
social-saver-dashboard/
├── src/
│   ├── app/                  # Next.js app router
│   ├── components/
│   │   ├── DashboardShell    # Main state management
│   │   ├── BookmarkCard      # Card with expand/collapse
│   │   ├── BookmarkGrid      # Responsive grid layout
│   │   ├── ActionItemsView   # Checklist view
│   │   ├── FilterSidebar     # Type/category/status filters
│   │   ├── SearchBar         # Debounced search + view toggle
│   │   └── StatsBar          # Aggregate statistics
│   └── lib/
│       ├── supabase.ts       # Supabase client
│       ├── types.ts          # TypeScript interfaces
│       └── utils.ts          # Formatting + color utilities
├── supabase/
│   └── functions/
│       └── process-bookmark/ # AI categorization Edge Function
│           ├── index.ts      # Handler, AI calls, DB operations
│           └── prompt.ts     # Prompt template
└── .env.example
```

## License

MIT
