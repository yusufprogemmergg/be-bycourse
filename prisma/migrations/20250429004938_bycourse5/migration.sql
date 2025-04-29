/*
  Warnings:

  - You are about to drop the column `passwordconfirm` on the `user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `user` DROP COLUMN `passwordconfirm`,
    ADD COLUMN `activetoken` VARCHAR(191) NULL,
    ADD COLUMN `isActive` BOOLEAN NOT NULL DEFAULT false;
