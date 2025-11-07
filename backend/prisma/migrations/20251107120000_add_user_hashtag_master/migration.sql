-- CreateTable
CREATE TABLE "user_hashtags" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "tag" VARCHAR(50) NOT NULL,
    "display_tag" VARCHAR(50) NOT NULL,
    "color" VARCHAR(20),
    "icon" VARCHAR(20),
    "usage_count" INTEGER NOT NULL DEFAULT 0,
    "sort_order" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_hashtags_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_hashtags_user_id_tag_key" ON "user_hashtags"("user_id", "tag");

-- CreateIndex
CREATE INDEX "user_hashtags_user_id_usage_count_idx" ON "user_hashtags"("user_id", "usage_count" DESC);

-- AddForeignKey
ALTER TABLE "user_hashtags" ADD CONSTRAINT "user_hashtags_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
