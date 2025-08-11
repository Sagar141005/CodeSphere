-- CreateTable
CREATE TABLE "Commit" (
    "id" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "roomId" TEXT NOT NULL,

    CONSTRAINT "Commit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommitFile" (
    "id" TEXT NOT NULL,
    "commitId" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "language" TEXT,
    "content" TEXT NOT NULL,

    CONSTRAINT "CommitFile_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Commit" ADD CONSTRAINT "Commit_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommitFile" ADD CONSTRAINT "CommitFile_commitId_fkey" FOREIGN KEY ("commitId") REFERENCES "Commit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
