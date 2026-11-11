# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Individual developers keeping a personal vault of code they reuse: the SQL query they rewrite every quarter, a config block, a shell one-liner, a helper function. They are mid-task, often with an editor and terminal open, and want to drop a snippet in or pull one out in seconds and get back to work.

## Product Purpose

Snippi is a private, per-account library for code snippets. A developer saves a titled snippet in one of 19 languages, views it with syntax highlighting, copies it, edits it, or deletes it. Success means the snippet they need is found and copied faster than searching old projects or chat history.

## Positioning

A personal vault, not a social product. Every snippet is scoped to its owner and private by default; the owner can share one with specific registered users (view or edit). There is no public feed. The product is small on purpose: save, find, copy.

## Operating Context

- Used alongside an IDE and terminal, often on a laptop, during focused work.
- Core loop: sign in → dashboard library → open a snippet → copy; or → new snippet → paste → save.
- Code is viewed and edited in the Monaco editor (the VS Code editor component), so the code itself is the content of every screen.

## Capabilities and Constraints

- Next.js 15 App Router, React 19, Tailwind CSS 3, Prisma + PostgreSQL (Neon), JWT session cookies (jose), bcrypt.
- Routes: `/` (landing, logged out), `/login`, `/register`, `/dashboard`, `/snippet/new`, `/snippet/[id]`, `/snippet/[id]/edit`.
- Features: account register/login/logout; snippet create/read/update/delete; 19 languages; grid/list view toggle; copy to clipboard; share a snippet with registered users by email (View or Edit; owner-only delete and access management); Library tabs for My snippets / Shared with me / Shared by me.
- The schema already holds `description`, `visibility` (PRIVATE/PUBLIC), tags, user `bio` and `avatarUrl`, but none are exposed in the UI yet. Search is not implemented.

## Brand Commitments

- Name: **Snippi**. Keep it.
- Light and dark themes, user-toggleable, both first-class.
- Motion runs on GSAP and Lenis (already installed); no new animation libraries.
- Monaco stays as the code editor and viewer.
- Standing preference (chosen 2026-11-10): the developer-tool category standard, executed boldly. It should sit beside Linear, Raycast, Warp and Zed at their craft level, with poster-scale type, substantial motion and a live product demo, not a themed or metaphorical world.

## Evidence on Hand

No testimonials, customers, usage numbers, press or logos exist. None may be invented. Demonstration snippets on the landing page are illustrative code, not claims.

## Product Principles

1. The code is the hero; chrome stays out of its way.
2. Fast in, fast out: every screen serves save, find, or copy.
3. Private by default, and the interface says so plainly.
4. Promise only what is built.
