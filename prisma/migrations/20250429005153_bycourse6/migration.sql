/*
  Warnings:

  - Added the required column `passwordconfirm` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `user` ADD COLUMN `passwordconfirm` VARCHAR(191) NOT NULL;
