import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

const TEST_USER = {
  name: "Test User",
  email: "test@snippi.dev",
  password: "password123",
};

const SAMPLE_SNIPPETS = [
  {
    title: "Debounce (TypeScript)",
    language: "typescript",
    code: `export function debounce<T extends (...args: any[]) => void>(
  fn: T,
  delay = 300
) {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}`,
  },
  {
    title: "Top customers by revenue (SQL)",
    language: "sql",
    code: `SELECT c.name, SUM(o.total) AS revenue
FROM customers c
JOIN orders o ON o.customer_id = c.id
GROUP BY c.id
ORDER BY revenue DESC
LIMIT 10;`,
  },
  {
    title: "API response shape (JSON)",
    language: "json",
    code: `{
  "id": 42,
  "title": "Hello world",
  "tags": ["draft", "featured"],
  "author": { "name": "Ada", "verified": true }
}`,
  },
  {
    title: "Flatten a list (Python)",
    language: "python",
    code: `def flatten(nested):
    return [item for sub in nested for item in sub]

print(flatten([[1, 2], [3, 4], [5]]))`,
  },
];

async function main() {
  const hashed = await bcrypt.hash(TEST_USER.password, 10);

  const user = await db.user.upsert({
    where: { email: TEST_USER.email },
    update: { name: TEST_USER.name, password: hashed },
    create: { name: TEST_USER.name, email: TEST_USER.email, password: hashed },
  });

  const existing = await db.snippet.count({ where: { userId: user.id } });
  if (existing === 0) {
    await db.snippet.createMany({
      data: SAMPLE_SNIPPETS.map((s) => ({ ...s, userId: user.id })),
    });
  }

  console.log("Seeded test user:");
  console.log(`  email:    ${TEST_USER.email}`);
  console.log(`  password: ${TEST_USER.password}`);
  console.log(`  snippets: ${await db.snippet.count({ where: { userId: user.id } })}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
