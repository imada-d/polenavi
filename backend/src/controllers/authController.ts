// 何を: 認証コントローラー（サインアップ、ログイン、トークン検証）
// なぜ: ユーザー認証機能を提供するため（httpOnly Cookie使用でXSS対策）

import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';
import { validateUsername } from '../utils/validateUsername';
import { sendVerificationEmail, sendLoginNotificationEmail } from '../services/emailService';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_ACCESS_EXPIRES_IN = '15m'; // アクセストークン: 15分
const JWT_REFRESH_EXPIRES_IN = '7d'; // リフレッシュトークン: 7日間

// アクセストークンとリフレッシュトークンを生成
const generateTokens = async (userId: number, email: string, username: string, role: string) => {
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

  // リフレッシュトークンをデータベースに保存
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7日後

  await prisma.refreshToken.create({
    data: {
      tokenId: refreshTokenId,
      userId,
      expiresAt
    }
  });

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

    // ユーザー名のバリデーション（文字種、長さ、不適切語チェック）
    const usernameValidation = validateUsername(username);
    if (!usernameValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: usernameValidation.error
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

    // ユーザー作成（メール未検証状態で）
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        username,
        displayName: displayName || username,
        role: 'user',
        isActive: true,
        emailVerified: false, // メール未検証
      },
    });

    // メール検証トークンを生成
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24時間有効

    // トークンをデータベースに保存
    await prisma.emailVerificationToken.create({
      data: {
        userId: user.id,
        token: verificationToken,
        tokenType: 'email_verification',
        email: user.email,
        expiresAt,
      },
    });

    // 検証メールを送信
    try {
      await sendVerificationEmail(user.email, user.username, verificationToken);
      console.log(`✅ [Signup] 検証メール送信成功: ${user.email}`);
    } catch (emailError: any) {
      console.error(`❌ [Signup] 検証メール送信失敗:`, emailError);
      // メール送信失敗してもユーザー作成は継続（後で再送信可能）
    }

    // 注意: メール検証が完了するまでログインできないため、トークンは発行しない
    return res.status(201).json({
      success: true,
      message: '登録完了！確認メールを送信しました。メール内のリンクをクリックして登録を完了してください。',
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        displayName: user.displayName,
        emailVerified: false,
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
        message: 'メールアドレス/IDとパスワードは必須です'
      });
    }

    // ユーザー検索（メールアドレスまたはユーザー名で検索）
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email },
          { username: email }, // emailフィールドにusernameが入る可能性
        ],
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'メールアドレス/IDまたはパスワードが正しくありません'
      });
    }

    // アカウントが無効化されているかチェック
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'このアカウントは無効化されています'
      });
    }

    // メールアドレス検証チェック（必須）
    if (!user.emailVerified) {
      return res.status(403).json({
        success: false,
        message: 'メールアドレスが未検証です。登録時に送信された確認メール内のリンクをクリックしてください。',
        code: 'EMAIL_NOT_VERIFIED',
        email: user.email,
      });
    }

    // パスワード検証
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'メールアドレス/IDまたはパスワードが正しくありません'
      });
    }

    // 最終ログイン日時を更新
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // トークン生成
    const { accessToken, refreshToken } = await generateTokens(
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

    // ログイン通知メールを送信（emailNotificationsがtrueの場合のみ）
    if (user.emailNotifications) {
      try {
        const ipAddress = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.ip || 'unknown';
        const userAgent = req.headers['user-agent'] || 'unknown';
        await sendLoginNotificationEmail(
          user.email,
          user.username,
          ipAddress,
          userAgent,
          new Date()
        );
        console.log(`✅ [Login] ログイン通知メール送信成功: ${user.email}`);
      } catch (emailError: any) {
        console.error(`❌ [Login] ログイン通知メール送信失敗:`, emailError);
        // メール送信失敗してもログインは継続
      }
    }

    return res.json({
      success: true,
      message: 'ログインに成功しました',
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        displayName: user.displayName,
        role: user.role,
        emailNotifications: user.emailNotifications,
        emailVerified: user.emailVerified,
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

    // データベース内のトークンを確認
    const storedToken = await prisma.refreshToken.findUnique({
      where: { tokenId: decoded.tokenId },
      include: { user: true }
    });

    if (!storedToken || storedToken.revoked || new Date() > storedToken.expiresAt) {
      // 無効なトークンの場合はCookieをクリア
      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      });
      return res.status(401).json({
        success: false,
        message: '無効なリフレッシュトークンです'
      });
    }

    const user = storedToken.user;

    if (!user || !user.isActive) {
      // 無効なユーザーの場合もCookieをクリア
      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      });
      return res.status(401).json({
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

    return res.json({
      success: true,
      accessToken,
    });
  } catch (error: any) {
    console.error('Refresh token error:', error);
    // エラーの場合もCookieをクリア
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
    return res.status(401).json({
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
        emailNotifications: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'ユーザーが見つかりません'
      });
    }

    return res.json({
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
        // データベースのリフレッシュトークンを無効化
        await prisma.refreshToken.updateMany({
          where: { tokenId: decoded.tokenId },
          data: {
            revoked: true,
            revokedAt: new Date()
          }
        });
      } catch (error) {
        // トークンが無効でも続行
        console.error('Token revocation error:', error);
      }
    }

    // Cookieをクリア
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    return res.json({
      success: true,
      message: 'ログアウトしました',
    });
  } catch (error: any) {
    console.error('Logout error:', error);
    return res.status(500).json({
      success: false,
      message: 'ログアウトに失敗しました',
      error: error.message,
    });
  }
};
