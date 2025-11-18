// 何を: 管理者機能のコントローラー
// なぜ: ユーザー管理APIのエンドポイント処理

import { Request, Response, NextFunction } from 'express';
import * as adminService from '../services/adminService';

/**
 * ユーザー一覧を取得
 */
export async function getUsers(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const {
      page,
      limit,
      search,
      sortBy,
      sortOrder,
      role,
      isActive,
    } = req.query;

    const result = await adminService.getUsers({
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      search: search as string,
      sortBy: sortBy as 'createdAt' | 'username' | 'email' | undefined,
      sortOrder: sortOrder as 'asc' | 'desc' | undefined,
      role: role as string,
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * ユーザー詳細を取得
 */
export async function getUserDetail(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = parseInt(req.params.id);
    const user = await adminService.getUserDetail(userId);

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * ユーザー情報を更新
 */
export async function updateUser(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = parseInt(req.params.id);
    const { role, isActive, emailVerified } = req.body;

    const user = await adminService.updateUser(userId, {
      role,
      isActive,
      emailVerified,
    });

    res.json({
      success: true,
      data: user,
      message: 'ユーザー情報を更新しました',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * ユーザーのアクティビティを取得
 */
export async function getUserActivity(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = parseInt(req.params.id);
    const days = req.query.days ? parseInt(req.query.days as string) : 30;

    const activities = await adminService.getUserActivity(userId, days);

    res.json({
      success: true,
      data: activities,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * 通報一覧を取得
 */
export async function getReports(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const {
      page,
      limit,
      status,
      reportType,
      search,
    } = req.query;

    const result = await adminService.getReports({
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      status: status as 'pending' | 'reviewed' | 'resolved' | undefined,
      reportType: reportType as 'photo' | 'pole' | 'number' | undefined,
      search: search as string,
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * 通報詳細を取得
 */
export async function getReportDetail(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const reportId = parseInt(req.params.id);
    const report = await adminService.getReportDetail(reportId);

    res.json({
      success: true,
      data: report,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * 通報を処理
 */
export async function reviewReport(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const reportId = parseInt(req.params.id);
    const reviewedBy = (req as any).user.userId;
    const { status, resolution, action } = req.body;

    const report = await adminService.reviewReport(reportId, reviewedBy, {
      status,
      resolution,
      action,
    });

    res.json({
      success: true,
      data: report,
      message: '通報を処理しました',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * 電柱を削除
 */
export async function deletePole(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const poleId = parseInt(req.params.id);

    await adminService.deletePole(poleId);

    res.json({
      success: true,
      message: '電柱を削除しました',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * 複数の電柱を一括削除
 */
export async function bulkDeletePoles(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // POSTの場合はbody、GETの場合はquery
    const poleIds = req.body.poleIds || (req.query.ids ? JSON.parse(req.query.ids as string) : null);

    console.log('🗑️ 一括削除リクエスト受信:', { method: req.method, poleIds });

    if (!Array.isArray(poleIds) || poleIds.length === 0) {
      res.status(400).json({
        success: false,
        error: { message: '削除する電柱IDを指定してください' },
      });
      return;
    }

    // 各電柱を削除
    const results = await Promise.allSettled(
      poleIds.map((id) => adminService.deletePole(id))
    );

    // 成功・失敗をカウント
    const successCount = results.filter((r) => r.status === 'fulfilled').length;
    const failedCount = results.filter((r) => r.status === 'rejected').length;

    res.json({
      success: true,
      message: `${successCount}件の電柱を削除しました`,
      details: {
        total: poleIds.length,
        success: successCount,
        failed: failedCount,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * ユーザーを削除（アカウントのみ、データは残す）
 */
export async function deleteUser(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = parseInt(req.params.id);
    const adminUserId = (req as any).user?.userId;

    // 自分自身は削除できない
    if (userId === adminUserId) {
      res.status(400).json({
        success: false,
        error: {
          code: 'CANNOT_DELETE_SELF',
          message: '自分自身を削除することはできません',
        },
      });
      return;
    }

    await adminService.deleteUser(userId);

    res.json({
      success: true,
      message: 'ユーザーを削除しました',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * 電柱一覧を取得
 */
export async function getPoles(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const {
      page,
      limit,
      search,
      sortBy,
      sortOrder,
      prefecture,
      poleType,
    } = req.query;

    const result = await adminService.getPoles({
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      search: search as string,
      sortBy: sortBy as 'createdAt' | 'photoCount' | 'numberCount' | 'updatedAt' | undefined,
      sortOrder: sortOrder as 'asc' | 'desc' | undefined,
      prefecture: prefecture as string,
      poleType: poleType as string,
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}
