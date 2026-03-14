-- AlterTable
ALTER TABLE "File" ADD COLUMN     "mime" TEXT NOT NULL DEFAULT 'application/pdf',
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'success';
