export interface LanguageOption {
  /** Monaco language id */
  id: string;
  /** Human friendly label */
  label: string;
  /** Identity swatch colour, used only to tell languages apart */
  color: string;
}

export const LANGUAGES: LanguageOption[] = [
  { id: "plaintext", label: "Plain Text", color: "#8b8b94" },
  { id: "javascript", label: "JavaScript", color: "#e3b341" },
  { id: "typescript", label: "TypeScript", color: "#3d7fd6" },
  { id: "python", label: "Python", color: "#3f9a73" },
  { id: "sql", label: "SQL", color: "#e07b39" },
  { id: "json", label: "JSON", color: "#a3a33a" },
  { id: "html", label: "HTML", color: "#e0583a" },
  { id: "css", label: "CSS", color: "#2f9fc4" },
  { id: "java", label: "Java", color: "#b5562f" },
  { id: "csharp", label: "C#", color: "#5d9b3a" },
  { id: "cpp", label: "C++", color: "#4f7fae" },
  { id: "go", label: "Go", color: "#2bb0c9" },
  { id: "rust", label: "Rust", color: "#c9693e" },
  { id: "php", label: "PHP", color: "#7d8fc7" },
  { id: "ruby", label: "Ruby", color: "#cc3b4a" },
  { id: "shell", label: "Shell", color: "#6fae5a" },
  { id: "yaml", label: "YAML", color: "#c98fb0" },
  { id: "markdown", label: "Markdown", color: "#9aa0a6" },
  { id: "xml", label: "XML", color: "#d08a4f" },
];

const LANGUAGE_MAP = new Map(LANGUAGES.map((l) => [l.id, l]));

export function isValidLanguage(value: string): boolean {
  return LANGUAGE_MAP.has(value);
}

export function getLanguage(id: string): LanguageOption {
  return LANGUAGE_MAP.get(id) ?? LANGUAGES[0];
}

export function getLanguageLabel(id: string): string {
  return getLanguage(id).label;
}
