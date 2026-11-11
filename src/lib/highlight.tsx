import type { ReactNode } from "react";

/**
 * A deliberately small, dependency-free highlighter for static previews
 * (snippet cards, landing fragments). Monaco handles the real editor and
 * viewer; this only needs to look right for a handful of lines.
 */

const KEYWORDS = new Set(
  (
    "abstract as async await break case catch class const continue def default defer del delete do elif else enum export extends false final finally fn for from func function go if impl import in interface is lambda let match mod module mut new nil none not null or package pass private protected pub public raise return self static struct super switch this throw true try type typeof use var void while with yield " +
    // SQL
    "select from where group by order having join left right inner outer on as and limit offset insert into values update set delete create table index drop alter distinct count sum avg min max case when then end desc asc interval date_trunc now " +
    // Shell
    "echo export sudo then fi done esac"
  ).split(" ")
);

const HASH_COMMENT = new Set(["python", "shell", "yaml", "ruby"]);

type Token = { cls: string | null; text: string };

function tokenize(code: string, language: string): Token[] {
  const commentPattern = HASH_COMMENT.has(language)
    ? String.raw`#[^\n]*`
    : language === "sql"
      ? String.raw`--[^\n]*`
      : String.raw`\/\/[^\n]*|\/\*[\s\S]*?\*\/|<!--[\s\S]*?-->`;

  const re = new RegExp(
    [
      `(${commentPattern})`, // 1 comment
      String.raw`("(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'|\`(?:\\.|[^\`\\])*\`)`, // 2 string
      String.raw`(\b\d+(?:\.\d+)?\b)`, // 3 number
      String.raw`([A-Za-z_$][\w$]*)(?=\s*\()`, // 4 function call
      String.raw`([A-Za-z_$][\w$-]*)`, // 5 word
    ].join("|"),
    "g"
  );

  const tokens: Token[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  const lowerKeywords = language === "sql";

  while ((m = re.exec(code))) {
    if (m.index > last) tokens.push({ cls: null, text: code.slice(last, m.index) });
    const [text, comment, str, num, fn, word] = m;
    let cls: string | null = null;
    if (comment) cls = "tk-c";
    else if (str) cls = "tk-s";
    else if (num) cls = "tk-n";
    else if (fn) cls = KEYWORDS.has(fn) ? "tk-k" : "tk-f";
    else if (word) {
      const key = lowerKeywords ? word.toLowerCase() : word;
      cls = KEYWORDS.has(key) ? "tk-k" : null;
    }
    tokens.push({ cls, text });
    last = m.index + text.length;
  }
  if (last < code.length) tokens.push({ cls: null, text: code.slice(last) });
  return tokens;
}

export function highlight(code: string, language: string): ReactNode[] {
  if (language === "plaintext" || language === "markdown") return [code];
  return tokenize(code, language).map((t, i) =>
    t.cls ? (
      <span key={i} className={t.cls}>
        {t.text}
      </span>
    ) : (
      t.text
    )
  );
}
