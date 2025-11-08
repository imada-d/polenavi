// 何を: モバイル用グループ画面
// なぜ: グループ機能でチーム・組織での電柱管理を可能にするため

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../../components/mobile/BottomNav';
import { getUserGroups, createGroup, type Group } from '../../api/groups';

export default function Groups() {
  const navigate = useNavigate();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');
  const [creating, setCreating] = useState(false);

  // グループ一覧を取得
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const data = await getUserGroups();
        setGroups(data);
      } catch (error) {
        console.error('グループ一覧取得エラー:', error);
        alert('グループ一覧の取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, []);

  // グループ作成
  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) {
      alert('グループ名を入力してください');
      return;
    }

    setCreating(true);
    try {
      const newGroup = await createGroup({
        name: newGroupName.trim(),
        description: newGroupDescription.trim() || undefined,
      });
      setGroups([newGroup, ...groups]);
      setShowCreateModal(false);
      setNewGroupName('');
      setNewGroupDescription('');
      alert('グループを作成しました！');
    } catch (error: any) {
      console.error('グループ作成エラー:', error);
      alert(error.message || 'グループの作成に失敗しました');
    } finally {
      setCreating(false);
    }
  };

  // グループを開く
  const handleOpenGroup = (groupId: number) => {
    navigate(`/groups/${groupId}`);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-bold">👥 グループ</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-blue-700"
        >
          ＋ 作成
        </button>
      </header>

      {/* コンテンツ */}
      <div className="flex-1 overflow-y-auto p-4 pb-20">
        {loading ? (
          <div className="text-center py-8 text-gray-500">読み込み中...</div>
        ) : (
          <div className="space-y-3">
            {groups.length === 0 ? (
              <div className="bg-white rounded-lg p-8 text-center">
                <p className="text-gray-500 mb-4">まだグループに参加していません</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700"
                >
                  ＋ グループを作成
                </button>
              </div>
            ) : (
              <>
                {groups.map((group) => {
                  // メンバーの中から自分のロールを探す
                  const myMembership = group.members?.find(m => m.userId === (window as any).userId);
                  const myRole = myMembership?.role;

                  return (
                    <div key={group.id} className="bg-white rounded-lg shadow-sm border p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-bold text-lg">{group.name}</h3>
                          {myRole === 'admin' && (
                            <span className="inline-block bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded mt-1">
                              管理者
                            </span>
                          )}
                          {myRole === 'editor' && (
                            <span className="inline-block bg-green-100 text-green-600 text-xs px-2 py-1 rounded mt-1">
                              編集者
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{group.description}</p>
                      <div className="flex gap-4 text-sm text-gray-500">
                        <span>👥 {group._count?.members || 0}人</span>
                        <span>📝 {group._count?.memos || 0}メモ</span>
                        <span>📸 {group._count?.photos || 0}枚</span>
                      </div>
                      <button
                        onClick={() => handleOpenGroup(group.id)}
                        className="w-full mt-3 bg-gray-100 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-200"
                      >
                        グループを開く →
                      </button>
                    </div>
                  );
                })}
              </>
            )}

            {/* グループ機能の説明 */}
            <div className="bg-blue-50 rounded-lg p-4 mt-4">
              <h3 className="font-bold text-blue-900 mb-2">💡 グループ機能とは？</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• チームや組織で電柱を管理</li>
                <li>• グループ専用のメモ・タグ</li>
                <li>• 役割に応じた権限設定</li>
                <li>• CSVエクスポートで報告書作成</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* ボトムナビ */}
      <BottomNav />

      {/* グループ作成モーダル */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4">グループを作成</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  グループ名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="例: A市管理街路灯"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  maxLength={100}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  説明（任意）
                </label>
                <textarea
                  value={newGroupDescription}
                  onChange={(e) => setNewGroupDescription(e.target.value)}
                  placeholder="グループの目的や管理対象を記入してください"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  maxLength={500}
                />
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewGroupName('');
                  setNewGroupDescription('');
                }}
                disabled={creating}
                className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 disabled:opacity-50"
              >
                キャンセル
              </button>
              <button
                onClick={handleCreateGroup}
                disabled={creating || !newGroupName.trim()}
                className="flex-1 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creating ? '作成中...' : '作成'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
