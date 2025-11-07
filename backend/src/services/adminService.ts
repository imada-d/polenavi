// 何を: 管理者機能のサービスロジック
// なぜ: ユーザー管理、コンテンツ管理などの管理者向け機能を提供

import { PrismaClient } from '@prisma/client';
import { ValidationError, NotFoundError } from '../utils/AppError';

const prisma = new PrismaClient();

/**
 * ユーザー一覧を取得
 */
export async function getUsers(params: {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: 'createdAt' | 'username' | 'email';
  sortOrder?: 'asc' | 'desc';
  role?: string;
  isActive?: boolean;
}) {
  const {
    page = 1,
    limit = 20,
    search,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    role,
    isActive,
  } = params;

  const skip = (page - 1) * limit;

  // 検索条件の構築
  const where: any = {};

  if (search) {
    where.OR = [
      { username: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { displayName: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (role) {
    where.role = role;
  }

  if (isActive !== undefined) {
    where.isActive = isActive;
  }

  // ユーザー一覧とトータル件数を並列取得
  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        role: true,
        isActive: true,
        emailVerified: true,
        homePrefecture: true,
        planType: true,
        createdAt: true,
        _count: {
          select: {
            poleNumbers: true,
            uploadedPhotos: {
              where: { deletedAt: null },
            },
            memos: true,
          },
        },
      },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    users: users.map((user) => ({
      ...user,
      stats: {
        poles: user._count.poleNumbers,
        photos: user._count.uploadedPhotos,
        memos: user._count.memos,
      },
      _count: undefined, // _countを除外
    })),
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * ユーザー詳細情報を取得
 */
export async function getUserDetail(userId: number) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      poleNumbers: {
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          pole: {
            select: {
              latitude: true,
              longitude: true,
            },
          },
        },
      },
      uploadedPhotos: {
        where: { deletedAt: null },
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          photoThumbnailUrl: true,
          photoType: true,
          createdAt: true,
          poleId: true,
        },
      },
      memos: {
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          hashtags: true,
          memoText: true,
          createdAt: true,
          poleId: true,
        },
      },
      _count: {
        select: {
          poleNumbers: true,
          uploadedPhotos: {
            where: { deletedAt: null },
          },
          memos: true,
          reportsCreated: true,
        },
      },
    },
  });

  if (!user) {
    throw new NotFoundError('ユーザーが見つかりません');
  }

  return {
    ...user,
    stats: {
      poles: user._count.poleNumbers,
      photos: user._count.uploadedPhotos,
      memos: user._count.memos,
      reports: user._count.reportsCreated,
    },
    _count: undefined,
  };
}

/**
 * ユーザー情報を更新
 */
export async function updateUser(
  userId: number,
  data: {
    role?: string;
    isActive?: boolean;
    emailVerified?: boolean;
  }
) {
  // バリデーション
  if (data.role && !['user', 'moderator', 'admin'].includes(data.role)) {
    throw new ValidationError('無効なroleです');
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data,
    select: {
      id: true,
      email: true,
      username: true,
      role: true,
      isActive: true,
      emailVerified: true,
    },
  });

  return user;
}

/**
 * ユーザーのアクティビティログを取得
 */
export async function getUserActivity(userId: number, days: number = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const [poleNumbers, photos, memos] = await Promise.all([
    // 電柱番号登録
    prisma.poleNumber.findMany({
      where: {
        registeredBy: userId,
        createdAt: { gte: cutoffDate },
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        poleNumber: true,
        createdAt: true,
        pole: {
          select: {
            latitude: true,
            longitude: true,
            prefecture: true,
          },
        },
      },
    }),

    // 写真投稿
    prisma.polePhoto.findMany({
      where: {
        uploadedBy: userId,
        createdAt: { gte: cutoffDate },
        deletedAt: null,
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        photoType: true,
        createdAt: true,
        poleId: true,
      },
    }),

    // メモ作成
    prisma.poleMemo.findMany({
      where: {
        createdBy: userId,
        createdAt: { gte: cutoffDate },
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        hashtags: true,
        createdAt: true,
        poleId: true,
      },
    }),
  ]);

  // アクティビティを時系列でマージ
  const activities: Array<{
    type: 'pole' | 'photo' | 'memo';
    createdAt: Date;
    data: any;
  }> = [
    ...poleNumbers.map((pn) => ({
      type: 'pole' as const,
      createdAt: pn.createdAt,
      data: pn,
    })),
    ...photos.map((photo) => ({
      type: 'photo' as const,
      createdAt: photo.createdAt,
      data: photo,
    })),
    ...memos.map((memo) => ({
      type: 'memo' as const,
      createdAt: memo.createdAt,
      data: memo,
    })),
  ];

  // 時系列でソート
  activities.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  return activities;
}
