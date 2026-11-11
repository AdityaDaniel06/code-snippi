import type { Monaco } from "@monaco-editor/react";

/**
 * Snippi's editor chrome (background, gutter, cursor, selection). Monaco needs
 * literal hex values, so these mirror the CSS variables in globals.css. Shared
 * by the fallback themes below and the VS Code themes in monaco-shiki.ts.
 */
export const SNIPPI_DARK_COLORS: Record<string, string> = {
  "editor.background": "#0e0e10",
  "editor.foreground": "#d7d7dc",
  "editorLineNumber.foreground": "#4a4a52",
  "editorLineNumber.activeForeground": "#a3a3ab",
  "editor.lineHighlightBackground": "#16161a",
  "editor.lineHighlightBorder": "#00000000",
  "editor.selectionBackground": "#ff5a1f40",
  "editor.inactiveSelectionBackground": "#ff5a1f22",
  "editorCursor.foreground": "#ff5a1f",
  "editorIndentGuide.background1": "#1d1d21",
  "editorWidget.background": "#19191c",
  "editorWidget.border": "#2a2a2f",
  "scrollbarSlider.background": "#23232788",
  "scrollbarSlider.hoverBackground": "#2e2e33",
  focusBorder: "#00000000",
};

export const SNIPPI_LIGHT_COLORS: Record<string, string> = {
  "editor.background": "#f6f6f7",
  "editor.foreground": "#26262b",
  "editorLineNumber.foreground": "#b3b3ba",
  "editorLineNumber.activeForeground": "#55555d",
  "editor.lineHighlightBackground": "#efeff1",
  "editor.lineHighlightBorder": "#00000000",
  "editor.selectionBackground": "#f0501a33",
  "editorCursor.foreground": "#f0501a",
  "editorIndentGuide.background1": "#ececee",
  "scrollbarSlider.background": "#e2e2e588",
  focusBorder: "#00000000",
};

/**
 * Fallback themes for Monaco's built-in tokenizers, shown only until the
 * VS Code grammars load (see monaco-shiki.ts), which then replace them under
 * the same names.
 */
export function defineSnippiThemes(monaco: Monaco) {
  monaco.editor.defineTheme("snippi-dark", {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "comment", foreground: "6a9955" },
      { token: "keyword", foreground: "569cd6" },
      { token: "string", foreground: "ce9178" },
      { token: "number", foreground: "b5cea8" },
      { token: "type", foreground: "4ec9b0" },
    ],
    colors: SNIPPI_DARK_COLORS,
  });

  monaco.editor.defineTheme("snippi-light", {
    base: "vs",
    inherit: true,
    rules: [
      { token: "comment", foreground: "008000" },
      { token: "keyword", foreground: "0000ff" },
      { token: "string", foreground: "a31515" },
      { token: "number", foreground: "098658" },
      { token: "type", foreground: "267f99" },
    ],
    colors: SNIPPI_LIGHT_COLORS,
  });
}

export function snippiThemeName(theme: "light" | "dark") {
  return theme === "light" ? "snippi-light" : "snippi-dark";
}
