// 何を: グループ詳細画面（モバイル版）
// なぜ: グループの情報を表示し、メンバー管理や設定を行うため

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getGroupById,
  inviteMember,
  removeMember,
  updateMemberRole,
  leaveGroup,
  deleteGroup,
  type Group,
  type GroupMember,
} from '../../api/groups';

export default function GroupDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const groupId = parseInt(id!, 10);

  const [group, setGroup] = useState<Group | null>(null);
  const [userRole, setUserRole] = useState<'admin' | 'editor' | 'viewer'>('viewer');
  const [loading, setLoading] = useState(true);

  // 招待モーダル
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'editor' | 'viewer'>('viewer');
  const [inviting, setInviting] = useState(false);

  // 設定モーダル
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // グループ詳細を取得
  useEffect(() => {
    const fetchGroup = async () => {
      try {
        const data = await getGroupById(groupId);
        setGroup(data.group);
        setUserRole(data.userRole);
      } catch (error: any) {
        console.error('グループ詳細取得エラー:', error);
        alert(error.message || 'グループ詳細の取得に失敗しました');
        navigate('/groups');
      } finally {
        setLoading(false);
      }
    };

    fetchGroup();
  }, [groupId, navigate]);

  // メンバーを招待
  const handleInvite = async () => {
    if (!inviteEmail.trim()) {
      alert('メールアドレスを入力してください');
      return;
    }

    setInviting(true);
    try {
      await inviteMember(groupId, {
        email: inviteEmail.trim(),
        role: inviteRole,
      });
      alert('招待を送信しました！');
      setShowInviteModal(false);
      setInviteEmail('');
      setInviteRole('viewer');
      // グループ情報を再取得
      const data = await getGroupById(groupId);
      setGroup(data.group);
    } catch (error: any) {
      console.error('招待エラー:', error);
      alert(error.message || '招待の送信に失敗しました');
    } finally {
      setInviting(false);
    }
  };

  // メンバーを削除
  const handleRemoveMember = async (member: GroupMember) => {
    if (!confirm(`${member.user.displayName || member.user.username}さんをグループから削除しますか？`)) {
      return;
    }

    try {
      await removeMember(groupId, member.userId);
      alert('メンバーを削除しました');
      // グループ情報を再取得
      const data = await getGroupById(groupId);
      setGroup(data.group);
    } catch (error: any) {
      console.error('メンバー削除エラー:', error);
      alert(error.message || 'メンバーの削除に失敗しました');
    }
  };

  // 権限を変更
  const handleChangeRole = async (member: GroupMember) => {
    const newRole = prompt(
      `${member.user.displayName || member.user.username}さんの権限を変更\n\n現在: ${getRoleLabel(member.role)}\n\n新しい権限を入力してください:\nadmin (管理者)\neditor (編集者)\nviewer (閲覧者)`
    );

    if (!newRole || !['admin', 'editor', 'viewer'].includes(newRole)) {
      return;
    }

    try {
      await updateMemberRole(groupId, member.userId, newRole as any);
      alert('権限を変更しました');
      // グループ情報を再取得
      const data = await getGroupById(groupId);
      setGroup(data.group);
    } catch (error: any) {
      console.error('権限変更エラー:', error);
      alert(error.message || '権限の変更に失敗しました');
    }
  };

  // グループから脱退
  const handleLeave = async () => {
    if (!confirm('このグループから脱退しますか？')) {
      return;
    }

    try {
      await leaveGroup(groupId);
      alert('グループから脱退しました');
      navigate('/groups');
    } catch (error: any) {
      console.error('脱退エラー:', error);
      alert(error.message || 'グループからの脱退に失敗しました');
    }
  };

  // グループを削除
  const handleDelete = async () => {
    if (!confirm(`本当にこのグループを削除しますか？\n\nグループ名: ${group?.name}\n\nこの操作は取り消せません。`)) {
      return;
    }

    try {
      await deleteGroup(groupId);
      alert('グループを削除しました');
      navigate('/groups');
    } catch (error: any) {
      console.error('グループ削除エラー:', error);
      alert(error.message || 'グループの削除に失敗しました');
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return '管理者';
      case 'editor':
        return '編集者';
      case 'viewer':
        return '閲覧者';
      default:
        return role;
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">読み込み中...</div>
      </div>
    );
  }

  if (!group) {
    return null;
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <button onClick={() => navigate('/groups')} className="text-2xl mr-3">
            ←
          </button>
          <h1 className="text-lg font-bold">{group.name}</h1>
        </div>
        {userRole === 'admin' && (
          <button
            onClick={() => setShowSettingsModal(true)}
            className="text-gray-600 text-2xl"
          >
            ⚙️
          </button>
        )}
      </header>

      {/* コンテンツ */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* グループ情報 */}
        <div className="bg-white rounded-lg p-4 mb-4 shadow-sm">
          <h2 className="font-bold text-lg mb-2">グループ情報</h2>
          {group.description && (
            <p className="text-gray-600 text-sm mb-3">{group.description}</p>
          )}
          <div className="flex gap-4 text-sm text-gray-500">
            <span>👥 {group._count?.members || 0}人</span>
            <span>📝 {group._count?.memos || 0}メモ</span>
            <span>📸 {group._count?.photos || 0}枚</span>
          </div>
        </div>

        {/* メンバー一覧 */}
        <div className="bg-white rounded-lg p-4 mb-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-lg">メンバー ({group.members?.length || 0})</h2>
            {userRole === 'admin' && (
              <button
                onClick={() => setShowInviteModal(true)}
                className="bg-blue-600 text-white px-3 py-1 rounded text-sm font-semibold"
              >
                ＋ 招待
              </button>
            )}
          </div>

          <div className="space-y-2">
            {group.members?.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex-1">
                  <div className="font-semibold">
                    {member.user.displayName || member.user.username}
                  </div>
                  <div className="text-sm text-gray-500">@{member.user.username}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      member.role === 'admin'
                        ? 'bg-blue-100 text-blue-600'
                        : member.role === 'editor'
                        ? 'bg-green-100 text-green-600'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {getRoleLabel(member.role)}
                  </span>
                  {userRole === 'admin' && member.role !== 'admin' && (
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleChangeRole(member)}
                        className="text-blue-600 text-sm"
                      >
                        権限変更
                      </button>
                      <button
                        onClick={() => handleRemoveMember(member)}
                        className="text-red-600 text-sm"
                      >
                        削除
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* アクション */}
        <div className="space-y-2">
          <button
            onClick={handleLeave}
            className="w-full py-3 bg-white border border-red-300 text-red-600 rounded-lg font-semibold hover:bg-red-50"
          >
            グループから脱退
          </button>
        </div>
      </div>

      {/* 招待モーダル */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4">メンバーを招待</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  メールアドレス <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="example@example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">権限</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="viewer">閲覧者（見るだけ）</option>
                  <option value="editor">編集者（メモ・写真追加可能）</option>
                  <option value="admin">管理者（全権限）</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => {
                  setShowInviteModal(false);
                  setInviteEmail('');
                  setInviteRole('viewer');
                }}
                disabled={inviting}
                className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 disabled:opacity-50"
              >
                キャンセル
              </button>
              <button
                onClick={handleInvite}
                disabled={inviting || !inviteEmail.trim()}
                className="flex-1 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {inviting ? '送信中...' : '招待を送信'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 設定モーダル */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4">グループ設定</h2>

            <div className="space-y-2">
              <button
                onClick={handleDelete}
                className="w-full py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700"
              >
                グループを削除
              </button>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="w-full py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
