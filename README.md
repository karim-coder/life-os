# Life OS — Your Digital Brain

A comprehensive, open-source personal operating system that brings harmony, focus, and connection to every aspect of your life. Built with Next.js 16, TypeScript, Tailwind CSS, and Prisma.

## Screenshots

| Public landing page                                                              | Dashboard                                                                 |
| -------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| <img src="./public/screenshots/landing.jpg" alt="Life OS public landing page" /> | <img src="./public/screenshots/dashboard.jpeg" alt="Life OS dashboard" /> |

| Digital Brain graph                                                                   | Insights                                                                    |
| ------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| <img src="./public/screenshots/brain-graph.jpeg" alt="Life OS digital brain graph" /> | <img src="./public/screenshots/insight.jpeg" alt="Life OS insights view" /> |

## ✨ Features

### The Digital Brain

Everything is an interconnected "node" — tasks, notes, journals, habits, finances, contacts, ideas, goals, and more. Bi-directional linking means your data comes alive.

- **17 item types** with type-aware UI (tasks, journals, habits, finances, contacts, books, movies, etc.)
- **Bi-directional linking** — connect any item to any other item
- **Brain Graph** — visual force-directed network of your interconnected life
- **8 life domains** — Mind & Soul, Time & Action, Health, Wealth, Network, Growth, Creativity, Admin

### Master Calendar

One calendar that auto-aggregates anything with a date — tasks, bills, appointments, birthdays. Toggle layers to view your life through different lenses.

### Quick Capture (⌘K)

Capture a thought instantly without deciding where it belongs. Process your inbox later with bulk actions or AI-powered Smart Inbox Processing.

### Focus Timer

Pomodoro timer with custom durations, sound on completion, and automatic habit logging. Connect a focus session to a habit like "Read 20 pages" and it auto-logs when the timer ends.

### Rich Journal Editor

Full-page WYSIWYG editor with formatting toolbar, live word count, mood tracking, and auto-save drafts. Your thoughts deserve more than a text box.

### Reviews & Reflections

Daily and weekly guided reflections with mood/energy tracking, wins, challenges, gratitude, and priorities. The dashboard gently prompts you when it's time to reflect.

### Insights Dashboard

Mood trends, habit consistency heatmaps, 30-day activity flow, financial health, and project progress — all visualized.

### Sanctuary

A calm space for guided breathing exercises, daily affirmations, and life visions.

### Authentication

- Email/password registration and login
- Optional 2FA (TOTP) — off by default, toggle in Settings
- QR code login — sign in on another device by scanning a QR code from Settings
- Protected routes via middleware

### AI Features (Optional)

- **Smart Inbox Processing** — AI suggests type, domain, and project for inbox items
- Configurable AI provider: Z.AI SDK (default, free), OpenAI-compatible (OpenAI, Groq, Together, etc.), or custom endpoint
- Can be turned on/off in Settings

### PWA Support

Installable on desktop and mobile. Works as a standalone app.

### More

- Keyboard shortcuts (⌘K capture, ⌘P command palette, g+key Vim navigation, ? for help)
- Browser notifications for overdue tasks
- Onboarding flow for new users
- Full data backup/restore (JSON export/import)
- CSV export for finances, reviews, and all items
- Recurring task automation (advances due dates, resets stale streaks)
- Dark mode with system theme detection

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ or Bun
- A database (SQLite by default, PostgreSQL optional)

### Installation

```bash
# Clone the repository
git clone https://github.com/karim-coder/life-os.git
cd life-os

# Install dependencies
bun install

# Set up the database
cp .env.example .env
bun run db:push

# Optional: add sample data
bun run src/lib/seed.ts

# Start the development server
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) and create an account.

### Using a Cloud Database (Neon / Supabase)

1. Create a free PostgreSQL database on [Neon](https://neon.tech) or [Supabase](https://supabase.com)
2. Update your `.env` file:
   ```env
   DATABASE_URL=postgresql://user:pass@host/dbname
   ```
3. Update `prisma/schema.prisma` — change the provider from `sqlite` to `postgresql`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
4. Run `bun run db:push`

## 📖 Documentation

### Architecture

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4 + shadcn/ui
- **Database**: Prisma ORM (SQLite or PostgreSQL)
- **State**: Zustand (client) + TanStack Query (server)
- **Auth**: Custom session-based with optional TOTP 2FA
- **AI**: Z.AI SDK (default) or any OpenAI-compatible API

### Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/                # API routes (items, projects, auth, ai, etc.)
│   ├── app/                # Authenticated Life OS interface
│   ├── login/              # Authentication page
│   └── page.tsx            # Public landing page
├── components/
│   ├── life-os/            # Core app components
│   │   ├── views/          # Dashboard, Inbox, Calendar, Focus, etc.
│   │   ├── item-card.tsx   # Universal item card
│   │   ├── item-editor.tsx # Create/edit dialog
│   │   └── ...
│   └── ui/                 # shadcn/ui components
├── lib/                    # Utilities, hooks, auth, constants
├── store/                  # Zustand store
└── prisma/                 # Database schema
```

### Keyboard Shortcuts

| Shortcut     | Action          |
| ------------ | --------------- |
| `⌘K`         | Quick Capture   |
| `⌘P`         | Command Palette |
| `/`          | Focus search    |
| `?`          | Show shortcuts  |
| `g` then `d` | Dashboard       |
| `g` then `i` | Inbox           |
| `g` then `c` | Calendar        |
| `g` then `f` | Focus           |
| `g` then `p` | Projects        |
| `g` then `g` | Brain Graph     |
| `g` then `r` | Reviews         |
| `g` then `s` | Insights        |
| `g` then `n` | Sanctuary       |

## 🐳 Docker

```bash
# Build and run
docker-compose up -d

# Or build manually
docker build -t life-os .
docker run -p 3000:3000 -v $(pwd)/db:/app/db life-os
```

## 🔧 Configuration

### Environment Variables

See [`.env.example`](.env.example) for all available options.

### AI Provider Setup

1. Go to Settings → AI Features
2. Choose your provider:
   - **Z.AI SDK** — free, no config needed
   - **OpenAI-compatible** — enter API key, base URL, and model
   - **Custom** — enter custom endpoint details
3. Toggle individual AI features on/off

## 🤝 Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) and follow the [Code of Conduct](CODE_OF_CONDUCT.md).

## 📄 License

This project is licensed under the MIT License — see [LICENSE](LICENSE) for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org) — React framework
- [shadcn/ui](https://ui.shadcn.com) — UI components
- [Prisma](https://prisma.io) — Database ORM
- [MDXEditor](https://mdxeditor.dev) — WYSIWYG editor
- [Framer Motion](https://framer.com/motion) — Animations
- [Z.AI](https://z.ai) — AI SDK

---

Made with 💚 for people who want to live with intention.
