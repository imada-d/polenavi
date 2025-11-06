// 何を: PC用グループ画面
// なぜ: PC画面でグループ管理機能を提供するため

import { useState } from 'react';
import Header from '../../components/pc/Header';

export default function GroupsPC() {
  // TODO: バックエンドAPIが実装されたら、実際のグループデータを取得
  const [groups] = useState([
    {
      id: 1,
      name: 'A市管理街路灯',
      description: 'A市内の防犯灯・街路灯の管理グループ。定期点検と修繕記録を共有しています。',
      memberCount: 12,
      poleCount: 245,
      role: 'admin',
      createdAt: '2024-01-15',
    },
    {
      id: 2,
      name: 'B電気工事 東エリア',
      description: 'B電気工事株式会社の東エリア担当チーム。作業記録とメンテナンス情報を管理。',
      memberCount: 8,
      poleCount: 156,
      role: 'member',
      createdAt: '2024-02-20',
    },
  ]);

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
          <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
            ＋ 新規グループ作成
          </button>
        </div>

        {groups.length === 0 ? (
          /* 空の状態 */
          <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
            <div className="text-6xl mb-4">👥</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              まだグループに参加していません
            </h2>
            <p className="text-gray-600 mb-8">
              グループを作成して、チームで電柱情報を共有しましょう
            </p>
            <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
              ＋ グループを作成
            </button>
          </div>
        ) : (
          <>
            {/* グループ一覧 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {groups.map((group) => (
                <div
                  key={group.id}
                  className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-800">{group.name}</h3>
                        {group.role === 'admin' && (
                          <span className="bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded-full font-semibold">
                            管理者
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm">{group.description}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">{group.memberCount}</p>
                      <p className="text-xs text-gray-600 mt-1">メンバー</p>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">{group.poleCount}</p>
                      <p className="text-xs text-gray-600 mt-1">登録電柱</p>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">作成日</p>
                      <p className="text-sm font-semibold text-purple-600">
                        {new Date(group.createdAt).toLocaleDateString('ja-JP', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                      グループを開く →
                    </button>
                    {group.role === 'admin' && (
                      <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-200 transition-colors">
                        ⚙️
                      </button>
                    )}
                  </div>
                </div>
              ))}
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
    </div>
  );
}
