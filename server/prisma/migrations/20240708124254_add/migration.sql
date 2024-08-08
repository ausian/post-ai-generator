-- CreateTable
CREATE TABLE "Style" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Style_name_key" ON "Style"("name");
