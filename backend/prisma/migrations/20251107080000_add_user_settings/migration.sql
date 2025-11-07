-- AlterTable
ALTER TABLE "users" ADD COLUMN "email_notifications" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "users" ADD COLUMN "data_visibility" VARCHAR(20) NOT NULL DEFAULT 'public';
