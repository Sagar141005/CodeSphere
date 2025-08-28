-- DropForeignKey
ALTER TABLE "Commit" DROP CONSTRAINT "Commit_roomId_fkey";

-- DropForeignKey
ALTER TABLE "Commit" DROP CONSTRAINT "Commit_userId_fkey";

-- DropForeignKey
ALTER TABLE "CommitFile" DROP CONSTRAINT "CommitFile_commitId_fkey";

-- DropForeignKey
ALTER TABLE "File" DROP CONSTRAINT "File_parentId_fkey";

-- DropForeignKey
ALTER TABLE "File" DROP CONSTRAINT "File_roomId_fkey";

-- DropForeignKey
ALTER TABLE "Room" DROP CONSTRAINT "Room_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "Room" DROP CONSTRAINT "Room_teamId_fkey";

-- DropForeignKey
ALTER TABLE "RoomInvite" DROP CONSTRAINT "RoomInvite_invitedById_fkey";

-- DropForeignKey
ALTER TABLE "RoomInvite" DROP CONSTRAINT "RoomInvite_invitedId_fkey";

-- DropForeignKey
ALTER TABLE "RoomInvite" DROP CONSTRAINT "RoomInvite_roomId_fkey";

-- DropForeignKey
ALTER TABLE "Team" DROP CONSTRAINT "Team_createdById_fkey";

-- DropForeignKey
ALTER TABLE "TeamInvite" DROP CONSTRAINT "TeamInvite_invitedById_fkey";

-- DropForeignKey
ALTER TABLE "TeamInvite" DROP CONSTRAINT "TeamInvite_invitedId_fkey";

-- DropForeignKey
ALTER TABLE "TeamInvite" DROP CONSTRAINT "TeamInvite_teamId_fkey";

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamInvite" ADD CONSTRAINT "TeamInvite_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamInvite" ADD CONSTRAINT "TeamInvite_invitedId_fkey" FOREIGN KEY ("invitedId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamInvite" ADD CONSTRAINT "TeamInvite_invitedById_fkey" FOREIGN KEY ("invitedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Room" ADD CONSTRAINT "Room_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Room" ADD CONSTRAINT "Room_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomInvite" ADD CONSTRAINT "RoomInvite_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomInvite" ADD CONSTRAINT "RoomInvite_invitedId_fkey" FOREIGN KEY ("invitedId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomInvite" ADD CONSTRAINT "RoomInvite_invitedById_fkey" FOREIGN KEY ("invitedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "File"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Commit" ADD CONSTRAINT "Commit_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Commit" ADD CONSTRAINT "Commit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommitFile" ADD CONSTRAINT "CommitFile_commitId_fkey" FOREIGN KEY ("commitId") REFERENCES "Commit"("id") ON DELETE CASCADE ON UPDATE CASCADE;
