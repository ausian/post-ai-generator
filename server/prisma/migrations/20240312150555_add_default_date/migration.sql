-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Article" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "originalText" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "previewText" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "imageUrl" TEXT,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "uniqueness" REAL NOT NULL
);
INSERT INTO "new_Article" ("date", "id", "imageUrl", "originalText", "previewText", "text", "title", "uniqueness") SELECT "date", "id", "imageUrl", "originalText", "previewText", "text", "title", "uniqueness" FROM "Article";
DROP TABLE "Article";
ALTER TABLE "new_Article" RENAME TO "Article";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
