// 何を: JWT認証ミドルウェア
// なぜ: 保護されたルートへのアクセスを制御するため

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

interface JwtPayload {
  userId: number;
  email: string;
  username: string;
  role: string;
}

// JWT認証ミドルウェア
export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  try {
    // AuthorizationヘッダーからBearerトークンを取得
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // "Bearer TOKEN"

    if (!token) {
      return res.status(401).json({
        success: false,
        message: '認証トークンが提供されていません'
      });
    }

    // トークンを検証
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        if (err.name === 'TokenExpiredError') {
          return res.status(401).json({
            success: false,
            message: 'トークンの有効期限が切れています'
          });
        }
        return res.status(403).json({
          success: false,
          message: '無効なトークンです'
        });
      }

      // リクエストオブジェクトにユーザー情報を追加
      (req as any).user = decoded as JwtPayload;
      return next();
    });
  } catch (error: any) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: '認証処理に失敗しました',
      error: error.message,
    });
  }
};

// オプショナル認証ミドルウェア（トークンがあれば検証、なくてもOK）
export const optionalAuth = (req: Request, _res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      // トークンがなくても次へ進む
      return next();
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (!err && decoded) {
        // トークンが有効な場合のみユーザー情報を追加
        (req as any).user = decoded as JwtPayload;
      }
      next();
    });
  } catch (error) {
    // エラーが発生してもリクエストを続行
    next();
  }
};

// 管理者権限チェックミドルウェア
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;

  if (!user || (user.role !== 'admin' && user.role !== 'moderator')) {
    return res.status(403).json({
      success: false,
      message: '管理者権限が必要です'
    });
  }

  return next();
};
