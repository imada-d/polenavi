// 何を: 通報・削除要請のビジネスロジック
// なぜ: コントローラーから分離して再利用性を高めるため

import { PrismaClient } from '@prisma/client';
import { NotFoundError } from '../utils/AppError';

const prisma = new PrismaClient();

/**
 * 削除要請のリクエストデータ
 */
export interface CreateReportRequest {
  reportType: string;
  targetId: number;
  reason: string;
  description: string;
}

/**
 * 削除要請を作成
 */
export async function createReport(data: CreateReportRequest) {
  // 対象の電柱が存在するか確認
  if (data.reportType === 'pole') {
    const pole = await prisma.pole.findUnique({
      where: { id: data.targetId },
    });

    if (!pole) {
      throw new NotFoundError('指定された電柱が見つかりません');
    }
  }

  // 削除要請を作成
  const report = await prisma.report.create({
    data: {
      reportType: data.reportType,
      targetId: data.targetId,
      reason: data.reason,
      description: data.description,
      reportedBy: null, // TODO: ログイン機能実装後にユーザーIDを設定
      reportedByName: 'ゲストユーザー',
      status: 'pending',
      autoHidden: false,
    },
  });

  return {
    id: report.id,
    reportType: report.reportType,
    targetId: report.targetId,
    reason: report.reason,
    status: report.status,
    createdAt: report.createdAt,
  };
}
