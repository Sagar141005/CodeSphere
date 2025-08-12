-- AlterTable
ALTER TABLE "Commit" ADD COLUMN     "userId" TEXT;

-- AddForeignKey
ALTER TABLE "Commit" ADD CONSTRAINT "Commit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
