-- CreateEnum
CREATE TYPE "SharePermission" AS ENUM ('VIEW', 'EDIT');

-- CreateTable
CREATE TABLE "SnippetShare" (
    "id" SERIAL NOT NULL,
    "snippetId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "permission" "SharePermission" NOT NULL DEFAULT 'VIEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SnippetShare_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SnippetShare_userId_idx" ON "SnippetShare"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SnippetShare_snippetId_userId_key" ON "SnippetShare"("snippetId", "userId");

-- AddForeignKey
ALTER TABLE "SnippetShare" ADD CONSTRAINT "SnippetShare_snippetId_fkey" FOREIGN KEY ("snippetId") REFERENCES "Snippet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SnippetShare" ADD CONSTRAINT "SnippetShare_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

