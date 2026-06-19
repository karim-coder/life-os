# Contributing to Life OS

Thank you for your interest in contributing! This document outlines how to get started.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/karim-coder/life-os.git`
3. Install dependencies: `bun install`
4. Set up the database: `cp .env.example .env && bun run db:push`
5. (Optional) Seed test data: `bun run src/lib/seed.ts`
6. Start dev server: `bun run dev`

## Development Workflow

1. Create a feature branch: `git checkout -b feature/my-feature`
2. Make your changes
3. Run linting: `bun run lint`
4. Commit with clear messages: `git commit -m "feat: add habit streak counter"`
5. Push to your fork: `git push origin feature/my-feature`
6. Open a Pull Request

## Commit Convention

We use conventional commits:
- `feat:` — New feature
- `fix:` — Bug fix
- `docs:` — Documentation
- `style:` — Formatting/style
- `refactor:` — Code refactoring
- `test:` — Tests
- `chore:` — Build/tooling

## Code Style

- TypeScript throughout with strict typing
- Use existing shadcn/ui components when possible
- Follow the existing file structure conventions
- Keep components focused and reusable
- Use Tailwind CSS classes (no inline styles except for dynamic values)

## Pull Request Guidelines

- Describe what your PR does and why
- Include screenshots for UI changes
- Ensure `bun run lint` passes
- Keep PRs focused — one feature/fix per PR

## Reporting Issues

Use GitHub Issues with the appropriate template (bug report or feature request).

## Code of Conduct

Be kind, respectful, and constructive. See [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).
