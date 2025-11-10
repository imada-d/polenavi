// 何を: PC用グループ画面
// なぜ: PC画面でグループ管理機能を提供するため

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../../components/pc/Header';
import { getUserGroups, createGroup, type Group } from '../../api/groups';

export default function GroupsPC() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');
  const [creating, setCreating] = useState(false);

  // グループ一覧を取得
  useEffect(() => {
    // ログインしていない場合はスキップ
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

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
  }, [isAuthenticated]);

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
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">👥 グループ</h1>
            <p className="text-gray-600 mt-2">
              チームや組織で電柱を管理し、情報を共有しましょう
            </p>
          </div>
          {isAuthenticated && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              ＋ 新規グループ作成
            </button>
          )}
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500">読み込み中...</div>
        ) : !isAuthenticated ? (
          /* ログインしていない場合 */
          <div className="max-w-2xl mx-auto bg-white rounded-xl p-12 text-center shadow-lg">
            <div className="text-8xl mb-6">🔒</div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              グループ機能を利用するには
              <br />
              ログインが必要です
            </h2>
            <p className="text-gray-600 mb-8 text-lg">
              チームや組織で電柱を管理し、情報を共有するための機能です
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => navigate('/login')}
                className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-lg"
              >
                ログイン
              </button>
              <button
                onClick={() => navigate('/signup')}
                className="bg-green-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-green-700 transition-colors text-lg"
              >
                新規会員登録
              </button>
            </div>
          </div>
        ) : groups.length === 0 ? (
          /* 空の状態 - 警告なし */
          <></>
        ) : (
          <>
            {/* グループ一覧 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {groups.map((group) => {
                // メンバーの中から自分のロールを探す
                const myMembership = group.members?.find(m => m.userId === (window as any).userId);
                const myRole = myMembership?.role;

                return (
                  <div
                    key={group.id}
                    className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-gray-800">{group.name}</h3>
                          {myRole === 'admin' && (
                            <span className="bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded-full font-semibold">
                              管理者
                            </span>
                          )}
                          {myRole === 'editor' && (
                            <span className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full font-semibold">
                              編集者
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 text-sm">{group.description}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <p className="text-2xl font-bold text-blue-600">{group._count?.members || 0}</p>
                        <p className="text-xs text-gray-600 mt-1">メンバー</p>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <p className="text-2xl font-bold text-green-600">{group._count?.memos || 0}</p>
                        <p className="text-xs text-gray-600 mt-1">メモ</p>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <p className="text-2xl font-bold text-purple-600">{group._count?.photos || 0}</p>
                        <p className="text-xs text-gray-600 mt-1">写真</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleOpenGroup(group.id)}
                        className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                      >
                        グループを開く →
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* グループ機能の説明 */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200 p-8">
              <h3 className="text-xl font-bold text-blue-900 mb-4">💡 グループ機能とは？</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">👥</span>
                  <div>
                    <h4 className="font-bold text-blue-800 mb-1">チーム管理</h4>
                    <p className="text-sm text-blue-700">
                      チームや組織で電柱情報を共同管理できます
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🏷️</span>
                  <div>
                    <h4 className="font-bold text-blue-800 mb-1">専用メモ・タグ</h4>
                    <p className="text-sm text-blue-700">
                      グループ専用のメモやタグで情報を整理
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🔐</span>
                  <div>
                    <h4 className="font-bold text-blue-800 mb-1">役割と権限</h4>
                    <p className="text-sm text-blue-700">
                      管理者、メンバー、閲覧者の3段階の権限設定
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">📊</span>
                  <div>
                    <h4 className="font-bold text-blue-800 mb-1">CSVエクスポート</h4>
                    <p className="text-sm text-blue-700">
                      グループデータをCSV形式で出力し報告書作成
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* グループ作成モーダル */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg p-8 shadow-2xl">
            <h2 className="text-2xl font-bold mb-6">グループを作成</h2>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  グループ名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="例: A市管理街路灯"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  maxLength={500}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewGroupName('');
                  setNewGroupDescription('');
                }}
                disabled={creating}
                className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={handleCreateGroup}
                disabled={creating || !newGroupName.trim()}
                className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
