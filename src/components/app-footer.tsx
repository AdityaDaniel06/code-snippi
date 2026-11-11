import { LANGUAGES } from "@/lib/languages";

/**
 * Footer for signed-in app screens (library, snippet, editor, 404). The
 * landing page has its own poster footer.
 *
 * Colour comes from the system's own vocabulary: a strip made of every
 * language's identity swatch (the landing page's language wall, compressed to
 * a seam) on a tone-step surface. Brand and navigation live in the header.
 */
export default function AppFooter() {
  return (
    <footer className="bg-surface-1">
      <div className="flex h-1" aria-hidden>
        {LANGUAGES.map((l) => (
          <span key={l.id} className="flex-1" style={{ background: l.color }} />
        ))}
      </div>

      <div className="container-app py-7">
        <div className="flex flex-col gap-4 text-sm text-ink-2 md:flex-row md:items-center md:justify-between">
          <p className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
            <span className="flex items-center gap-1" aria-hidden>
              {LANGUAGES.slice(1, 7).map((l) => (
                <span key={l.id} className="swatch" style={{ background: l.color }} />
              ))}
            </span>
            {LANGUAGES.length} languages, highlighted the way VS Code does.
            <span className="text-ink-3" aria-hidden>
              ·
            </span>
            Private unless you share.
          </p>

          {/* Keyboard hints only make sense where there is a keyboard. */}
          <ul
            aria-label="Keyboard shortcuts"
            className="hidden items-center gap-5 text-ink-2 [@media(hover:hover)]:flex"
          >
            <li className="flex items-center gap-1.5">
              <kbd className="kbd">/</kbd>
              Search library
            </li>
            <li className="flex items-center gap-1.5">
              <kbd className="kbd">Ctrl</kbd>
              <kbd className="kbd">S</kbd>
              Save snippet
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
