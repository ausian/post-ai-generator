-- CreateTable
CREATE TABLE "Article" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "originalText" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "previewText" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "imageUrl" TEXT,
    "date" DATETIME NOT NULL,
    "uniqueness" REAL NOT NULL
);
