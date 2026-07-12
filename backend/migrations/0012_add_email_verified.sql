ALTER TABLE "users" ADD COLUMN "email_verified" boolean DEFAULT false NOT NULL;
UPDATE "users" SET "email_verified" = true;
