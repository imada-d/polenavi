// 何を: グループ機能のサービス層
// なぜ: グループのCRUD操作、メンバー管理、招待機能のビジネスロジックを提供するため

import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

/**
 * グループを作成
 */
export async function createGroup(params: {
  name: string;
  description?: string;
  createdBy: number;
}) {
  const { name, description, createdBy } = params;

  const group = await prisma.group.create({
    data: {
      name,
      description,
      createdBy,
      members: {
        create: {
          userId: createdBy,
          role: 'admin', // 作成者は自動的に管理者
        },
      },
    },
    include: {
      members: {
        include: {
          user: {
            select: {
              id: true,
              username: true,
              displayName: true,
              email: true,
            },
          },
        },
      },
    },
  });

  return group;
}

/**
 * ユーザーが参加しているグループ一覧を取得
 */
export async function getUserGroups(userId: number) {
  const groups = await prisma.group.findMany({
    where: {
      members: {
        some: {
          userId,
        },
      },
    },
    include: {
      members: {
        include: {
          user: {
            select: {
              id: true,
              username: true,
              displayName: true,
            },
          },
        },
      },
      _count: {
        select: {
          members: true,
          memos: true,
          photos: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return groups;
}

/**
 * グループ詳細を取得
 */
export async function getGroupById(groupId: number, userId: number) {
  // まずメンバーかどうかチェック
  const membership = await prisma.groupMember.findUnique({
    where: {
      groupId_userId: {
        groupId,
        userId,
      },
    },
  });

  if (!membership) {
    throw new Error('このグループにアクセスする権限がありません');
  }

  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: {
      members: {
        include: {
          user: {
            select: {
              id: true,
              username: true,
              displayName: true,
              email: true,
            },
          },
        },
        orderBy: {
          joinedAt: 'asc',
        },
      },
      creator: {
        select: {
          id: true,
          username: true,
          displayName: true,
        },
      },
      _count: {
        select: {
          members: true,
          memos: true,
          photos: true,
        },
      },
    },
  });

  return { group, userRole: membership.role };
}

/**
 * グループ情報を更新
 */
export async function updateGroup(params: {
  groupId: number;
  userId: number;
  name?: string;
  description?: string;
}) {
  const { groupId, userId, name, description } = params;

  // 管理者権限チェック
  await checkAdminPermission(groupId, userId);

  const group = await prisma.group.update({
    where: { id: groupId },
    data: {
      name,
      description,
    },
  });

  return group;
}

/**
 * グループを削除
 */
export async function deleteGroup(groupId: number, userId: number) {
  // 管理者権限チェック
  await checkAdminPermission(groupId, userId);

  await prisma.group.delete({
    where: { id: groupId },
  });

  return { success: true };
}

/**
 * グループメンバーを招待
 */
export async function inviteMember(params: {
  groupId: number;
  inviterId: number;
  inviteeEmail: string;
  role?: 'admin' | 'editor' | 'viewer';
}) {
  const { groupId, inviterId, inviteeEmail, role = 'viewer' } = params;

  // 管理者権限チェック
  await checkAdminPermission(groupId, inviterId);

  // 既に招待済みかチェック
  const existingInvitation = await prisma.groupInvitation.findUnique({
    where: {
      groupId_inviteeEmail: {
        groupId,
        inviteeEmail,
      },
    },
  });

  if (existingInvitation && existingInvitation.status === 'pending') {
    throw new Error('このメールアドレスは既に招待されています');
  }

  // 招待トークンを生成
  const token = crypto.randomBytes(32).toString('hex');

  // 招待対象がユーザー登録済みかチェック
  const inviteeUser = await prisma.user.findUnique({
    where: { email: inviteeEmail },
  });

  // 既にメンバーかチェック
  if (inviteeUser) {
    const existingMember = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId: inviteeUser.id,
        },
      },
    });

    if (existingMember) {
      throw new Error('このユーザーは既にメンバーです');
    }
  }

  // 招待を作成（7日間有効）
  const invitation = await prisma.groupInvitation.create({
    data: {
      groupId,
      inviterId,
      inviteeEmail,
      inviteeId: inviteeUser?.id,
      token,
      role,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7日後
    },
    include: {
      group: {
        select: {
          id: true,
          name: true,
        },
      },
      inviter: {
        select: {
          username: true,
          displayName: true,
        },
      },
    },
  });

  return invitation;
}

/**
 * 招待を取得
 */
export async function getInvitation(token: string) {
  const invitation = await prisma.groupInvitation.findUnique({
    where: { token },
    include: {
      group: true,
      inviter: {
        select: {
          username: true,
          displayName: true,
        },
      },
    },
  });

  if (!invitation) {
    throw new Error('招待が見つかりません');
  }

  if (invitation.status !== 'pending') {
    throw new Error('この招待は既に処理されています');
  }

  if (invitation.expiresAt < new Date()) {
    throw new Error('この招待は期限切れです');
  }

  return invitation;
}

/**
 * 招待を承認
 */
export async function acceptInvitation(token: string, userId: number) {
  const invitation = await getInvitation(token);

  // 招待対象のメールアドレスと一致するかチェック
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (user?.email !== invitation.inviteeEmail) {
    throw new Error('この招待はあなた宛ではありません');
  }

  // トランザクションでメンバー追加と招待ステータス更新
  const result = await prisma.$transaction(async (tx) => {
    // メンバーを追加
    const member = await tx.groupMember.create({
      data: {
        groupId: invitation.groupId,
        userId,
        role: invitation.role,
      },
    });

    // 招待ステータスを更新
    await tx.groupInvitation.update({
      where: { id: invitation.id },
      data: {
        status: 'accepted',
        respondedAt: new Date(),
      },
    });

    return member;
  });

  return result;
}

/**
 * 招待を拒否
 */
export async function rejectInvitation(token: string, userId: number) {
  const invitation = await getInvitation(token);

  // 招待対象のメールアドレスと一致するかチェック
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (user?.email !== invitation.inviteeEmail) {
    throw new Error('この招待はあなた宛ではありません');
  }

  await prisma.groupInvitation.update({
    where: { id: invitation.id },
    data: {
      status: 'rejected',
      respondedAt: new Date(),
    },
  });

  return { success: true };
}

/**
 * メンバーを削除
 */
export async function removeMember(params: {
  groupId: number;
  userId: number;
  targetUserId: number;
}) {
  const { groupId, userId, targetUserId } = params;

  // 管理者権限チェック
  await checkAdminPermission(groupId, userId);

  // 自分自身は削除できない
  if (userId === targetUserId) {
    throw new Error('自分自身を削除することはできません。脱退機能を使用してください。');
  }

  await prisma.groupMember.delete({
    where: {
      groupId_userId: {
        groupId,
        userId: targetUserId,
      },
    },
  });

  return { success: true };
}

/**
 * グループから脱退
 */
export async function leaveGroup(groupId: number, userId: number) {
  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: {
      members: true,
    },
  });

  if (!group) {
    throw new Error('グループが見つかりません');
  }

  // 自分が唯一の管理者の場合は脱退不可
  const adminCount = group.members.filter((m) => m.role === 'admin').length;
  const userMembership = group.members.find((m) => m.userId === userId);

  if (adminCount === 1 && userMembership?.role === 'admin') {
    throw new Error('あなたは唯一の管理者です。別の管理者を指定してから脱退してください。');
  }

  await prisma.groupMember.delete({
    where: {
      groupId_userId: {
        groupId,
        userId,
      },
    },
  });

  return { success: true };
}

/**
 * メンバーの権限を変更
 */
export async function updateMemberRole(params: {
  groupId: number;
  userId: number;
  targetUserId: number;
  newRole: 'admin' | 'editor' | 'viewer';
}) {
  const { groupId, userId, targetUserId, newRole } = params;

  // 管理者権限チェック
  await checkAdminPermission(groupId, userId);

  // 自分自身の権限は変更できない
  if (userId === targetUserId) {
    throw new Error('自分自身の権限は変更できません');
  }

  const member = await prisma.groupMember.update({
    where: {
      groupId_userId: {
        groupId,
        userId: targetUserId,
      },
    },
    data: {
      role: newRole,
    },
  });

  return member;
}

/**
 * 管理者権限をチェック
 */
async function checkAdminPermission(groupId: number, userId: number) {
  const member = await prisma.groupMember.findUnique({
    where: {
      groupId_userId: {
        groupId,
        userId,
      },
    },
  });

  if (!member) {
    throw new Error('このグループのメンバーではありません');
  }

  if (member.role !== 'admin') {
    throw new Error('この操作には管理者権限が必要です');
  }
}

/**
 * メンバー権限をチェック（編集者以上）
 */
export async function checkEditorPermission(groupId: number, userId: number) {
  const member = await prisma.groupMember.findUnique({
    where: {
      groupId_userId: {
        groupId,
        userId,
      },
    },
  });

  if (!member) {
    throw new Error('このグループのメンバーではありません');
  }

  if (member.role === 'viewer') {
    throw new Error('この操作には編集者以上の権限が必要です');
  }

  return member;
}
