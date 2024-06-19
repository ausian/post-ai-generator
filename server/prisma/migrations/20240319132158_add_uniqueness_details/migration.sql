/*
  Warnings:

  - You are about to drop the column `uniqueness` on the `Article` table. All the data in the column will be lost.
  - You are about to drop the column `uniqueness` on the `ArticleVersion` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "UniquenessDetail" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "percent" REAL NOT NULL,
    "highlight" TEXT NOT NULL,
    "matches" TEXT NOT NULL,
    "articleId" INTEGER,
    "articleVersionId" INTEGER,
    CONSTRAINT "UniquenessDetail_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "UniquenessDetail_articleVersionId_fkey" FOREIGN KEY ("articleVersionId") REFERENCES "ArticleVersion" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Article" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "originalText" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "previewText" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "imageUrl" TEXT,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Article" ("date", "id", "imageUrl", "originalText", "previewText", "text", "title") SELECT "date", "id", "imageUrl", "originalText", "previewText", "text", "title" FROM "Article";
DROP TABLE "Article";
ALTER TABLE "new_Article" RENAME TO "Article";
CREATE TABLE "new_ArticleVersion" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "articleId" INTEGER NOT NULL,
    "originalText" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "previewText" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "imageUrl" TEXT,
    CONSTRAINT "ArticleVersion_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ArticleVersion" ("articleId", "id", "imageUrl", "originalText", "previewText", "text", "title") SELECT "articleId", "id", "imageUrl", "originalText", "previewText", "text", "title" FROM "ArticleVersion";
DROP TABLE "ArticleVersion";
ALTER TABLE "new_ArticleVersion" RENAME TO "ArticleVersion";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

-- CreateIndex
CREATE UNIQUE INDEX "UniquenessDetail_articleId_key" ON "UniquenessDetail"("articleId");

-- CreateIndex
CREATE UNIQUE INDEX "UniquenessDetail_articleVersionId_key" ON "UniquenessDetail"("articleVersionId");
