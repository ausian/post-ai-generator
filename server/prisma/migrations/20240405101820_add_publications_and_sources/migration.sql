-- CreateTable
CREATE TABLE "Source" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "url" TEXT
);

-- CreateTable
CREATE TABLE "Publication" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sourceId" INTEGER NOT NULL,
    "articleId" INTEGER,
    "articleVersionId" INTEGER,
    CONSTRAINT "Publication_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Publication_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Publication_articleVersionId_fkey" FOREIGN KEY ("articleVersionId") REFERENCES "ArticleVersion" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
