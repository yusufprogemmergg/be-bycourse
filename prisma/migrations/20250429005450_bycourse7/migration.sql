/*
  Warnings:

  - You are about to drop the column `activetoken` on the `user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `user` DROP COLUMN `activetoken`,
    ADD COLUMN `activatinoToken` VARCHAR(191) NULL;
