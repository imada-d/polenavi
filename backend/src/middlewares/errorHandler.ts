// 何を: エラーハンドリングミドルウェア
// なぜ: エラーレスポンスを統一するため

import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import { Prisma } from '@prisma/client';

/**
 * エラーハンドリングミドルウェア
 *
 * 全てのエラーをキャッチして適切なレスポンスを返す
 */
export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // AppErrorの場合
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
      },
    });
    return;
  }

  // Prismaエラーの場合
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    handlePrismaError(err, res);
    return;
  }

  // 予期しないエラー
  console.error('予期しないエラー:', err);
  res.status(500).json({
    success: false,
    error: {
      code: 'SERVER_ERROR',
      message:
        process.env.NODE_ENV === 'development'
          ? err.message
          : 'サーバーエラーが発生しました',
    },
  });
}

/**
 * Prismaエラーを適切なレスポンスに変換
 */
function handlePrismaError(err: Prisma.PrismaClientKnownRequestError, res: Response): void {
  switch (err.code) {
    // 重複エラー
    case 'P2002':
      res.status(409).json({
        success: false,
        error: {
          code: 'DUPLICATE',
          message: 'この番号は既に登録されています',
          field: err.meta?.target,
        },
      });
      break;

    // 外部キー制約エラー
    case 'P2003':
      res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: '指定されたIDが見つかりません',
        },
      });
      break;

    // レコードが見つからない
    case 'P2025':
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'リソースが見つかりません',
        },
      });
      break;

    // その他のPrismaエラー
    default:
      console.error('Prismaエラー:', err);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'データベースエラーが発生しました',
        },
      });
  }
}

/**
 * 404エラーハンドラー
 */
export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `${req.method} ${req.path} が見つかりません`,
    },
  });
}
