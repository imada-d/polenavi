// 何を: バグ報告のコントローラー
// なぜ: ユーザーからのバグ報告を処理し、管理者が確認できるようにするため

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { ValidationError } from '../utils/AppError';

const prisma = new PrismaClient();

/**
 * バグ報告を作成
 */
export async function createBugReport(req: Request, res: Response) {
  try {
    const { title, category, description, steps, environment, contactEmail } = req.body;

    // バリデーション
    if (!title || !category || !description) {
      throw new ValidationError('タイトル、カテゴリ、詳細は必須です');
    }

    // バグ報告を作成
    const bugReport = await prisma.bugReport.create({
      data: {
        title,
        category,
        description,
        steps: steps || null,
        environment: environment || null,
        contactEmail: contactEmail || null,
        status: 'open',
      },
    });

    console.log('🐛 バグ報告を作成:', bugReport.id);

    res.status(201).json({
      success: true,
      message: 'バグ報告を送信しました',
      data: {
        id: bugReport.id,
      },
    });
  } catch (error: any) {
    console.error('❌ バグ報告作成エラー:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      error: {
        code: error.code || 'INTERNAL_SERVER_ERROR',
        message: error.message || 'バグ報告の送信に失敗しました',
      },
    });
  }
}

/**
 * バグ報告一覧を取得（管理者のみ）
 */
export async function getAllBugReports(req: Request, res: Response) {
  try {
    const { status } = req.query;

    const bugReports = await prisma.bugReport.findMany({
      where: status ? { status: status as string } : undefined,
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json({
      success: true,
      data: bugReports,
    });
  } catch (error: any) {
    console.error('❌ バグ報告一覧取得エラー:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'バグ報告の取得に失敗しました',
      },
    });
  }
}

/**
 * バグ報告の詳細を取得（管理者のみ）
 */
export async function getBugReportById(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const bugReport = await prisma.bugReport.findUnique({
      where: { id: parseInt(id) },
    });

    if (!bugReport) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'バグ報告が見つかりません',
        },
      });
    }

    return res.json({
      success: true,
      data: bugReport,
    });
  } catch (error: any) {
    console.error('❌ バグ報告詳細取得エラー:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'バグ報告の取得に失敗しました',
      },
    });
  }
}

/**
 * バグ報告のステータスを更新（管理者のみ）
 */
export async function updateBugReportStatus(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['open', 'in_progress', 'resolved', 'closed'].includes(status)) {
      throw new ValidationError('無効なステータスです');
    }

    const bugReport = await prisma.bugReport.update({
      where: { id: parseInt(id) },
      data: {
        status,
        updatedAt: new Date(),
      },
    });

    console.log(`🔄 バグ報告ステータス更新: ${id} → ${status}`);

    res.json({
      success: true,
      message: 'ステータスを更新しました',
      data: bugReport,
    });
  } catch (error: any) {
    console.error('❌ バグ報告ステータス更新エラー:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      error: {
        code: error.code || 'INTERNAL_SERVER_ERROR',
        message: error.message || 'ステータスの更新に失敗しました',
      },
    });
  }
}
