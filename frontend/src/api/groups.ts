// 何を: グループ関連のAPI呼び出し
// なぜ: グループのCRUD操作、メンバー管理、招待機能を提供するため

import apiClient from './client';

// 型定義
export interface Group {
  id: number;
  name: string;
  description?: string;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
  members: GroupMember[];
  _count?: {
    members: number;
    memos: number;
    photos: number;
  };
}

export interface GroupMember {
  id: number;
  groupId: number;
  userId: number;
  role: 'admin' | 'editor' | 'viewer';
  joinedAt: string;
  user: {
    id: number;
    username: string;
    displayName?: string;
    email?: string;
  };
}

export interface GroupInvitation {
  id: number;
  groupId: number;
  inviterId: number;
  inviteeEmail: string;
  inviteeId?: number;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  token: string;
  role: 'admin' | 'editor' | 'viewer';
  expiresAt: string;
  createdAt: string;
  respondedAt?: string;
  group: {
    id: number;
    name: string;
  };
  inviter: {
    username: string;
    displayName?: string;
  };
}

/**
 * グループを作成
 * POST /api/groups
 */
export async function createGroup(data: {
  name: string;
  description?: string;
}): Promise<Group> {
  try {
    const response = await apiClient.post('/groups', data);
    return response.data.data.group;
  } catch (error: any) {
    const errorMessage = error.response?.data?.error?.message || 'グループの作成に失敗しました';
    throw new Error(errorMessage);
  }
}

/**
 * ユーザーが参加しているグループ一覧を取得
 * GET /api/groups
 */
export async function getUserGroups(): Promise<Group[]> {
  try {
    const response = await apiClient.get('/groups');
    return response.data.data.groups;
  } catch (error: any) {
    const errorMessage = error.response?.data?.error?.message || 'グループ一覧の取得に失敗しました';
    throw new Error(errorMessage);
  }
}

/**
 * グループ詳細を取得
 * GET /api/groups/:id
 */
export async function getGroupById(groupId: number): Promise<{
  group: Group;
  userRole: 'admin' | 'editor' | 'viewer';
}> {
  try {
    const response = await apiClient.get(`/groups/${groupId}`);
    return response.data.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.error?.message || 'グループ詳細の取得に失敗しました';
    throw new Error(errorMessage);
  }
}

/**
 * グループ情報を更新
 * PUT /api/groups/:id
 */
export async function updateGroup(
  groupId: number,
  data: {
    name?: string;
    description?: string;
  }
): Promise<Group> {
  try {
    const response = await apiClient.put(`/groups/${groupId}`, data);
    return response.data.data.group;
  } catch (error: any) {
    const errorMessage = error.response?.data?.error?.message || 'グループ情報の更新に失敗しました';
    throw new Error(errorMessage);
  }
}

/**
 * グループを削除
 * DELETE /api/groups/:id
 */
export async function deleteGroup(groupId: number): Promise<void> {
  try {
    await apiClient.delete(`/groups/${groupId}`);
  } catch (error: any) {
    const errorMessage = error.response?.data?.error?.message || 'グループの削除に失敗しました';
    throw new Error(errorMessage);
  }
}

/**
 * メンバーを招待
 * POST /api/groups/:id/invitations
 */
export async function inviteMember(
  groupId: number,
  data: {
    email: string;
    role?: 'admin' | 'editor' | 'viewer';
  }
): Promise<GroupInvitation> {
  try {
    const response = await apiClient.post(`/groups/${groupId}/invitations`, data);
    return response.data.data.invitation;
  } catch (error: any) {
    const errorMessage = error.response?.data?.error?.message || 'メンバーの招待に失敗しました';
    throw new Error(errorMessage);
  }
}

/**
 * 招待を取得
 * GET /api/invitations/:token
 */
export async function getInvitation(token: string): Promise<GroupInvitation> {
  try {
    const response = await apiClient.get(`/invitations/${token}`);
    return response.data.data.invitation;
  } catch (error: any) {
    const errorMessage = error.response?.data?.error?.message || '招待の取得に失敗しました';
    throw new Error(errorMessage);
  }
}

/**
 * 招待を承認
 * POST /api/invitations/:token/accept
 */
export async function acceptInvitation(token: string): Promise<void> {
  try {
    await apiClient.post(`/invitations/${token}/accept`);
  } catch (error: any) {
    const errorMessage = error.response?.data?.error?.message || '招待の承認に失敗しました';
    throw new Error(errorMessage);
  }
}

/**
 * 招待を拒否
 * POST /api/invitations/:token/reject
 */
export async function rejectInvitation(token: string): Promise<void> {
  try {
    await apiClient.post(`/invitations/${token}/reject`);
  } catch (error: any) {
    const errorMessage = error.response?.data?.error?.message || '招待の拒否に失敗しました';
    throw new Error(errorMessage);
  }
}

/**
 * メンバーを削除
 * DELETE /api/groups/:id/members/:userId
 */
export async function removeMember(groupId: number, userId: number): Promise<void> {
  try {
    await apiClient.delete(`/groups/${groupId}/members/${userId}`);
  } catch (error: any) {
    const errorMessage = error.response?.data?.error?.message || 'メンバーの削除に失敗しました';
    throw new Error(errorMessage);
  }
}

/**
 * グループから脱退
 * POST /api/groups/:id/leave
 */
export async function leaveGroup(groupId: number): Promise<void> {
  try {
    await apiClient.post(`/groups/${groupId}/leave`);
  } catch (error: any) {
    const errorMessage = error.response?.data?.error?.message || 'グループからの脱退に失敗しました';
    throw new Error(errorMessage);
  }
}

/**
 * メンバーの権限を変更
 * PUT /api/groups/:id/members/:userId/role
 */
export async function updateMemberRole(
  groupId: number,
  userId: number,
  role: 'admin' | 'editor' | 'viewer'
): Promise<void> {
  try {
    await apiClient.put(`/groups/${groupId}/members/${userId}/role`, { role });
  } catch (error: any) {
    const errorMessage = error.response?.data?.error?.message || 'メンバーの権限変更に失敗しました';
    throw new Error(errorMessage);
  }
}
