-- AlterTable
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "show_username" BOOLEAN NOT NULL DEFAULT true;
