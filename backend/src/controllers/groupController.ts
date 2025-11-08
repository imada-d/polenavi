// 何を: グループ機能のコントローラー
// なぜ: リクエストを受け取り、サービス層を呼び出してレスポンスを返すため

import { Request, Response, NextFunction } from 'express';
import * as groupService from '../services/groupService';

/**
 * グループを作成
 * POST /api/groups
 */
export async function createGroup(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as any).user?.userId;
    const { name, description } = req.body;

    if (!name) {
      res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_NAME',
          message: 'グループ名は必須です',
        },
      });
      return;
    }

    const group = await groupService.createGroup({
      name,
      description,
      createdBy: userId,
    });

    res.status(201).json({
      success: true,
      data: { group },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * ユーザーが参加しているグループ一覧を取得
 * GET /api/groups
 */
export async function getUserGroups(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as any).user?.userId;

    const groups = await groupService.getUserGroups(userId);

    res.json({
      success: true,
      data: { groups },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * グループ詳細を取得
 * GET /api/groups/:id
 */
export async function getGroupById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as any).user?.userId;
    const groupId = parseInt(req.params.id, 10);

    const result = await groupService.getGroupById(groupId, userId);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * グループ情報を更新
 * PUT /api/groups/:id
 */
export async function updateGroup(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as any).user?.userId;
    const groupId = parseInt(req.params.id, 10);
    const { name, description } = req.body;

    const group = await groupService.updateGroup({
      groupId,
      userId,
      name,
      description,
    });

    res.json({
      success: true,
      data: { group },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * グループを削除
 * DELETE /api/groups/:id
 */
export async function deleteGroup(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as any).user?.userId;
    const groupId = parseInt(req.params.id, 10);

    const result = await groupService.deleteGroup(groupId, userId);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * グループメンバーを招待
 * POST /api/groups/:id/invitations
 */
export async function inviteMember(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as any).user?.userId;
    const groupId = parseInt(req.params.id, 10);
    const { email, role } = req.body;

    if (!email) {
      res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_EMAIL',
          message: 'メールアドレスは必須です',
        },
      });
      return;
    }

    const invitation = await groupService.inviteMember({
      groupId,
      inviterId: userId,
      inviteeEmail: email,
      role,
    });

    res.status(201).json({
      success: true,
      data: { invitation },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * 招待を取得
 * GET /api/invitations/:token
 */
export async function getInvitation(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { token } = req.params;

    const invitation = await groupService.getInvitation(token);

    res.json({
      success: true,
      data: { invitation },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * 招待を承認
 * POST /api/invitations/:token/accept
 */
export async function acceptInvitation(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as any).user?.userId;
    const { token } = req.params;

    const member = await groupService.acceptInvitation(token, userId);

    res.json({
      success: true,
      data: { member },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * 招待を拒否
 * POST /api/invitations/:token/reject
 */
export async function rejectInvitation(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as any).user?.userId;
    const { token } = req.params;

    const result = await groupService.rejectInvitation(token, userId);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * メンバーを削除
 * DELETE /api/groups/:id/members/:userId
 */
export async function removeMember(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as any).user?.userId;
    const groupId = parseInt(req.params.id, 10);
    const targetUserId = parseInt(req.params.userId, 10);

    const result = await groupService.removeMember({
      groupId,
      userId,
      targetUserId,
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
 * グループから脱退
 * POST /api/groups/:id/leave
 */
export async function leaveGroup(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as any).user?.userId;
    const groupId = parseInt(req.params.id, 10);

    const result = await groupService.leaveGroup(groupId, userId);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * メンバーの権限を変更
 * PUT /api/groups/:id/members/:userId/role
 */
export async function updateMemberRole(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as any).user?.userId;
    const groupId = parseInt(req.params.id, 10);
    const targetUserId = parseInt(req.params.userId, 10);
    const { role } = req.body;

    if (!role || !['admin', 'editor', 'viewer'].includes(role)) {
      res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ROLE',
          message: '権限は admin, editor, viewer のいずれかです',
        },
      });
      return;
    }

    const member = await groupService.updateMemberRole({
      groupId,
      userId,
      targetUserId,
      newRole: role,
    });

    res.json({
      success: true,
      data: { member },
    });
  } catch (error) {
    next(error);
  }
}
