// 何を: ハッシュタグAPIのコントローラー
// なぜ: ハッシュタグ管理のリクエストを処理するため

import { Request, Response } from 'express';
import * as hashtagService from '../services/hashtagService';
import { AppError } from '../utils/AppError';

/**
 * ユーザーのハッシュタグ一覧を取得
 * GET /api/hashtags
 */
export async function getUserHashtags(req: Request, res: Response) {
  try {
    const userId = (req as any).user.userId;

    const hashtags = await hashtagService.getUserHashtags(userId);

    res.json({
      success: true,
      data: { hashtags },
    });
  } catch (error: any) {
    console.error('ハッシュタグ一覧取得エラー:', error);
    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'ハッシュタグの取得に失敗しました',
      });
    }
  }
}

/**
 * ハッシュタグを作成
 * POST /api/hashtags
 */
export async function createHashtag(req: Request, res: Response) {
  try {
    const userId = (req as any).user.userId;
    const { name, color } = req.body;

    const hashtag = await hashtagService.createHashtag({
      userId,
      name,
      color,
    });

    res.status(201).json({
      success: true,
      data: { hashtag },
    });
  } catch (error: any) {
    console.error('ハッシュタグ作成エラー:', error);
    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'ハッシュタグの作成に失敗しました',
      });
    }
  }
}

/**
 * ハッシュタグを更新
 * PUT /api/hashtags/:id
 */
export async function updateHashtag(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).user.userId;
    const hashtagId = parseInt(req.params.id);
    const { name, color } = req.body;

    if (isNaN(hashtagId)) {
      res.status(400).json({
        success: false,
        message: '無効なハッシュタグIDです',
      });
      return;
    }

    const hashtag = await hashtagService.updateHashtag(hashtagId, userId, {
      name,
      color,
    });

    res.json({
      success: true,
      data: { hashtag },
    });
  } catch (error: any) {
    console.error('ハッシュタグ更新エラー:', error);
    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'ハッシュタグの更新に失敗しました',
      });
    }
  }
}

/**
 * ハッシュタグを削除
 * DELETE /api/hashtags/:id
 */
export async function deleteHashtag(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).user.userId;
    const hashtagId = parseInt(req.params.id);

    if (isNaN(hashtagId)) {
      res.status(400).json({
        success: false,
        message: '無効なハッシュタグIDです',
      });
      return;
    }

    await hashtagService.deleteHashtag(hashtagId, userId);

    res.json({
      success: true,
      data: { message: 'ハッシュタグを削除しました' },
    });
  } catch (error: any) {
    console.error('ハッシュタグ削除エラー:', error);
    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'ハッシュタグの削除に失敗しました',
      });
    }
  }
}

/**
 * ハッシュタグの表示順序を変更
 * PUT /api/hashtags/reorder
 */
export async function reorderHashtags(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).user.userId;
    const { hashtagIds } = req.body;

    if (!Array.isArray(hashtagIds)) {
      res.status(400).json({
        success: false,
        message: 'hashtagIdsは配列である必要があります',
      });
      return;
    }

    const hashtags = await hashtagService.reorderHashtags(userId, hashtagIds);

    res.json({
      success: true,
      data: { hashtags },
    });
  } catch (error: any) {
    console.error('ハッシュタグ並び替えエラー:', error);
    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'ハッシュタグの並び替えに失敗しました',
      });
    }
  }
}
