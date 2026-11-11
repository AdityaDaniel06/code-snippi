/**
 * Illustrative snippets for the landing page demo. These are example code,
 * not user data or claims.
 */
export interface DemoSnippet {
  id: number;
  title: string;
  language: string;
  updated: string;
  code: string;
}

export const DEMO_SNIPPETS: DemoSnippet[] = [
  {
    id: 1,
    title: "Free a port that's stuck",
    language: "shell",
    updated: "2h ago",
    code: `# Kill whatever is listening on :3000
lsof -ti :3000 | xargs kill -9`,
  },
  {
    id: 2,
    title: "Revenue by month",
    language: "sql",
    updated: "Yesterday",
    code: `SELECT date_trunc('month', paid_at) AS month,
       SUM(amount_cents) / 100.0  AS revenue
FROM payments
WHERE status = 'succeeded'
  AND paid_at > now() - interval '12 months'
GROUP BY 1
ORDER BY 1 DESC;`,
  },
  {
    id: 3,
    title: "Debounce",
    language: "typescript",
    updated: "3 days ago",
    code: `export function debounce<T extends unknown[]>(
  fn: (...args: T) => void,
  wait = 200
) {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: T) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), wait);
  };
}`,
  },
  {
    id: 4,
    title: "Retry with backoff",
    language: "python",
    updated: "Last week",
    code: `import time

def retry(fn, attempts=4, base=0.5):
    for i in range(attempts):
        try:
            return fn()
        except Exception:
            if i == attempts - 1:
                raise
            time.sleep(base * 2 ** i)`,
  },
  {
    id: 5,
    title: "Postgres for local dev",
    language: "yaml",
    updated: "Last week",
    code: `services:
  db:
    image: postgres:16
    environment:
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
volumes:
  pgdata:`,
  },
  {
    id: 6,
    title: "Undo the last commit, keep changes",
    language: "shell",
    updated: "2 weeks ago",
    code: `git reset --soft HEAD~1`,
  },
  {
    id: 7,
    title: "Center anything",
    language: "css",
    updated: "Last month",
    code: `.center {
  display: grid;
  place-items: center;
  min-height: 100dvh;
}`,
  },
  {
    id: 8,
    title: "Strict tsconfig base",
    language: "json",
    updated: "Last month",
    code: `{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "moduleResolution": "bundler"
  }
}`,
  },
];
