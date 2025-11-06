// 何を: 認証コントローラー（サインアップ、ログイン、トークン検証）
// なぜ: ユーザー認証機能を提供するため（httpOnly Cookie使用でXSS対策）

import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_ACCESS_EXPIRES_IN = '15m'; // アクセストークン: 15分
const JWT_REFRESH_EXPIRES_IN = '7d'; // リフレッシュトークン: 7日間

// リフレッシュトークンをメモリに保存（本番環境ではRedisを使用）
const refreshTokens = new Map<string, { userId: number; email: string }>();

// アクセストークンとリフレッシュトークンを生成
const generateTokens = (userId: number, email: string, username: string, role: string) => {
  // アクセストークン（短時間有効）
  const accessToken = jwt.sign(
    { userId, email, username, role },
    JWT_SECRET,
    { expiresIn: JWT_ACCESS_EXPIRES_IN }
  );

  // リフレッシュトークン（長時間有効）
  const refreshTokenId = uuidv4();
  const refreshToken = jwt.sign(
    { userId, email, tokenId: refreshTokenId },
    JWT_SECRET,
    { expiresIn: JWT_REFRESH_EXPIRES_IN }
  );

  // リフレッシュトークンをメモリに保存
  refreshTokens.set(refreshTokenId, { userId, email });

  return { accessToken, refreshToken, refreshTokenId };
};

// サインアップ
export const signup = async (req: Request, res: Response) => {
  try {
    const { email, password, username, displayName } = req.body;

    // バリデーション
    if (!email || !password || !username) {
      return res.status(400).json({
        success: false,
        message: 'メールアドレス、パスワード、ユーザー名は必須です'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'パスワードは6文字以上である必要があります'
      });
    }

    // メールアドレスとユーザー名の重複チェック
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email },
          { username: username },
        ],
      },
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(400).json({
          success: false,
          message: 'このメールアドレスは既に登録されています'
        });
      }
      if (existingUser.username === username) {
        return res.status(400).json({
          success: false,
          message: 'このユーザー名は既に使用されています'
        });
      }
    }

    // パスワードのハッシュ化
    const passwordHash = await bcrypt.hash(password, 10);

    // ユーザー作成
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        username,
        displayName: displayName || username,
        role: 'user',
        isActive: true,
      },
    });

    // トークン生成
    const { accessToken, refreshToken } = generateTokens(
      user.id,
      user.email,
      user.username,
      user.role
    );

    // リフレッシュトークンをhttpOnly Cookieに設定
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true, // JavaScriptからアクセス不可（XSS対策）
      secure: process.env.NODE_ENV === 'production', // HTTPS必須（本番環境）
      sameSite: 'strict', // CSRF対策
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7日間
    });

    res.status(201).json({
      success: true,
      message: 'ユーザー登録が完了しました',
      accessToken, // フロントエンドはこれをメモリで管理
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        displayName: user.displayName,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error: any) {
    console.error('Signup error:', error);
    return res.status(500).json({
      success: false,
      message: 'ユーザー登録に失敗しました',
      error: error.message,
    });
  }
};

// ログイン
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // バリデーション
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'メールアドレスとパスワードは必須です'
      });
    }

    // ユーザー検索
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'メールアドレスまたはパスワードが正しくありません'
      });
    }

    // アカウントが無効化されているかチェック
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'このアカウントは無効化されています'
      });
    }

    // パスワード検証
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'メールアドレスまたはパスワードが正しくありません'
      });
    }

    // トークン生成
    const { accessToken, refreshToken } = generateTokens(
      user.id,
      user.email,
      user.username,
      user.role
    );

    // リフレッシュトークンをhttpOnly Cookieに設定
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      message: 'ログインに成功しました',
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        displayName: user.displayName,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'ログインに失敗しました',
      error: error.message,
    });
  }
};

// リフレッシュトークンを使って新しいアクセストークンを取得
export const refresh = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'リフレッシュトークンが見つかりません'
      });
    }

    // トークン検証
    const decoded = jwt.verify(refreshToken, JWT_SECRET) as {
      userId: number;
      email: string;
      tokenId: string;
    };

    // メモリ内のトークンを確認
    if (!refreshTokens.has(decoded.tokenId)) {
      return res.status(403).json({
        success: false,
        message: '無効なリフレッシュトークンです'
      });
    }

    // ユーザー情報を取得
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user || !user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'ユーザーが見つからないか無効化されています'
      });
    }

    // 新しいアクセストークンを生成
    const accessToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: JWT_ACCESS_EXPIRES_IN }
    );

    res.json({
      success: true,
      accessToken,
    });
  } catch (error: any) {
    console.error('Refresh token error:', error);
    return res.status(403).json({
      success: false,
      message: 'トークンの更新に失敗しました',
      error: error.message,
    });
  }
};

// 現在のユーザー情報を取得（トークン検証）
export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: '認証が必要です'
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        role: true,
        homePrefecture: true,
        planType: true,
        emailVerified: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'ユーザーが見つかりません'
      });
    }

    res.json({
      success: true,
      user,
    });
  } catch (error: any) {
    console.error('Get current user error:', error);
    return res.status(500).json({
      success: false,
      message: 'ユーザー情報の取得に失敗しました',
      error: error.message,
    });
  }
};

// ログアウト
export const logout = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
      try {
        const decoded = jwt.verify(refreshToken, JWT_SECRET) as {
          tokenId: string;
        };
        // メモリからリフレッシュトークンを削除
        refreshTokens.delete(decoded.tokenId);
      } catch (error) {
        // トークンが無効でも続行
      }
    }

    // Cookieをクリア
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    res.json({
      success: true,
      message: 'ログアウトしました',
    });
  } catch (error: any) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'ログアウトに失敗しました',
      error: error.message,
    });
  }
};
