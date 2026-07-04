-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "isCustomizable" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "TemplateDesign" ALTER COLUMN "isActive" SET DEFAULT true;
