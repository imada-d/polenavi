// 何を: モバイル用グループ画面
// なぜ: グループ機能でチーム・組織での電柱管理を可能にするため

import { useState } from 'react';
import BottomNav from '../../components/mobile/BottomNav';

export default function Groups() {
  // TODO: バックエンドAPIが実装されたら、実際のグループデータを取得
  const [groups] = useState([
    // サンプルデータ（バックエンド実装後に削除）
    {
      id: 1,
      name: 'A市管理街路灯',
      description: 'A市内の防犯灯・街路灯の管理',
      memberCount: 12,
      poleCount: 245,
      role: 'admin',
    },
    {
      id: 2,
      name: 'B電気工事 東エリア',
      description: 'B社の作業記録用グループ',
      memberCount: 8,
      poleCount: 156,
      role: 'member',
    },
  ]);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-bold">👥 グループ</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-blue-700">
          ＋ 作成
        </button>
      </header>

      {/* コンテンツ */}
      <div className="flex-1 overflow-y-auto p-4 pb-20">
        <div className="space-y-3">
          {groups.length === 0 ? (
            <div className="bg-white rounded-lg p-8 text-center">
              <p className="text-gray-500 mb-4">まだグループに参加していません</p>
              <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700">
                ＋ グループを作成
              </button>
            </div>
          ) : (
            <>
              {groups.map((group) => (
                <div key={group.id} className="bg-white rounded-lg shadow-sm border p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-bold text-lg">{group.name}</h3>
                      {group.role === 'admin' && (
                        <span className="inline-block bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded mt-1">
                          管理者
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{group.description}</p>
                  <div className="flex gap-4 text-sm text-gray-500">
                    <span>👥 {group.memberCount}人</span>
                    <span>🗺️ {group.poleCount}本</span>
                  </div>
                  <button className="w-full mt-3 bg-gray-100 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-200">
                    グループを開く →
                  </button>
                </div>
              ))}
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
      </div>

      {/* ボトムナビ */}
      <BottomNav />
    </div>
  );
}
