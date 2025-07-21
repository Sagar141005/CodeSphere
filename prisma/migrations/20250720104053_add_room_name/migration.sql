/*
  Warnings:

  - Changed the type of `type` on the `File` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `name` to the `Room` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "FileType" AS ENUM ('file', 'folder');

-- AlterTable
ALTER TABLE "File" DROP COLUMN "type",
ADD COLUMN     "type" "FileType" NOT NULL;

-- AlterTable
ALTER TABLE "Room" ADD COLUMN     "githubRepo" TEXT,
ADD COLUMN     "githubToken" TEXT,
ADD COLUMN     "name" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "password" TEXT;
