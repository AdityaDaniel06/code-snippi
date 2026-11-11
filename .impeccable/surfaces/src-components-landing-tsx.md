---
version: 1
slug: "src-components-landing-tsx"
primary_target: "src/components/landing.tsx"
related_targets: ["src/app/dashboard/page.tsx","src/app/snippet/[id]/page.tsx","src/components/auth-form.tsx"]
---

## Scope

Whole app redesign. Landing (`/`) is Persuade; login/register, dashboard, snippet view, editor, 404 and loading are Operate and share the same world in restrained form.

Audience: individual developers mid-task. Action: create an account (landing); save, find, copy (app).

## Direction contract

THESIS: Snippi owns "find it in a keystroke": the product itself, working, is the hero. It refuses the AI dev-tool default of a violet/cyan gradient, aurora blobs, glass cards, an eyebrow pill and three icon cards.

OWN-WORLD: Neutral graphite (#0b0b0c dark, #f5f5f6 light), surfaces separated by tone steps, never by glow or gradient. One signal-orange accent (#ff5a1f) only on the primary action, selection and focus. Geist set at poster scale (tracking -0.04em) for display; Geist Mono only inside code. Square-ish 6px corners on controls, 10px on panels. Language shown as a small solid swatch plus its name.

STORY: The visitor sees the problem named, tries the real search on demo snippets, watches a snippet get saved, sees all 19 languages, learns it's private, then signs up.

FIRST VIEWPORT: A left-aligned two-line headline at about 8vw ("Stop rewriting the same code."), one supporting sentence and the orange "Create your library" button with "Sign in" beside it. Below, filling the width and crossing the fold, is a live Snippi window: search field, snippet list and a highlighted code pane, with copy that works. It tilts back in perspective and flattens as you scroll.

FORM: Category standard (canon), bold register; benchmarks Linear, Raycast, Warp, Zed. seed:d7312772e63c27fa. Signature interaction: typing in the hero search filters the list live and the code pane swaps with a masked slide. Motion grammar: a masked line-rise for headlines, the perspective flattening on the hero window, scroll-scrubbed typing in the save section, a scroll-scrubbed horizontal wall of languages; the app uses 150–220ms state transitions only.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
