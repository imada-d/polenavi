// 何を: 統計データ取得コントローラー
// なぜ: 公開統計と管理者統計のエンドポイント提供

import { Request, Response, NextFunction } from 'express';
import * as statsService from '../services/statsService';

/**
 * 公開統計データを取得（認証不要）
 */
export async function getPublicStats(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const stats = await statsService.getPublicStats();

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * 管理者統計データを取得（管理者のみ）
 */
export async function getAdminStats(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const stats = await statsService.getAdminStats();

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
}
