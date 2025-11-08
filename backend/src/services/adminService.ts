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

/**
 * 通報一覧を取得
 */
export async function getReports(params: {
  page?: number;
  limit?: number;
  status?: 'pending' | 'reviewed' | 'resolved';
  reportType?: 'photo' | 'pole' | 'number';
  search?: string;
}) {
  const {
    page = 1,
    limit = 20,
    status,
    reportType,
    search,
  } = params;

  const skip = (page - 1) * limit;

  const where: any = {};

  if (status) {
    where.status = status;
  }

  if (reportType) {
    where.reportType = reportType;
  }

  if (search) {
    where.OR = [
      { reportedByName: { contains: search, mode: 'insensitive' } },
      { reason: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [reports, total] = await Promise.all([
    prisma.report.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        reportedByUser: {
          select: {
            id: true,
            username: true,
            displayName: true,
          },
        },
        reviewedByUser: {
          select: {
            id: true,
            username: true,
            displayName: true,
          },
        },
      },
    }),
    prisma.report.count({ where }),
  ]);

  return {
    reports,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * 通報詳細を取得
 */
export async function getReportDetail(reportId: number) {
  const report = await prisma.report.findUnique({
    where: { id: reportId },
    include: {
      reportedByUser: {
        select: {
          id: true,
          username: true,
          displayName: true,
          email: true,
        },
      },
      reviewedByUser: {
        select: {
          id: true,
          username: true,
          displayName: true,
        },
      },
    },
  });

  if (!report) {
    throw new NotFoundError('通報が見つかりません');
  }

  // 通報対象のデータを取得
  let targetData = null;
  if (report.reportType === 'photo') {
    targetData = await prisma.polePhoto.findUnique({
      where: { id: report.targetId },
      include: {
        uploadedByUser: {
          select: {
            id: true,
            username: true,
            displayName: true,
          },
        },
        pole: {
          select: {
            latitude: true,
            longitude: true,
            prefecture: true,
          },
        },
      },
    });
  } else if (report.reportType === 'number') {
    targetData = await prisma.poleNumber.findUnique({
      where: { id: report.targetId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
          },
        },
        pole: {
          select: {
            latitude: true,
            longitude: true,
            prefecture: true,
          },
        },
      },
    });
  } else if (report.reportType === 'pole') {
    targetData = await prisma.pole.findUnique({
      where: { id: report.targetId },
    });
  }

  return {
    ...report,
    targetData,
  };
}

/**
 * 通報を処理
 */
export async function reviewReport(
  reportId: number,
  reviewedBy: number,
  data: {
    status: 'reviewed' | 'resolved';
    resolution: string;
    action?: 'approve' | 'reject' | 'keep' | 'delete' | 'hide' | 'no_action';
    issueWarning?: boolean; // 警告を発行するか
  }
) {
  const report = await prisma.report.findUnique({
    where: { id: reportId },
    include: {
      reportedByUser: true,
    },
  });

  if (!report) {
    throw new NotFoundError('通報が見つかりません');
  }

  // 写真の投稿者を取得
  let photoUploader: any = null;
  if (report.reportType === 'photo') {
    const photo = await prisma.polePhoto.findUnique({
      where: { id: report.targetId },
      include: { uploadedByUser: true },
    });
    photoUploader = photo?.uploadedByUser;
  }

  // 通報ステータスを更新
  const updatedReport = await prisma.report.update({
    where: { id: reportId },
    data: {
      status: data.status,
      resolution: data.resolution,
      reviewedBy,
      reviewedAt: new Date(),
    },
  });

  // アクションを実行
  if (report.reportType === 'photo') {
    // OK判定（通報を却下、写真を残す）
    if (data.action === 'keep') {
      // 既に非表示になっている場合は表示に戻す
      await prisma.polePhoto.update({
        where: { id: report.targetId },
        data: {
          isHidden: false,
          hiddenReason: null,
        },
      });
    }
    // NG判定（写真を削除し、投稿者に警告）
    else if (data.action === 'reject') {
      await prisma.polePhoto.update({
        where: { id: report.targetId },
        data: {
          deletedAt: new Date(),
          deletedBy: reviewedBy,
          deletedReason: `不適切なコンテンツとして削除: ${data.resolution}`,
        },
      });

      // 投稿者に警告を発行
      if (photoUploader) {
        const newWarningCount = (photoUploader.warningCount || 0) + 1;
        const shouldBan = newWarningCount >= 5;

        await prisma.user.update({
          where: { id: photoUploader.id },
          data: {
            warningCount: newWarningCount,
            uploadBanned: shouldBan,
            bannedAt: shouldBan ? new Date() : undefined,
            banReason: shouldBan ? `不適切なコンテンツの投稿により警告が5回に達しました` : undefined,
          },
        });
      }
    }
    // 従来の削除アクション（下位互換）
    else if (data.action === 'delete') {
      await prisma.polePhoto.update({
        where: { id: report.targetId },
        data: {
          deletedAt: new Date(),
          deletedBy: reviewedBy,
          deletedReason: `通報により削除: ${data.resolution}`,
        },
      });

      // 警告を発行する場合
      if (data.issueWarning && photoUploader) {
        const newWarningCount = (photoUploader.warningCount || 0) + 1;
        const shouldBan = newWarningCount >= 5;

        await prisma.user.update({
          where: { id: photoUploader.id },
          data: {
            warningCount: newWarningCount,
            uploadBanned: shouldBan,
            bannedAt: shouldBan ? new Date() : undefined,
            banReason: shouldBan ? `不適切なコンテンツの投稿により警告が5回に達しました` : undefined,
          },
        });
      }
    }
    // 非表示
    else if (data.action === 'hide') {
      await prisma.polePhoto.update({
        where: { id: report.targetId },
        data: {
          isHidden: true,
          hiddenReason: `通報により非表示: ${data.resolution}`,
        },
      });
    }
  }

  return {
    ...updatedReport,
    uploaderWarningCount: photoUploader?.warningCount,
    uploaderBanned: photoUploader?.uploadBanned,
  };
}

/**
 * 通報を作成（ユーザーからの通報）
 */
export async function createReport(data: {
  reportType: 'photo' | 'pole' | 'number';
  targetId: number;
  reason: string;
  description?: string;
  reportedBy?: number;
  reportedByName: string;
}) {
  // 対象が存在するか確認
  if (data.reportType === 'photo') {
    const photo = await prisma.polePhoto.findUnique({
      where: { id: data.targetId },
    });
    if (!photo) {
      throw new NotFoundError('通報対象の写真が見つかりません');
    }

    // 不適切なコンテンツの通報の場合、自動で非表示にする
    if (data.reason === 'inappropriate') {
      await prisma.polePhoto.update({
        where: { id: data.targetId },
        data: {
          isHidden: true,
          hiddenReason: '不適切なコンテンツとして通報されたため、管理者の確認まで非表示',
        },
      });
    }
  } else if (data.reportType === 'number') {
    const poleNumber = await prisma.poleNumber.findUnique({
      where: { id: data.targetId },
    });
    if (!poleNumber) {
      throw new NotFoundError('通報対象の電柱番号が見つかりません');
    }
  } else if (data.reportType === 'pole') {
    const pole = await prisma.pole.findUnique({
      where: { id: data.targetId },
    });
    if (!pole) {
      throw new NotFoundError('通報対象の電柱が見つかりません');
    }
  }

  const report = await prisma.report.create({
    data: {
      ...data,
      autoHidden: data.reportType === 'photo' && data.reason === 'inappropriate',
    },
  });

  return report;
}

/**
 * 電柱を削除（管理者のみ）
 */
export async function deletePole(poleId: number) {
  const pole = await prisma.pole.findUnique({
    where: { id: poleId },
  });

  if (!pole) {
    throw new NotFoundError('電柱が見つかりません');
  }

  // 関連する写真を論理削除
  await prisma.polePhoto.updateMany({
    where: { poleId },
    data: {
      deletedAt: new Date(),
      deletedReason: '管理者により電柱が削除されたため',
      autoDeleted: true,
    },
  });

  // 電柱番号、メモは物理削除（またはカスケード削除）
  await prisma.poleMemo.deleteMany({ where: { poleId } });
  await prisma.poleNumber.deleteMany({ where: { poleId } });

  // 電柱を物理削除
  await prisma.pole.delete({ where: { id: poleId } });

  return { success: true };
}

/**
 * ユーザーを削除（管理者のみ）
 * アカウント、メモ、ハッシュタグを削除し、投稿データ（電柱、写真）は残す
 */
export async function deleteUser(userId: number) {
  // ユーザーが存在するか確認
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new NotFoundError('ユーザーが見つかりません');
  }

  // トランザクションで削除
  await prisma.$transaction(async (tx) => {
    // 1. リフレッシュトークンを削除
    await tx.refreshToken.deleteMany({
      where: { userId },
    });

    // 2. ユーザーレポートを削除（通報者として）
    await tx.report.deleteMany({
      where: { reportedBy: userId },
    });

    // 3. ユーザーハッシュタグを削除
    await tx.userHashtag.deleteMany({
      where: { userId },
    });

    // 4. ユーザーのメモを削除（ハッシュタグはメモ内に配列として保存されている）
    await tx.poleMemo.deleteMany({
      where: { createdBy: userId },
    });

    // 5. ユーザーアカウントを削除
    // 注意: registeredBy, uploadedBy等の外部キーは
    // nullableまたはonDelete: SetNullに設定されている前提
    await tx.user.delete({
      where: { id: userId },
    });
  });

  return { success: true, message: 'ユーザーを削除しました（電柱・写真は保持されます）' };
}
