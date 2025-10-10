-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "postgis";

-- CreateTable
CREATE TABLE "pole_types" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "parent_id" INTEGER,
    "icon" VARCHAR(10),
    "sort_order" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pole_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pole_operators" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "name_short" VARCHAR(20),
    "category" VARCHAR(20) NOT NULL,
    "area_coverage" VARCHAR(50),
    "number_format" VARCHAR(100),
    "example_number" VARCHAR(50),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pole_operators_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prefectures" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(10) NOT NULL,
    "region" VARCHAR(20),
    "primary_power_company" VARCHAR(50),
    "boundary_area" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "prefectures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "poles" (
    "id" SERIAL NOT NULL,
    "latitude" DECIMAL(10,8) NOT NULL,
    "longitude" DECIMAL(11,8) NOT NULL,
    "prefecture" VARCHAR(10),
    "pole_type_id" INTEGER,
    "pole_type_name" VARCHAR(50),
    "primary_photo_url" VARCHAR(500),
    "photo_count" INTEGER NOT NULL DEFAULT 0,
    "number_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "poles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pole_numbers" (
    "id" SERIAL NOT NULL,
    "pole_id" INTEGER NOT NULL,
    "pole_number" VARCHAR(100) NOT NULL,
    "operator_id" INTEGER,
    "operator_name" VARCHAR(50) NOT NULL,
    "area_prefix" VARCHAR(50),
    "photo_url" VARCHAR(500),
    "registered_by" INTEGER,
    "registered_by_name" VARCHAR(100),
    "location_method" VARCHAR(20) NOT NULL DEFAULT 'auto',
    "location_accuracy" DECIMAL(6,2),
    "points_earned" INTEGER,
    "verification_count" INTEGER NOT NULL DEFAULT 0,
    "verification_status" VARCHAR(20) NOT NULL DEFAULT 'unverified',
    "first_verified_at" TIMESTAMP(3),
    "last_verified_at" TIMESTAMP(3),
    "is_auto_generated" BOOLEAN NOT NULL DEFAULT false,
    "gps_adjusted" BOOLEAN NOT NULL DEFAULT false,
    "adjustment_distance" DECIMAL(6,2),
    "original_gps_lat" DECIMAL(10,8),
    "original_gps_lng" DECIMAL(11,8),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pole_numbers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pole_photos" (
    "id" SERIAL NOT NULL,
    "pole_id" INTEGER,
    "pole_number_id" INTEGER,
    "photo_url" VARCHAR(500) NOT NULL,
    "photo_thumbnail_url" VARCHAR(500) NOT NULL,
    "photo_type" VARCHAR(20) NOT NULL,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "like_count" INTEGER NOT NULL DEFAULT 0,
    "official_like_count" INTEGER NOT NULL DEFAULT 0,
    "is_hall_of_fame" BOOLEAN NOT NULL DEFAULT false,
    "points_active_until" TIMESTAMP(3),
    "is_hidden" BOOLEAN NOT NULL DEFAULT false,
    "hidden_reason" VARCHAR(100),
    "deleted_at" TIMESTAMP(3),
    "deleted_by" INTEGER,
    "deleted_reason" VARCHAR(100),
    "auto_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deletion_expires_at" TIMESTAMP(3),
    "uploaded_by" INTEGER,
    "uploaded_by_name" VARCHAR(100),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pole_photos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "username" VARCHAR(100) NOT NULL,
    "display_name" VARCHAR(100),
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "gift_card_email" VARCHAR(255),
    "home_prefecture" VARCHAR(10),
    "home_prefecture_id" INTEGER,
    "plan_type" VARCHAR(20) NOT NULL DEFAULT 'free',
    "stripe_customer_id" VARCHAR(100),
    "subscription_status" VARCHAR(20),
    "role" VARCHAR(20) NOT NULL DEFAULT 'user',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guest_users" (
    "id" SERIAL NOT NULL,
    "guest_id" VARCHAR(20) NOT NULL,
    "home_prefecture" VARCHAR(10),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "guest_users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "pole_operators_name_key" ON "pole_operators"("name");

-- CreateIndex
CREATE UNIQUE INDEX "pole_numbers_pole_number_key" ON "pole_numbers"("pole_number");

-- CreateIndex
CREATE INDEX "pole_numbers_pole_id_idx" ON "pole_numbers"("pole_id");

-- CreateIndex
CREATE INDEX "pole_numbers_pole_number_idx" ON "pole_numbers"("pole_number");

-- CreateIndex
CREATE INDEX "pole_numbers_operator_name_idx" ON "pole_numbers"("operator_name");

-- CreateIndex
CREATE INDEX "pole_photos_pole_id_idx" ON "pole_photos"("pole_id");

-- CreateIndex
CREATE INDEX "pole_photos_photo_type_idx" ON "pole_photos"("photo_type");

-- CreateIndex
CREATE INDEX "pole_photos_deleted_at_idx" ON "pole_photos"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "guest_users_guest_id_key" ON "guest_users"("guest_id");

-- AddForeignKey
ALTER TABLE "pole_types" ADD CONSTRAINT "pole_types_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "pole_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "poles" ADD CONSTRAINT "poles_pole_type_id_fkey" FOREIGN KEY ("pole_type_id") REFERENCES "pole_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pole_numbers" ADD CONSTRAINT "pole_numbers_pole_id_fkey" FOREIGN KEY ("pole_id") REFERENCES "poles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pole_numbers" ADD CONSTRAINT "pole_numbers_operator_id_fkey" FOREIGN KEY ("operator_id") REFERENCES "pole_operators"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pole_numbers" ADD CONSTRAINT "pole_numbers_registered_by_fkey" FOREIGN KEY ("registered_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pole_photos" ADD CONSTRAINT "pole_photos_pole_id_fkey" FOREIGN KEY ("pole_id") REFERENCES "poles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pole_photos" ADD CONSTRAINT "pole_photos_pole_number_id_fkey" FOREIGN KEY ("pole_number_id") REFERENCES "pole_numbers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pole_photos" ADD CONSTRAINT "pole_photos_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pole_photos" ADD CONSTRAINT "pole_photos_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
