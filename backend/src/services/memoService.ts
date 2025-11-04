// 何を: メモ・ハッシュタグのビジネスロジック
// なぜ: メモの作成、取得、更新を行うため

import { PrismaClient } from '@prisma/client';
import { NotFoundError } from '../utils/AppError';

const prisma = new PrismaClient();

/**
 * メモ作成のリクエストデータ
 */
export interface CreateMemoRequest {
  poleId: number;
  hashtags: string[];
  memoText?: string;
  createdBy?: number;
  createdByName: string;
  isPublic?: boolean;
}

/**
 * メモ更新のリクエストデータ
 */
export interface UpdateMemoRequest {
  hashtags?: string[];
  memoText?: string;
  isPublic?: boolean;
}

/**
 * メモを作成
 */
export async function createMemo(data: CreateMemoRequest) {
  // 電柱が存在するか確認
  const pole = await prisma.pole.findUnique({
    where: { id: data.poleId },
  });

  if (!pole) {
    throw new NotFoundError('電柱が見つかりません');
  }

  // メモを作成
  const memo = await prisma.poleMemo.create({
    data: {
      poleId: data.poleId,
      hashtags: data.hashtags || [],
      memoText: data.memoText,
      createdBy: data.createdBy,
      createdByName: data.createdByName,
      isPublic: data.isPublic ?? true,
    },
  });

  return memo;
}

/**
 * 電柱のメモ一覧を取得
 */
export async function getMemosByPoleId(poleId: number) {
  const memos = await prisma.poleMemo.findMany({
    where: {
      poleId,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return memos;
}

/**
 * メモを更新
 */
export async function updateMemo(memoId: number, data: UpdateMemoRequest) {
  const memo = await prisma.poleMemo.findUnique({
    where: { id: memoId },
  });

  if (!memo) {
    throw new NotFoundError('メモが見つかりません');
  }

  const updatedMemo = await prisma.poleMemo.update({
    where: { id: memoId },
    data: {
      hashtags: data.hashtags,
      memoText: data.memoText,
      isPublic: data.isPublic,
    },
  });

  return updatedMemo;
}

/**
 * メモを削除
 */
export async function deleteMemo(memoId: number) {
  const memo = await prisma.poleMemo.findUnique({
    where: { id: memoId },
  });

  if (!memo) {
    throw new NotFoundError('メモが見つかりません');
  }

  await prisma.poleMemo.delete({
    where: { id: memoId },
  });

  return { success: true };
}
