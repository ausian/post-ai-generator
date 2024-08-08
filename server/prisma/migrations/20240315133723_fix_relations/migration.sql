/*
  Warnings:

  - You are about to drop the column `date` on the `ArticleVersion` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ArticleParams" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "style" TEXT NOT NULL,
    "tone" TEXT NOT NULL,
    "lang" TEXT NOT NULL,
    "degree" TEXT NOT NULL,
    "target" TEXT NOT NULL,
    "headerLength" INTEGER NOT NULL,
    "previewLength" INTEGER NOT NULL,
    "textLength" INTEGER NOT NULL,
    "perspective" INTEGER NOT NULL,
    "paragraph" INTEGER NOT NULL,
    "temperature" REAL NOT NULL,
    "quotesInDirectSpeech" BOOLEAN NOT NULL,
    "engTranslateExpr" BOOLEAN NOT NULL,
    "articleId" INTEGER,
    "articleVersionId" INTEGER,
    CONSTRAINT "ArticleParams_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ArticleParams_articleVersionId_fkey" FOREIGN KEY ("articleVersionId") REFERENCES "ArticleVersion" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_ArticleParams" ("articleId", "degree", "engTranslateExpr", "headerLength", "id", "lang", "paragraph", "perspective", "previewLength", "quotesInDirectSpeech", "style", "target", "temperature", "textLength", "tone") SELECT "articleId", "degree", "engTranslateExpr", "headerLength", "id", "lang", "paragraph", "perspective", "previewLength", "quotesInDirectSpeech", "style", "target", "temperature", "textLength", "tone" FROM "ArticleParams";
DROP TABLE "ArticleParams";
ALTER TABLE "new_ArticleParams" RENAME TO "ArticleParams";
CREATE UNIQUE INDEX "ArticleParams_articleId_key" ON "ArticleParams"("articleId");
CREATE UNIQUE INDEX "ArticleParams_articleVersionId_key" ON "ArticleParams"("articleVersionId");
CREATE TABLE "new_ArticleVersion" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "articleId" INTEGER NOT NULL,
    "originalText" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "previewText" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "imageUrl" TEXT,
    "uniqueness" REAL NOT NULL,
    CONSTRAINT "ArticleVersion_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ArticleVersion" ("articleId", "id", "imageUrl", "originalText", "previewText", "text", "title", "uniqueness") SELECT "articleId", "id", "imageUrl", "originalText", "previewText", "text", "title", "uniqueness" FROM "ArticleVersion";
DROP TABLE "ArticleVersion";
ALTER TABLE "new_ArticleVersion" RENAME TO "ArticleVersion";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
