/*
  Warnings:

  - You are about to drop the column `githubRepo` on the `Room` table. All the data in the column will be lost.
  - You are about to drop the column `githubToken` on the `Room` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Room" DROP COLUMN "githubRepo",
DROP COLUMN "githubToken";
