/*
  Warnings:

  - You are about to drop the column `address` on the `UserProfile` table. All the data in the column will be lost.
  - You are about to drop the column `avatarUrl` on the `UserProfile` table. All the data in the column will be lost.
  - Added the required column `email` to the `UserProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `UserProfile` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UserProfile" DROP COLUMN "address",
DROP COLUMN "avatarUrl",
ADD COLUMN     "avatar" TEXT,
ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "github" TEXT,
ADD COLUMN     "linkedin" TEXT,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "twitter" TEXT,
ADD COLUMN     "website" TEXT,
ADD COLUMN     "youtube" TEXT;
