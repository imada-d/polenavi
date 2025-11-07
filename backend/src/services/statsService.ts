// 何を: 統計データ取得サービス
// なぜ: 公開統計と管理者統計のビジネスロジックを集約

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * 公開統計データを取得
 */
export async function getPublicStats() {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // 並列で各統計を取得
  const [
    totalUsers,
    totalPoles,
    totalPhotos,
    totalMemos,
    todayUsers,
    todayPoles,
    activeUsers24h,
    activeUsers7d,
    activeUsers30d,
  ] = await Promise.all([
    // 総ユーザー数
    prisma.user.count({
      where: { isActive: true },
    }),

    // 総電柱数
    prisma.pole.count(),

    // 総写真数（削除されていないもの）
    prisma.polePhoto.count({
      where: { deletedAt: null },
    }),

    // 総メモ数
    prisma.poleMemo.count(),

    // 今日の新規ユーザー
    prisma.user.count({
      where: {
        createdAt: { gte: today },
        isActive: true,
      },
    }),

    // 今日の新規電柱
    prisma.pole.count({
      where: {
        createdAt: { gte: today },
      },
    }),

    // アクティブユーザー（過去24時間）
    getActiveUsers(24),

    // アクティブユーザー（過去7日）
    getActiveUsers(7 * 24),

    // アクティブユーザー（過去30日）
    getActiveUsers(30 * 24),
  ]);

  return {
    totals: {
      users: totalUsers,
      poles: totalPoles,
      photos: totalPhotos,
      memos: totalMemos,
    },
    today: {
      newUsers: todayUsers,
      newPoles: todayPoles,
    },
    activeUsers: {
      last24h: activeUsers24h,
      last7d: activeUsers7d,
      last30d: activeUsers30d,
    },
  };
}

/**
 * 管理者統計データを取得（公開統計 + 詳細データ）
 */
export async function getAdminStats() {
  const publicStats = await getPublicStats();

  // 日別登録推移（過去30日）
  const dailyStats = await getDailyRegistrations(30);

  // 都道府県別集計
  const prefectureStats = await getPrefectureStats();

  // 追加の管理者専用統計
  const [totalPoleNumbers, totalReports, pendingReports, inactiveUsers] =
    await Promise.all([
      // 総電柱番号数
      prisma.poleNumber.count(),

      // 総通報数
      prisma.report.count(),

      // 未処理の通報数
      prisma.report.count({
        where: { status: 'pending' },
      }),

      // 非アクティブユーザー数
      prisma.user.count({
        where: { isActive: false },
      }),
    ]);

  return {
    ...publicStats,
    totals: {
      ...publicStats.totals,
      poleNumbers: totalPoleNumbers,
      reports: totalReports,
    },
    admin: {
      pendingReports,
      inactiveUsers,
    },
    daily: dailyStats,
    byPrefecture: prefectureStats,
  };
}

/**
 * アクティブユーザー数を取得
 * @param hours 過去何時間以内の活動を見るか
 */
async function getActiveUsers(hours: number): Promise<number> {
  const cutoffTime = new Date();
  cutoffTime.setHours(cutoffTime.getHours() - hours);

  // 電柱番号登録、写真投稿、メモ作成のいずれかの活動があったユーザー
  const activeUserIds = new Set<number>();

  // 電柱番号を登録したユーザー
  const poleNumberUsers = await prisma.poleNumber.findMany({
    where: {
      createdAt: { gte: cutoffTime },
      registeredBy: { not: null },
    },
    select: { registeredBy: true },
    distinct: ['registeredBy'],
  });
  poleNumberUsers.forEach((pn) => {
    if (pn.registeredBy) activeUserIds.add(pn.registeredBy);
  });

  // 写真を投稿したユーザー
  const photoUsers = await prisma.polePhoto.findMany({
    where: {
      createdAt: { gte: cutoffTime },
      uploadedBy: { not: null },
    },
    select: { uploadedBy: true },
    distinct: ['uploadedBy'],
  });
  photoUsers.forEach((photo) => {
    if (photo.uploadedBy) activeUserIds.add(photo.uploadedBy);
  });

  // メモを作成したユーザー
  const memoUsers = await prisma.poleMemo.findMany({
    where: {
      createdAt: { gte: cutoffTime },
      createdBy: { not: null },
    },
    select: { createdBy: true },
    distinct: ['createdBy'],
  });
  memoUsers.forEach((memo) => {
    if (memo.createdBy) activeUserIds.add(memo.createdBy);
  });

  return activeUserIds.size;
}

/**
 * 日別登録推移を取得
 * @param days 過去何日分のデータを取得するか
 */
async function getDailyRegistrations(days: number) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  startDate.setHours(0, 0, 0, 0);

  // Raw SQLで日別集計
  const dailyPoles: Array<{ date: Date; count: bigint }> = await prisma.$queryRaw`
    SELECT
      DATE(created_at) as date,
      COUNT(*)::bigint as count
    FROM poles
    WHERE created_at >= ${startDate}
    GROUP BY DATE(created_at)
    ORDER BY date ASC
  `;

  const dailyUsers: Array<{ date: Date; count: bigint }> = await prisma.$queryRaw`
    SELECT
      DATE(created_at) as date,
      COUNT(*)::bigint as count
    FROM users
    WHERE created_at >= ${startDate} AND is_active = true
    GROUP BY DATE(created_at)
    ORDER BY date ASC
  `;

  // 日付ごとにマージ
  const dateMap = new Map<string, { date: string; poles: number; users: number }>();

  dailyPoles.forEach((row) => {
    const dateStr = row.date.toISOString().split('T')[0];
    dateMap.set(dateStr, {
      date: dateStr,
      poles: Number(row.count),
      users: 0,
    });
  });

  dailyUsers.forEach((row) => {
    const dateStr = row.date.toISOString().split('T')[0];
    const existing = dateMap.get(dateStr);
    if (existing) {
      existing.users = Number(row.count);
    } else {
      dateMap.set(dateStr, {
        date: dateStr,
        poles: 0,
        users: Number(row.count),
      });
    }
  });

  return Array.from(dateMap.values()).sort((a, b) =>
    a.date.localeCompare(b.date)
  );
}

/**
 * 都道府県別統計を取得
 */
async function getPrefectureStats() {
  const stats = await prisma.pole.groupBy({
    by: ['prefecture'],
    _count: {
      id: true,
    },
    where: {
      prefecture: {
        not: null,
      },
    },
    orderBy: {
      _count: {
        id: 'desc',
      },
    },
  });

  return stats.map((stat) => ({
    prefecture: stat.prefecture,
    count: stat._count.id,
  }));
}
