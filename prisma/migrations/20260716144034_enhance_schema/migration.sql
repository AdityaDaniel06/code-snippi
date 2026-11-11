-- CreateEnum
CREATE TYPE "Visibility" AS ENUM ('PRIVATE', 'PUBLIC');

-- AlterTable
ALTER TABLE "Snippet" ADD COLUMN     "description" TEXT,
ADD COLUMN     "visibility" "Visibility" NOT NULL DEFAULT 'PRIVATE';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "avatarUrl" TEXT,
ADD COLUMN     "bio" TEXT;

-- CreateTable
CREATE TABLE "Tag" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SnippetTag" (
    "snippetId" INTEGER NOT NULL,
    "tagId" INTEGER NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SnippetTag_pkey" PRIMARY KEY ("snippetId","tagId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Tag_name_key" ON "Tag"("name");

-- CreateIndex
CREATE INDEX "SnippetTag_tagId_idx" ON "SnippetTag"("tagId");

-- CreateIndex
CREATE INDEX "Snippet_language_idx" ON "Snippet"("language");

-- CreateIndex
CREATE INDEX "Snippet_visibility_idx" ON "Snippet"("visibility");

-- AddForeignKey
ALTER TABLE "SnippetTag" ADD CONSTRAINT "SnippetTag_snippetId_fkey" FOREIGN KEY ("snippetId") REFERENCES "Snippet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SnippetTag" ADD CONSTRAINT "SnippetTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
