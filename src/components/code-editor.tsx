"use client";

import { useEffect, useRef, useState } from "react";
import Editor, { type Monaco, type OnMount } from "@monaco-editor/react";
import { LANGUAGES, getLanguage } from "@/lib/languages";
import { useTheme } from "@/hooks/use-theme";
import { defineSnippiThemes, snippiThemeName } from "@/lib/monaco-theme";
import { applyShikiHighlighting } from "@/lib/monaco-shiki";
import { CodeSkeleton } from "@/components/code-viewer";

interface CodeEditorProps {
  defaultLanguage?: string;
  defaultValue?: string;
  /** Called on Ctrl/Cmd+S inside the editor */
  onSave?: () => void;
  /** Rendered beside the language picker (the title field) */
  titleSlot?: React.ReactNode;
}

export default function CodeEditor({
  defaultLanguage = "plaintext",
  defaultValue = "",
  onSave,
  titleSlot,
}: CodeEditorProps) {
  const [language, setLanguage] = useState(defaultLanguage);
  const [code, setCode] = useState(defaultValue);
  const { theme } = useTheme();
  const onSaveRef = useRef(onSave);
  const lang = getLanguage(language);

  const [monaco, setMonaco] = useState<Monaco | null>(null);

  useEffect(() => {
    onSaveRef.current = onSave;
  }, [onSave]);

  // VS Code highlighting for the picked language; its grammar loads on first use.
  useEffect(() => {
    if (monaco) applyShikiHighlighting(monaco, language);
  }, [monaco, language]);

  const handleMount: OnMount = (editor, monacoInstance) => {
    editor.addCommand(monacoInstance.KeyMod.CtrlCmd | monacoInstance.KeyCode.KeyS, () => onSaveRef.current?.());
    setMonaco(monacoInstance);
    if (!defaultValue) editor.focus();
  };

  const lineCount = code ? code.split("\n").length : 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Hidden inputs carry values into the server action's FormData */}
      <input type="hidden" name="language" value={language} />
      <input type="hidden" name="code" value={code} />

      <div className="grid gap-4 sm:grid-cols-[1fr_220px]">
        {titleSlot}
        <div>
          <label className="label" htmlFor="language-select">
            Language
          </label>
          <div className="relative">
            <span
              className="swatch pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2"
              style={{ background: lang.color }}
            />
            <select
              id="language-select"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="field cursor-pointer appearance-none pl-8 pr-9"
            >
              {LANGUAGES.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.label}
                </option>
              ))}
            </select>
            <svg
              viewBox="0 0 24 24"
              className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              aria-hidden
            >
              <path d="m7 10 5 5 5-5" />
            </svg>
          </div>
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-baseline justify-between">
          <span className="label !mb-0" id="code-label">
            Code
          </span>
          <span className="tabular text-xs text-ink-3">
            {lineCount} {lineCount === 1 ? "line" : "lines"}
          </span>
        </div>
        <div
          className="overflow-hidden rounded-xl border border-[var(--line-strong)] bg-[var(--code-bg)] transition-[border-color,box-shadow] duration-150 focus-within:border-[var(--accent)] focus-within:shadow-[0_0_0_3px_var(--accent-soft)]"
          data-lenis-prevent
          aria-labelledby="code-label"
        >
          <Editor
            height="min(60vh, 520px)"
            theme={snippiThemeName(theme)}
            beforeMount={defineSnippiThemes}
            onMount={handleMount}
            language={language}
            value={code}
            onChange={(value) => setCode(value ?? "")}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineHeight: 21,
              fontFamily: "var(--font-geist-mono), ui-monospace, monospace", // taste-skill-ignore: Monaco code font
              padding: { top: 16, bottom: 16 },
              scrollBeyondLastLine: false,
              smoothScrolling: true,
              automaticLayout: true,
              tabSize: 2,
              wordWrap: "on",
              overviewRulerLanes: 0,
              bracketPairColorization: { enabled: true },
              guides: { bracketPairs: "active", indentation: true },
              renderLineHighlight: "line",
              cursorBlinking: "smooth",
              cursorSmoothCaretAnimation: "on",
              scrollbar: { verticalScrollbarSize: 10, horizontalScrollbarSize: 10 },
            }}
            loading={<CodeSkeleton lines={10} />}
          />
        </div>
      </div>
    </div>
  );
}
