/*
  Warnings:

  - You are about to drop the column `templateId` on the `CustomDesign` table. All the data in the column will be lost.
  - You are about to drop the `TemplateDesign` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "CustomDesign" DROP CONSTRAINT "CustomDesign_templateId_fkey";

-- AlterTable
ALTER TABLE "CustomDesign" DROP COLUMN "templateId";

-- DropTable
DROP TABLE "TemplateDesign";
