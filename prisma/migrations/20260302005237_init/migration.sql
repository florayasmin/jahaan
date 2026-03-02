-- CreateTable
CREATE TABLE "Show" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "releaseYear" INTEGER,
    "totalEpisodes" INTEGER,
    "channel" TEXT,
    "director" TEXT,
    "writer" TEXT,
    "cast" TEXT,
    "status" TEXT,
    "rating" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Show_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Episode" (
    "id" SERIAL NOT NULL,
    "showId" INTEGER NOT NULL,
    "episodeNumber" INTEGER NOT NULL,
    "seasonNumber" INTEGER NOT NULL,
    "title" TEXT,
    "airDate" TIMESTAMP(3),
    "duration" INTEGER,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Episode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Genre" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Genre_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_GenreToShow" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE INDEX "Show_name_idx" ON "Show"("name");

-- CreateIndex
CREATE INDEX "Show_status_releaseYear_idx" ON "Show"("status", "releaseYear");

-- CreateIndex
CREATE INDEX "Show_rating_idx" ON "Show"("rating");

-- CreateIndex
CREATE INDEX "Episode_showId_idx" ON "Episode"("showId");

-- CreateIndex
CREATE UNIQUE INDEX "Episode_showId_seasonNumber_episodeNumber_key" ON "Episode"("showId", "seasonNumber", "episodeNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Genre_name_key" ON "Genre"("name");

-- CreateIndex
CREATE UNIQUE INDEX "_GenreToShow_AB_unique" ON "_GenreToShow"("A", "B");

-- CreateIndex
CREATE INDEX "_GenreToShow_B_index" ON "_GenreToShow"("B");

-- AddForeignKey
ALTER TABLE "Episode" ADD CONSTRAINT "Episode_showId_fkey" FOREIGN KEY ("showId") REFERENCES "Show"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GenreToShow" ADD CONSTRAINT "_GenreToShow_A_fkey" FOREIGN KEY ("A") REFERENCES "Genre"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GenreToShow" ADD CONSTRAINT "_GenreToShow_B_fkey" FOREIGN KEY ("B") REFERENCES "Show"("id") ON DELETE CASCADE ON UPDATE CASCADE;
