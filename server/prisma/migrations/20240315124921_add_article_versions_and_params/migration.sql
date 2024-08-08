-- CreateTable
CREATE TABLE "ArticleVersion" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "articleId" INTEGER NOT NULL,
    "originalText" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "previewText" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "imageUrl" TEXT,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "uniqueness" REAL NOT NULL,
    CONSTRAINT "ArticleVersion_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ArticleParams" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "articleId" INTEGER NOT NULL,
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
    CONSTRAINT "ArticleParams_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "ArticleParams_articleId_key" ON "ArticleParams"("articleId");
