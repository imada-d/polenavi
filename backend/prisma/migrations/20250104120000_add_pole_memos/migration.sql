-- CreateTable
CREATE TABLE "pole_memos" (
    "id" SERIAL NOT NULL,
    "pole_id" INTEGER NOT NULL,
    "hashtags" TEXT[],
    "memo_text" TEXT,
    "created_by" INTEGER,
    "created_by_name" VARCHAR(100) NOT NULL,
    "is_public" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pole_memos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "pole_memos_pole_id_idx" ON "pole_memos"("pole_id");

-- AddForeignKey
ALTER TABLE "pole_memos" ADD CONSTRAINT "pole_memos_pole_id_fkey" FOREIGN KEY ("pole_id") REFERENCES "poles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pole_memos" ADD CONSTRAINT "pole_memos_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
