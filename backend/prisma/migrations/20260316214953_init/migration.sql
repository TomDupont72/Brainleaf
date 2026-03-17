-- CreateTable
CREATE TABLE "FileContent" (
    "id" SERIAL NOT NULL,
    "fileId" INTEGER NOT NULL,
    "summary" TEXT NOT NULL,
    "revisionSheet" TEXT NOT NULL,

    CONSTRAINT "FileContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FileQuestion" (
    "id" SERIAL NOT NULL,
    "fileId" INTEGER NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,

    CONSTRAINT "FileQuestion_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "FileContent" ADD CONSTRAINT "FileContent_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "File"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FileQuestion" ADD CONSTRAINT "FileQuestion_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "File"("id") ON DELETE CASCADE ON UPDATE CASCADE;
