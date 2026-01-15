-- AlterTable
ALTER TABLE "settings" ADD COLUMN     "label" TEXT,
ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'text';
