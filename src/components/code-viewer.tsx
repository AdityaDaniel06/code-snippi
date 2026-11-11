"use client";

import Editor from "@monaco-editor/react";
import { useTheme } from "@/hooks/use-theme";
import { defineSnippiThemes, snippiThemeName } from "@/lib/monaco-theme";
import { applyShikiHighlighting } from "@/lib/monaco-shiki";
import { getLanguage } from "@/lib/languages";

interface CodeViewerProps {
  code: string;
  language: string;
}

export default function CodeViewer({ code, language }: CodeViewerProps) {
  const { theme } = useTheme();
  const lang = getLanguage(language);
  const lineCount = code.split("\n").length;
  const height = Math.min(Math.max(lineCount * 21 + 40, 180), 680);

  return (
    <div
      className="overflow-hidden rounded-xl border border-[var(--line-strong)] bg-[var(--code-bg)] [box-shadow:var(--shadow-float)]"
      style={{ "--lang": lang.color } as React.CSSProperties}
    >
      <div className="lang-bar flex h-11 items-center gap-2 border-b border-[var(--line)] px-4 text-xs font-medium text-ink">
        <span className="swatch" style={{ background: lang.color }} />
        {lang.label}
      </div>
      <div data-lenis-prevent>
        <Editor
          height={`${height}px`}
          theme={snippiThemeName(theme)}
          beforeMount={defineSnippiThemes}
          onMount={(_editor, monaco) => applyShikiHighlighting(monaco, language)}
          language={language}
          value={code}
          options={{
            readOnly: true,
            domReadOnly: true,
            minimap: { enabled: false },
            fontSize: 14,
            lineHeight: 21,
            fontFamily: "var(--font-geist-mono), ui-monospace, monospace", // taste-skill-ignore: Monaco code font
            padding: { top: 16, bottom: 16 },
            scrollBeyondLastLine: false,
            lineNumbers: "on",
            automaticLayout: true,
            wordWrap: "on",
            contextmenu: false,
            renderLineHighlight: "none",
            overviewRulerLanes: 0,
            bracketPairColorization: { enabled: true },
            guides: { bracketPairs: "active", indentation: true },
            hideCursorInOverviewRuler: true,
            scrollbar: { verticalScrollbarSize: 10, horizontalScrollbarSize: 10 },
          }}
          loading={<CodeSkeleton lines={Math.min(lineCount, 12)} />}
        />
      </div>
    </div>
  );
}

export function CodeSkeleton({ lines = 8 }: { lines?: number }) {
  return (
    <div className="flex w-full flex-col gap-2.5 p-5" aria-label="Loading code">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="skeleton h-3" style={{ width: `${30 + ((i * 37) % 55)}%` }} />
      ))}
    </div>
  );
}
