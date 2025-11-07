// 何を: ユーザー関連のコントローラー
// なぜ: ユーザー統計、プロフィール編集、メール認証などの機能を提供するため

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// ユーザー統計データを取得
export const getUserStats = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: '認証が必要です'
      });
    }

    // 並列でデータを取得
    const [registeredPolesCount, photosCount, memosCount] = await Promise.all([
      // 登録した電柱番号の数
      prisma.poleNumber.count({
        where: { registeredBy: userId }
      }),

      // 撮影した写真の数（削除されていないもの）
      prisma.polePhoto.count({
        where: {
          uploadedBy: userId,
          deletedAt: null
        }
      }),

      // 書いたメモの数
      prisma.poleMemo.count({
        where: { createdBy: userId }
      })
    ]);

    // グループ機能は未実装のため0
    const groupsCount = 0;

    return res.json({
      success: true,
      stats: {
        registeredPoles: registeredPolesCount,
        photos: photosCount,
        memos: memosCount,
        groups: groupsCount
      }
    });
  } catch (error: any) {
    console.error('Get user stats error:', error);
    return res.status(500).json({
      success: false,
      message: '統計データの取得に失敗しました',
      error: error.message
    });
  }
};

// プロフィール更新
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: '認証が必要です'
      });
    }

    const { displayName, username, email, currentPassword, newPassword } = req.body;

    // 現在のユーザー情報を取得
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'ユーザーが見つかりません'
      });
    }

    // ユーザー名の重複チェック
    if (username && username !== user.username) {
      const existingUser = await prisma.user.findUnique({
        where: { username }
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'このユーザー名は既に使用されています'
        });
      }
    }

    // メールアドレスの重複チェック
    if (email && email !== user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'このメールアドレスは既に登録されています'
        });
      }
    }

    // パスワード変更の場合
    let passwordHash = user.passwordHash;
    if (currentPassword && newPassword) {
      // 現在のパスワードを検証
      const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);

      if (!isPasswordValid) {
        return res.status(400).json({
          success: false,
          message: '現在のパスワードが正しくありません'
        });
      }

      // 新しいパスワードのバリデーション
      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: '新しいパスワードは6文字以上である必要があります'
        });
      }

      // 新しいパスワードをハッシュ化
      passwordHash = await bcrypt.hash(newPassword, 10);
    }

    // プロフィール更新
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(displayName !== undefined && { displayName }),
        ...(username && { username }),
        ...(email && { email, emailVerified: false }), // メール変更時は再認証必要
        ...(passwordHash !== user.passwordHash && { passwordHash })
      },
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        role: true,
        homePrefecture: true,
        planType: true,
        emailVerified: true,
        createdAt: true
      }
    });

    return res.json({
      success: true,
      message: 'プロフィールを更新しました',
      user: updatedUser
    });
  } catch (error: any) {
    console.error('Update profile error:', error);
    return res.status(500).json({
      success: false,
      message: 'プロフィールの更新に失敗しました',
      error: error.message
    });
  }
};

// 自分が登録した電柱一覧を取得
export const getMyPoles = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: '認証が必要です'
      });
    }

    const poleNumbers = await prisma.poleNumber.findMany({
      where: { registeredBy: userId },
      include: {
        pole: {
          include: {
            poleNumbers: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.json({
      success: true,
      data: { poleNumbers }
    });
  } catch (error: any) {
    console.error('Get my poles error:', error);
    return res.status(500).json({
      success: false,
      message: '電柱一覧の取得に失敗しました',
      error: error.message
    });
  }
};

// 自分が作成したメモ一覧を取得
export const getMyMemos = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: '認証が必要です'
      });
    }

    const memos = await prisma.poleMemo.findMany({
      where: { createdBy: userId },
      include: {
        pole: {
          include: {
            poleNumbers: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.json({
      success: true,
      data: { memos }
    });
  } catch (error: any) {
    console.error('Get my memos error:', error);
    return res.status(500).json({
      success: false,
      message: 'メモ一覧の取得に失敗しました',
      error: error.message
    });
  }
};

// 自分がアップロードした写真一覧を取得
export const getMyPhotos = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: '認証が必要です'
      });
    }

    const photos = await prisma.polePhoto.findMany({
      where: {
        uploadedBy: userId,
        deletedAt: null
      },
      include: {
        pole: {
          include: {
            poleNumbers: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.json({
      success: true,
      data: { photos }
    });
  } catch (error: any) {
    console.error('Get my photos error:', error);
    return res.status(500).json({
      success: false,
      message: '写真一覧の取得に失敗しました',
      error: error.message
    });
  }
};

// 自分が使用したハッシュタグ一覧を取得
export const getMyHashtags = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: '認証が必要です'
      });
    }

    const memos = await prisma.poleMemo.findMany({
      where: { createdBy: userId },
      select: { hashtags: true }
    });

    // ハッシュタグを集計
    const hashtagCount: { [key: string]: number } = {};
    memos.forEach(memo => {
      memo.hashtags.forEach(tag => {
        hashtagCount[tag] = (hashtagCount[tag] || 0) + 1;
      });
    });

    // オブジェクトを配列に変換してソート
    const hashtags = Object.entries(hashtagCount)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count);

    return res.json({
      success: true,
      data: { hashtags }
    });
  } catch (error: any) {
    console.error('Get my hashtags error:', error);
    return res.status(500).json({
      success: false,
      message: 'ハッシュタグ一覧の取得に失敗しました',
      error: error.message
    });
  }
};
