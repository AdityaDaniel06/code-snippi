import type { Monaco } from "@monaco-editor/react";
import type { HighlighterCore, ThemeRegistrationRaw } from "shiki/core";
import { textmateThemeToMonacoTheme } from "@shikijs/monaco";
import { EncodedTokenMetadata, INITIAL, type StateStack } from "@shikijs/vscode-textmate";
import { SNIPPI_DARK_COLORS, SNIPPI_LIGHT_COLORS } from "@/lib/monaco-theme";

/**
 * VS Code-grade highlighting for Monaco.
 *
 * Monaco's built-in (Monarch) tokenizers are coarse: function calls,
 * parameters, properties and variables all come out as one "identifier"
 * token. Shiki runs VS Code's own TextMate grammars, so code is coloured the
 * way it is in VS Code (Dark+ / Light+), framed in Snippi's editor colours.
 *
 * Grammars are large (C++ alone is ~500 KB), so each one is fetched the first
 * time a snippet in that language is shown, never all up front.
 */

type Grammar = () => Promise<unknown>;

/** The parts of a Monaco theme this file reads. */
type MonacoTheme = { rules: { token: string; foreground?: string; fontStyle?: string }[] };

// TextMate font-style bits (a const enum upstream, so not importable here).
const ITALIC = 1;
const BOLD = 2;
const UNDERLINE = 4;
const STRIKETHROUGH = 8;

/** Monaco language id -> Shiki grammar. Plain text has no grammar. */
const GRAMMARS: Record<string, Grammar> = {
  javascript: () => import("shiki/langs/javascript.mjs"),
  typescript: () => import("shiki/langs/typescript.mjs"),
  python: () => import("shiki/langs/python.mjs"),
  sql: () => import("shiki/langs/sql.mjs"),
  json: () => import("shiki/langs/json.mjs"),
  html: () => import("shiki/langs/html.mjs"),
  css: () => import("shiki/langs/css.mjs"),
  java: () => import("shiki/langs/java.mjs"),
  csharp: () => import("shiki/langs/csharp.mjs"),
  cpp: () => import("shiki/langs/cpp.mjs"),
  go: () => import("shiki/langs/go.mjs"),
  rust: () => import("shiki/langs/rust.mjs"),
  php: () => import("shiki/langs/php.mjs"),
  ruby: () => import("shiki/langs/ruby.mjs"),
  shell: () => import("shiki/langs/shellscript.mjs"),
  yaml: () => import("shiki/langs/yaml.mjs"),
  markdown: () => import("shiki/langs/markdown.mjs"),
  xml: () => import("shiki/langs/xml.mjs"),
};

const THEME_NAMES = { dark: "snippi-dark", light: "snippi-light" } as const;

let ready: Promise<HighlighterCore> | null = null;
const languages = new Map<string, Promise<void>>();

// Shared tokenizer state: the active theme's colour table, and a lookup from
// colour+style back to a scope Monaco's theme has a rule for.
const colorMap: string[] = [];
const scopeByStyle = new Map<string, string>();
const monacoThemes = new Map<string, MonacoTheme>();

function normalizeColor(color: string | string[] | undefined) {
  if (Array.isArray(color)) color = color[0];
  if (!color) return undefined;
  color = (color.startsWith("#") ? color.slice(1) : color).toLowerCase();
  if (color.length === 3 || color.length === 4) color = [...color].map((c) => c + c).join("");
  return color;
}

function fontStyleFromBits(bits: number) {
  if (bits <= 0) return "";
  const out: string[] = [];
  if (bits & ITALIC) out.push("italic");
  if (bits & BOLD) out.push("bold");
  if (bits & UNDERLINE) out.push("underline");
  if (bits & STRIKETHROUGH) out.push("strikethrough");
  return out.join(" ");
}

function fontStyleFromString(style: string | undefined) {
  if (!style) return "";
  const set = new Set(style.split(/[\s,]+/).map((s) => s.trim().toLowerCase()));
  return ["italic", "bold", "underline", "strikethrough"].filter((s) => set.has(s)).join(" ");
}

const styleKey = (color: string, fontStyle: string) => (fontStyle ? `${color}|${fontStyle}` : color);

/** Load the themes and route Monaco's setTheme through Shiki. Runs once. */
function init(monaco: Monaco): Promise<HighlighterCore> {
  if (ready) return ready;
  ready = (async () => {
    const [{ createHighlighterCore }, { createJavaScriptRegexEngine }, darkPlus, lightPlus] =
      await Promise.all([
        import("shiki/core"),
        import("shiki/engine/javascript"),
        import("shiki/themes/dark-plus.mjs"),
        import("shiki/themes/light-plus.mjs"),
      ]);

    const frame = (
      base: ThemeRegistrationRaw,
      name: string,
      colors: Record<string, string>
    ): ThemeRegistrationRaw => ({ ...base, name, colors: { ...base.colors, ...colors } });

    const highlighter = await createHighlighterCore({
      // Pure JS regex engine: no WASM to fetch, works in every browser.
      engine: createJavaScriptRegexEngine(),
      themes: [
        frame(darkPlus.default as ThemeRegistrationRaw, THEME_NAMES.dark, SNIPPI_DARK_COLORS),
        frame(lightPlus.default as ThemeRegistrationRaw, THEME_NAMES.light, SNIPPI_LIGHT_COLORS),
      ],
      langs: [],
    });

    for (const id of highlighter.getLoadedThemes()) {
      const theme = textmateThemeToMonacoTheme(highlighter.getTheme(id));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Monaco types come from the CDN build
      monaco.editor.defineTheme(id, theme as any);
      monacoThemes.set(id, theme as unknown as MonacoTheme);
    }

    const setTheme = monaco.editor.setTheme.bind(monaco.editor);
    monaco.editor.setTheme = (name: string) => {
      const theme = monacoThemes.get(name);
      if (theme) {
        const { colorMap: next } = highlighter.setTheme(name);
        colorMap.length = 0;
        colorMap.push(...next);
        scopeByStyle.clear();
        for (const rule of theme.rules) {
          const c = normalizeColor(rule.foreground);
          if (!c) continue;
          const key = styleKey(c, fontStyleFromString(rule.fontStyle));
          if (!scopeByStyle.has(key)) scopeByStyle.set(key, rule.token);
        }
      }
      setTheme(name);
    };

    return highlighter;
  })();
  ready.catch(() => {
    ready = null; // let a later mount retry after a failed chunk load
  });
  return ready;
}

class LineState {
  constructor(readonly stack: StateStack) {}
  clone() {
    return new LineState(this.stack);
  }
  equals(other: LineState) {
    return other instanceof LineState && other.stack === this.stack;
  }
}

/** Fetch one language's grammar and hand Monaco a tokenizer for it. */
function ensureLanguage(monaco: Monaco, highlighter: HighlighterCore, lang: string) {
  const grammar = GRAMMARS[lang];
  if (!grammar) return Promise.resolve();
  let pending = languages.get(lang);
  if (pending) return pending;

  pending = (async () => {
    const mod = (await grammar()) as { default: Parameters<HighlighterCore["loadLanguage"]>[0] };
    await highlighter.loadLanguage(mod.default);
    const grammarFor = highlighter.getLanguage(lang);

    monaco.languages.setTokensProvider(lang, {
      getInitialState: () => new LineState(INITIAL),
      tokenize(line: string, state: LineState) {
        if (line.length >= 20_000) {
          return { endState: state, tokens: [{ startIndex: 0, scopes: "" }] };
        }
        const result = grammarFor.tokenizeLine2(line, state.stack, 500);
        const tokens = [];
        for (let i = 0; i < result.tokens.length; i += 2) {
          const meta = result.tokens[i + 1];
          const color = normalizeColor(colorMap[EncodedTokenMetadata.getForeground(meta)]);
          const scope = color
            ? scopeByStyle.get(styleKey(color, fontStyleFromBits(EncodedTokenMetadata.getFontStyle(meta)))) ?? ""
            : "";
          tokens.push({ startIndex: result.tokens[i], scopes: scope });
        }
        return { endState: new LineState(result.ruleStack), tokens };
      },
    });
  })();
  pending.catch(() => languages.delete(lang));
  languages.set(lang, pending);
  return pending;
}

/**
 * Switch an editor to VS Code highlighting for `lang`. Until the grammar
 * arrives the editor keeps Monaco's own colouring, so nothing renders blank.
 * Safe to call on every mount and every language change.
 */
export async function applyShikiHighlighting(monaco: Monaco, lang: string) {
  try {
    const highlighter = await init(monaco);
    await ensureLanguage(monaco, highlighter, lang);
    // Read the theme now, not at call time: it may have flipped while loading.
    const theme = document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
    monaco.editor.setTheme(THEME_NAMES[theme]);
  } catch (err) {
    console.warn("VS Code highlighting unavailable, using Monaco's built-in colours.", err);
  }
}
