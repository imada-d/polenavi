// 何を: メモ・ハッシュタグのコントローラー
// なぜ: APIリクエストを受け取り、メモサービスを呼び出すため

import { Request, Response, NextFunction } from 'express';
import * as memoService from '../services/memoService';
import { ValidationError } from '../utils/AppError';

/**
 * POST /api/pole-memos
 * メモを追加
 */
export const createMemo = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { poleId, hashtags, memoText, isPublic } = req.body;

    // 認証ユーザー情報を取得
    const userId = (req as any).user?.userId;
    const username = (req as any).user?.username;

    // バリデーション
    if (!poleId) {
      throw new ValidationError('poleIdは必須です');
    }

    const memo = await memoService.createMemo({
      poleId: parseInt(poleId, 10),
      hashtags: hashtags || [],
      memoText,
      createdBy: userId,
      createdByName: username || 'guest',
      isPublic: isPublic !== undefined ? isPublic : true,
    });

    res.status(201).json({
      success: true,
      data: { memo },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/pole-memos/:poleId
 * 電柱のメモ一覧を取得
 */
export const getMemosByPoleId = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { poleId } = req.params;

    const memos = await memoService.getMemosByPoleId(parseInt(poleId, 10));

    res.json({
      success: true,
      data: { memos },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/pole-memos/:memoId
 * メモを更新
 */
export const updateMemo = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { memoId } = req.params;
    const { hashtags, memoText, isPublic } = req.body;

    const memo = await memoService.updateMemo(parseInt(memoId, 10), {
      hashtags,
      memoText,
      isPublic,
    });

    res.json({
      success: true,
      data: { memo },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/pole-memos/:memoId
 * メモを削除
 */
export const deleteMemo = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { memoId } = req.params;

    const result = await memoService.deleteMemo(parseInt(memoId, 10));

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
