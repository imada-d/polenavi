// 何を: 写真アップロードのビジネスロジック
// なぜ: 写真の保存、サムネイル生成、データベース登録を行うため

import { PrismaClient } from '@prisma/client';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { NotFoundError } from '../utils/AppError';

const prisma = new PrismaClient();

/**
 * 写真アップロードのリクエストデータ
 */
export interface UploadPhotoRequest {
  poleId: number;
  file: Express.Multer.File;
  photoType?: 'plate' | 'full' | 'detail';
  uploadedBy?: number;
  uploadedByName?: string;
  registrationMethod?: 'location-first' | 'photo-first';
}

/**
 * 写真をアップロード
 */
export async function uploadPhoto(data: UploadPhotoRequest) {
  // 電柱が存在するか確認
  const pole = await prisma.pole.findUnique({
    where: { id: data.poleId },
  });

  if (!pole) {
    // アップロードされたファイルを削除
    fs.unlinkSync(data.file.path);
    throw new NotFoundError('電柱が見つかりません');
  }

  // サムネイル生成
  const thumbnailPath = await generateThumbnail(data.file.path);

  // 写真URLを生成（publicディレクトリからの相対パス）
  const photoUrl = `/uploads/poles/${path.basename(data.file.path)}`;
  const thumbnailUrl = `/uploads/poles/${path.basename(thumbnailPath)}`;

  // データベースに保存
  const photo = await prisma.polePhoto.create({
    data: {
      poleId: data.poleId,
      photoUrl,
      photoThumbnailUrl: thumbnailUrl,
      photoType: data.photoType || 'full',
      isPrimary: false,
      uploadedBy: data.uploadedBy,
      uploadedByName: data.uploadedByName || 'guest',
      visibility: 'public', // グループ機能対応
      groupId: null,
    },
  });

  // 電柱の写真カウントを更新
  await prisma.pole.update({
    where: { id: data.poleId },
    data: {
      photoCount: {
        increment: 1,
      },
      // 最初の写真の場合はプライマリ写真として設定
      primaryPhotoUrl: pole.photoCount === 0 ? photoUrl : undefined,
    },
  });

  return photo;
}

/**
 * サムネイル生成
 */
async function generateThumbnail(originalPath: string): Promise<string> {
  const ext = path.extname(originalPath);
  const basename = path.basename(originalPath, ext);
  const dirname = path.dirname(originalPath);
  const thumbnailPath = path.join(dirname, `${basename}-thumb${ext}`);

  await sharp(originalPath)
    .resize(300, 300, {
      fit: 'cover',
      position: 'center',
    })
    .jpeg({ quality: 80 })
    .toFile(thumbnailPath);

  return thumbnailPath;
}

/**
 * 電柱の写真一覧を取得
 */
export async function getPhotosByPoleId(poleId: number) {
  const photos = await prisma.polePhoto.findMany({
    where: {
      poleId,
      deletedAt: null,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return photos;
}

/**
 * 写真を削除（論理削除）
 */
export async function deletePhoto(photoId: number, deletedBy?: number, reason?: string) {
  const photo = await prisma.polePhoto.findUnique({
    where: { id: photoId },
  });

  if (!photo) {
    throw new NotFoundError('写真が見つかりません');
  }

  await prisma.polePhoto.update({
    where: { id: photoId },
    data: {
      deletedAt: new Date(),
      deletedBy,
      deletedReason: reason,
    },
  });

  // 電柱の写真カウントを更新
  await prisma.pole.update({
    where: { id: photo.poleId! },
    data: {
      photoCount: {
        decrement: 1,
      },
    },
  });

  return { success: true };
}
