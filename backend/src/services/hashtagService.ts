// 何を: ハッシュタグのビジネスロジック
// なぜ: ユーザー独自のハッシュタグ管理機能を提供するため

import { PrismaClient } from '@prisma/client';
import { NotFoundError, ValidationError } from '../utils/AppError';

const prisma = new PrismaClient();

/**
 * ハッシュタグ作成のリクエストデータ
 */
export interface CreateHashtagRequest {
  userId: number;
  name: string; // フロントエンドから受け取る表示名
  color: string;
}

/**
 * ハッシュタグ更新のリクエストデータ
 */
export interface UpdateHashtagRequest {
  name?: string; // フロントエンドから受け取る表示名
  color?: string;
}

/**
 * ユーザーのハッシュタグ一覧を取得
 */
export async function getUserHashtags(userId: number) {
  const hashtags = await prisma.userHashtag.findMany({
    where: {
      userId,
    },
    orderBy: {
      sortOrder: 'asc',
    },
  });

  return hashtags;
}

/**
 * ハッシュタグを作成
 */
export async function createHashtag(data: CreateHashtagRequest) {
  // ハッシュタグ名のバリデーション
  if (!data.name || data.name.trim().length === 0) {
    throw new ValidationError('ハッシュタグ名を入力してください');
  }

  if (data.name.length > 50) {
    throw new ValidationError('ハッシュタグ名は50文字以内で入力してください');
  }

  // 色のバリデーション（6桁のHEXカラーコード）
  if (!data.color || !/^#[0-9A-Fa-f]{6}$/.test(data.color)) {
    throw new ValidationError('正しい色を選択してください');
  }

  // タグを正規化（小文字、#なし）
  const normalizedTag = data.name.trim().toLowerCase().replace(/^#/, '');

  // 同じタグが既に存在しないか確認
  const existingHashtag = await prisma.userHashtag.findFirst({
    where: {
      userId: data.userId,
      tag: normalizedTag,
    },
  });

  if (existingHashtag) {
    throw new ValidationError('同じ名前のハッシュタグが既に存在します');
  }

  // 現在のハッシュタグ数を取得して、新しいsortOrderを決定
  const maxSortOrder = await prisma.userHashtag.aggregate({
    where: {
      userId: data.userId,
    },
    _max: {
      sortOrder: true,
    },
  });

  const newSortOrder = (maxSortOrder._max.sortOrder ?? -1) + 1;

  // ハッシュタグを作成
  const hashtag = await prisma.userHashtag.create({
    data: {
      userId: data.userId,
      tag: normalizedTag,
      displayTag: data.name.trim(),
      color: data.color,
      sortOrder: newSortOrder,
    },
  });

  return hashtag;
}

/**
 * ハッシュタグを更新
 */
export async function updateHashtag(
  hashtagId: number,
  userId: number,
  data: UpdateHashtagRequest
) {
  // ハッシュタグが存在するか確認
  const hashtag = await prisma.userHashtag.findUnique({
    where: { id: hashtagId },
  });

  if (!hashtag) {
    throw new NotFoundError('ハッシュタグが見つかりません');
  }

  // ユーザーが所有しているか確認
  if (hashtag.userId !== userId) {
    throw new ValidationError('このハッシュタグを編集する権限がありません');
  }

  // 更新データのバリデーション
  const updateData: any = {};

  if (data.name !== undefined) {
    if (data.name.trim().length === 0) {
      throw new ValidationError('ハッシュタグ名を入力してください');
    }
    if (data.name.length > 50) {
      throw new ValidationError('ハッシュタグ名は50文字以内で入力してください');
    }

    // タグを正規化
    const normalizedTag = data.name.trim().toLowerCase().replace(/^#/, '');

    // 同じタグが既に存在しないか確認（自分以外）
    const existingHashtag = await prisma.userHashtag.findFirst({
      where: {
        userId,
        tag: normalizedTag,
        id: {
          not: hashtagId,
        },
      },
    });

    if (existingHashtag) {
      throw new ValidationError('同じ名前のハッシュタグが既に存在します');
    }

    updateData.tag = normalizedTag;
    updateData.displayTag = data.name.trim();
  }

  if (data.color !== undefined) {
    if (!/^#[0-9A-Fa-f]{6}$/.test(data.color)) {
      throw new ValidationError('正しい色を選択してください');
    }
    updateData.color = data.color;
  }

  // ハッシュタグを更新
  const updatedHashtag = await prisma.userHashtag.update({
    where: { id: hashtagId },
    data: updateData,
  });

  return updatedHashtag;
}

/**
 * ハッシュタグを削除
 */
export async function deleteHashtag(hashtagId: number, userId: number) {
  // ハッシュタグが存在するか確認
  const hashtag = await prisma.userHashtag.findUnique({
    where: { id: hashtagId },
  });

  if (!hashtag) {
    throw new NotFoundError('ハッシュタグが見つかりません');
  }

  // ユーザーが所有しているか確認
  if (hashtag.userId !== userId) {
    throw new ValidationError('このハッシュタグを削除する権限がありません');
  }

  // ハッシュタグを削除
  await prisma.userHashtag.delete({
    where: { id: hashtagId },
  });

  return { success: true };
}

/**
 * ハッシュタグの表示順序を変更
 */
export async function reorderHashtags(
  userId: number,
  hashtagIds: number[]
) {
  // 全てのハッシュタグがユーザーのものか確認
  const hashtags = await prisma.userHashtag.findMany({
    where: {
      id: {
        in: hashtagIds,
      },
    },
  });

  if (hashtags.length !== hashtagIds.length) {
    throw new ValidationError('一部のハッシュタグが見つかりません');
  }

  const allBelongToUser = hashtags.every((h) => h.userId === userId);
  if (!allBelongToUser) {
    throw new ValidationError('他のユーザーのハッシュタグが含まれています');
  }

  // トランザクションで順序を更新
  await prisma.$transaction(
    hashtagIds.map((id, index) =>
      prisma.userHashtag.update({
        where: { id },
        data: { sortOrder: index },
      })
    )
  );

  // 更新後のハッシュタグ一覧を返す
  return await getUserHashtags(userId);
}
