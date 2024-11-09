/*
  Warnings:

  - Added the required column `static` to the `Element` table without a default value. This is not possible if the table is not empty.
  - Made the column `elementId` on table `mapElements` required. This step will fail if there are existing NULL values in that column.
  - Made the column `x` on table `mapElements` required. This step will fail if there are existing NULL values in that column.
  - Made the column `y` on table `mapElements` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "mapElements" DROP CONSTRAINT "mapElements_elementId_fkey";

-- AlterTable
ALTER TABLE "Element" ADD COLUMN     "static" BOOLEAN NOT NULL;

-- AlterTable
ALTER TABLE "mapElements" ALTER COLUMN "elementId" SET NOT NULL,
ALTER COLUMN "x" SET NOT NULL,
ALTER COLUMN "y" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "mapElements" ADD CONSTRAINT "mapElements_elementId_fkey" FOREIGN KEY ("elementId") REFERENCES "Element"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
