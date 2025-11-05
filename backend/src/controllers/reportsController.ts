// 何を: 通報・削除要請のコントローラー
// なぜ: ルーティングとビジネスロジックを分離するため

import { Request, Response, NextFunction } from 'express';
import * as reportService from '../services/reportService';

/**
 * 削除要請を送信
 *
 * POST /api/reports
 */
export async function createReport(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { reportType, targetId, reason, description } = req.body;

    // バリデーション
    if (!reportType || !targetId || !reason) {
      res.status(400).json({
        success: false,
        error: { message: '報告タイプ、対象ID、理由は必須です' },
      });
      return;
    }

    if (!description || description.trim().length === 0) {
      res.status(400).json({
        success: false,
        error: { message: '詳細説明を入力してください' },
      });
      return;
    }

    // 理由の妥当性チェック
    const validReasons = ['wrong_location', 'duplicate', 'removed', 'spam', 'other'];
    if (!validReasons.includes(reason)) {
      res.status(400).json({
        success: false,
        error: { message: '無効な理由が指定されました' },
      });
      return;
    }

    const result = await reportService.createReport({
      reportType,
      targetId: parseInt(targetId, 10),
      reason,
      description: description.trim(),
    });

    res.status(201).json({
      success: true,
      message: '削除要請を送信しました。管理者が確認いたします。',
      data: result,
    });
  } catch (error) {
    next(error);
  }
}
