/*
  Warnings:

  - You are about to drop the column `name` on the `kantin` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `menu` table. All the data in the column will be lost.
  - You are about to alter the column `metode` on the `order` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(0))` to `Enum(EnumId(1))`.
  - You are about to drop the column `createdAt` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `kelas` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `saldo` on the `user` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId]` on the table `Kantin` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `nama` to the `Kantin` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Kantin` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nama` to the `Menu` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nama` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `kantin` DROP COLUMN `name`,
    ADD COLUMN `nama` VARCHAR(191) NOT NULL,
    ADD COLUMN `userId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `menu` DROP COLUMN `name`,
    ADD COLUMN `nama` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `order` MODIFY `metode` ENUM('AMBIL_SENDIRI', 'DIANTAR') NOT NULL,
    ALTER COLUMN `status` DROP DEFAULT;

-- AlterTable
ALTER TABLE `user` DROP COLUMN `createdAt`,
    DROP COLUMN `kelas`,
    DROP COLUMN `name`,
    DROP COLUMN `saldo`,
    ADD COLUMN `kantinId` INTEGER NULL,
    ADD COLUMN `nama` VARCHAR(191) NOT NULL,
    ALTER COLUMN `role` DROP DEFAULT;

-- CreateIndex
CREATE UNIQUE INDEX `Kantin_userId_key` ON `Kantin`(`userId`);

-- AddForeignKey
ALTER TABLE `Kantin` ADD CONSTRAINT `Kantin_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
