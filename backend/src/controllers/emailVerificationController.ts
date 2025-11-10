// 何を: メール検証コントローラー
// なぜ: メール検証、パスワードリセット、メールアドレス変更機能を提供するため

import { Request, Response } from 'express';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendEmailChangeEmail,
  sendWelcomeEmail,
} from '../services/emailService';

const prisma = new PrismaClient();

/**
 * 何を: メールアドレスを検証する
 * なぜ: ユーザーがメールアドレスを確認してログインできるようにするため
 */
export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { token } = req.query;

    if (!token || typeof token !== 'string') {
      return res.status(400).json({
        success: false,
        message: '検証トークンが必要です',
      });
    }

    // トークンを検索
    const verificationToken = await prisma.emailVerificationToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!verificationToken) {
      return res.status(400).json({
        success: false,
        message: '無効な検証トークンです',
      });
    }

    // トークンタイプチェック
    if (verificationToken.tokenType !== 'email_verification') {
      return res.status(400).json({
        success: false,
        message: 'このトークンはメール検証用ではありません',
      });
    }

    // 既に使用済みかチェック
    if (verificationToken.usedAt) {
      return res.status(400).json({
        success: false,
        message: 'このトークンは既に使用されています',
      });
    }

    // 有効期限チェック
    if (new Date() > verificationToken.expiresAt) {
      return res.status(400).json({
        success: false,
        message: 'このトークンは有効期限切れです',
        code: 'TOKEN_EXPIRED',
        email: verificationToken.user.email,
      });
    }

    // ユーザーのメールアドレスを検証済みにする
    await prisma.user.update({
      where: { id: verificationToken.userId },
      data: {
        emailVerified: true,
        emailVerifiedAt: new Date(),
      },
    });

    // トークンを使用済みにする
    await prisma.emailVerificationToken.update({
      where: { id: verificationToken.id },
      data: { usedAt: new Date() },
    });

    // ウェルカムメールを送信
    try {
      await sendWelcomeEmail(verificationToken.user.email, verificationToken.user.username);
      console.log(`✅ [Email Verification] ウェルカムメール送信成功: ${verificationToken.user.email}`);
    } catch (emailError: any) {
      console.error(`❌ [Email Verification] ウェルカムメール送信失敗:`, emailError);
      // ウェルカムメール失敗してもメール検証は成功
    }

    return res.json({
      success: true,
      message: 'メールアドレスの検証が完了しました！ログインしてPoleNaviをお楽しみください。',
    });
  } catch (error: any) {
    console.error('Email verification error:', error);
    return res.status(500).json({
      success: false,
      message: 'メール検証に失敗しました',
      error: error.message,
    });
  }
};

/**
 * 何を: 検証メールを再送信する
 * なぜ: トークンが期限切れの場合に再送信できるようにするため
 */
export const resendVerificationEmail = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'メールアドレスが必要です',
      });
    }

    // ユーザーを検索
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'ユーザーが見つかりません',
      });
    }

    // 既に検証済みかチェック
    if (user.emailVerified) {
      return res.status(400).json({
        success: false,
        message: 'このメールアドレスは既に検証済みです',
      });
    }

    // 既存の未使用トークンを削除
    await prisma.emailVerificationToken.deleteMany({
      where: {
        userId: user.id,
        tokenType: 'email_verification',
        usedAt: null,
      },
    });

    // 新しいトークンを生成
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
    await sendVerificationEmail(user.email, user.username, verificationToken);

    return res.json({
      success: true,
      message: '確認メールを再送信しました。メール内のリンクをクリックして登録を完了してください。',
    });
  } catch (error: any) {
    console.error('Resend verification email error:', error);
    return res.status(500).json({
      success: false,
      message: '確認メール送信に失敗しました',
      error: error.message,
    });
  }
};

/**
 * 何を: パスワードリセット要求を処理する
 * なぜ: ユーザーがパスワードを忘れた時にリセットできるようにするため
 */
export const requestPasswordReset = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'メールアドレスが必要です',
      });
    }

    // ユーザーを検索
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // セキュリティ上、ユーザーが存在しない場合でも成功レスポンスを返す
    // （メールアドレスの存在を推測されないように）
    if (!user) {
      return res.json({
        success: true,
        message: 'パスワードリセットメールを送信しました（メールアドレスが登録されている場合）',
      });
    }

    // 既存の未使用トークンを削除
    await prisma.emailVerificationToken.deleteMany({
      where: {
        userId: user.id,
        tokenType: 'password_reset',
        usedAt: null,
      },
    });

    // トークンを生成
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // 1時間有効

    // トークンをデータベースに保存
    await prisma.emailVerificationToken.create({
      data: {
        userId: user.id,
        token: resetToken,
        tokenType: 'password_reset',
        email: user.email,
        expiresAt,
      },
    });

    // パスワードリセットメールを送信
    await sendPasswordResetEmail(user.email, user.username, resetToken);

    return res.json({
      success: true,
      message: 'パスワードリセットメールを送信しました。メール内のリンクをクリックして新しいパスワードを設定してください。',
    });
  } catch (error: any) {
    console.error('Password reset request error:', error);
    return res.status(500).json({
      success: false,
      message: 'パスワードリセット要求に失敗しました',
      error: error.message,
    });
  }
};

/**
 * 何を: パスワードリセットを実行する
 * なぜ: トークンを検証して新しいパスワードを設定するため
 */
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'トークンと新しいパスワードが必要です',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'パスワードは6文字以上である必要があります',
      });
    }

    // トークンを検索
    const resetToken = await prisma.emailVerificationToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!resetToken) {
      return res.status(400).json({
        success: false,
        message: '無効なリセットトークンです',
      });
    }

    // トークンタイプチェック
    if (resetToken.tokenType !== 'password_reset') {
      return res.status(400).json({
        success: false,
        message: 'このトークンはパスワードリセット用ではありません',
      });
    }

    // 既に使用済みかチェック
    if (resetToken.usedAt) {
      return res.status(400).json({
        success: false,
        message: 'このトークンは既に使用されています',
      });
    }

    // 有効期限チェック
    if (new Date() > resetToken.expiresAt) {
      return res.status(400).json({
        success: false,
        message: 'このトークンは有効期限切れです',
      });
    }

    // 新しいパスワードをハッシュ化
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // パスワードを更新
    await prisma.user.update({
      where: { id: resetToken.userId },
      data: { passwordHash },
    });

    // トークンを使用済みにする
    await prisma.emailVerificationToken.update({
      where: { id: resetToken.id },
      data: { usedAt: new Date() },
    });

    return res.json({
      success: true,
      message: 'パスワードがリセットされました。新しいパスワードでログインしてください。',
    });
  } catch (error: any) {
    console.error('Password reset error:', error);
    return res.status(500).json({
      success: false,
      message: 'パスワードリセットに失敗しました',
      error: error.message,
    });
  }
};

/**
 * 何を: メールアドレス変更要求を処理する
 * なぜ: ユーザーが新しいメールアドレスに変更できるようにするため
 */
export const requestEmailChange = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId; // authMiddlewareで設定される
    const { newEmail, password } = req.body;

    if (!newEmail || !password) {
      return res.status(400).json({
        success: false,
        message: '新しいメールアドレスと現在のパスワードが必要です',
      });
    }

    // ユーザーを検索
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'ユーザーが見つかりません',
      });
    }

    // パスワード検証
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'パスワードが正しくありません',
      });
    }

    // 新しいメールアドレスが既に使用されていないかチェック
    const existingUser = await prisma.user.findUnique({
      where: { email: newEmail },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'このメールアドレスは既に使用されています',
      });
    }

    // 既存の未使用トークンを削除
    await prisma.emailVerificationToken.deleteMany({
      where: {
        userId: user.id,
        tokenType: 'email_change',
        usedAt: null,
      },
    });

    // トークンを生成
    const changeToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24時間有効

    // トークンをデータベースに保存
    await prisma.emailVerificationToken.create({
      data: {
        userId: user.id,
        token: changeToken,
        tokenType: 'email_change',
        email: newEmail, // 新しいメールアドレス
        expiresAt,
      },
    });

    // メールアドレス変更確認メールを送信
    await sendEmailChangeEmail(newEmail, user.username, changeToken);

    return res.json({
      success: true,
      message: `${newEmail} に確認メールを送信しました。メール内のリンクをクリックして変更を完了してください。`,
    });
  } catch (error: any) {
    console.error('Email change request error:', error);
    return res.status(500).json({
      success: false,
      message: 'メールアドレス変更要求に失敗しました',
      error: error.message,
    });
  }
};

/**
 * 何を: メールアドレス変更を確認する
 * なぜ: トークンを検証して新しいメールアドレスを設定するため
 */
export const confirmEmailChange = async (req: Request, res: Response) => {
  try {
    const { token } = req.query;

    if (!token || typeof token !== 'string') {
      return res.status(400).json({
        success: false,
        message: '確認トークンが必要です',
      });
    }

    // トークンを検索
    const changeToken = await prisma.emailVerificationToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!changeToken) {
      return res.status(400).json({
        success: false,
        message: '無効な確認トークンです',
      });
    }

    // トークンタイプチェック
    if (changeToken.tokenType !== 'email_change') {
      return res.status(400).json({
        success: false,
        message: 'このトークンはメールアドレス変更用ではありません',
      });
    }

    // 既に使用済みかチェック
    if (changeToken.usedAt) {
      return res.status(400).json({
        success: false,
        message: 'このトークンは既に使用されています',
      });
    }

    // 有効期限チェック
    if (new Date() > changeToken.expiresAt) {
      return res.status(400).json({
        success: false,
        message: 'このトークンは有効期限切れです',
      });
    }

    // 新しいメールアドレスが既に使用されていないか再度チェック
    const existingUser = await prisma.user.findUnique({
      where: { email: changeToken.email },
    });

    if (existingUser && existingUser.id !== changeToken.userId) {
      return res.status(400).json({
        success: false,
        message: 'このメールアドレスは既に使用されています',
      });
    }

    // メールアドレスを更新
    await prisma.user.update({
      where: { id: changeToken.userId },
      data: {
        email: changeToken.email,
        emailVerified: true,
        emailVerifiedAt: new Date(),
      },
    });

    // トークンを使用済みにする
    await prisma.emailVerificationToken.update({
      where: { id: changeToken.id },
      data: { usedAt: new Date() },
    });

    return res.json({
      success: true,
      message: 'メールアドレスが変更されました。新しいメールアドレスでログインしてください。',
    });
  } catch (error: any) {
    console.error('Email change confirmation error:', error);
    return res.status(500).json({
      success: false,
      message: 'メールアドレス変更確認に失敗しました',
      error: error.message,
    });
  }
};
