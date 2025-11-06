// 何を: モバイル用マイページ画面
// なぜ: ユーザーのプロフィール、統計、設定を一元管理するため

import { useState } from 'react';
import BottomNav from '../../components/mobile/BottomNav';

export default function MyPage() {
  // TODO: バックエンドAPIが実装されたら、実際のユーザーデータを取得
  const [userData] = useState({
    name: 'ゲストユーザー',
    email: 'guest@example.com',
    joinedAt: '2024-01-15',
    stats: {
      polesRegistered: 42,
      photosUploaded: 38,
      memosWritten: 28,
      groupsJoined: 2,
    },
  });

  const [recentPoles] = useState([
    // サンプルデータ（バックエンド実装後に削除）
    {
      id: 1,
      number: '247エ714',
      registeredAt: '2024-11-05',
      hasPhoto: true,
    },
    {
      id: 2,
      number: '247エ715',
      registeredAt: '2024-11-04',
      hasPhoto: false,
    },
    {
      id: 3,
      number: '247エ716',
      registeredAt: '2024-11-03',
      hasPhoto: true,
    },
  ]);

  const [joinedGroups] = useState([
    {
      id: 1,
      name: 'A市管理街路灯',
      role: 'admin',
    },
    {
      id: 2,
      name: 'B電気工事 東エリア',
      role: 'member',
    },
  ]);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white border-b px-4 py-3">
        <h1 className="text-lg font-bold">👤 マイページ</h1>
      </header>

      {/* コンテンツ */}
      <div className="flex-1 overflow-y-auto p-4 pb-20">
        <div className="space-y-4">
          {/* プロフィールカード */}
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold">{userData.name}</h2>
                <p className="text-sm text-gray-500">{userData.email}</p>
              </div>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-blue-700">
                編集
              </button>
            </div>
            <div className="text-sm text-gray-500">
              登録日: {new Date(userData.joinedAt).toLocaleDateString('ja-JP')}
            </div>
          </div>

          {/* 統計情報 */}
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <h3 className="font-bold mb-3">📊 活動統計</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {userData.stats.polesRegistered}
                </div>
                <div className="text-sm text-gray-600 mt-1">登録した電柱</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {userData.stats.photosUploaded}
                </div>
                <div className="text-sm text-gray-600 mt-1">撮影した写真</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {userData.stats.memosWritten}
                </div>
                <div className="text-sm text-gray-600 mt-1">書いたメモ</div>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {userData.stats.groupsJoined}
                </div>
                <div className="text-sm text-gray-600 mt-1">参加グループ</div>
              </div>
            </div>
          </div>

          {/* 最近の登録履歴 */}
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold">🗺️ 最近の登録</h3>
              <button className="text-blue-600 text-sm font-semibold">
                すべて見る →
              </button>
            </div>
            <div className="space-y-2">
              {recentPoles.map((pole) => (
                <div
                  key={pole.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-bold text-blue-600">{pole.number}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(pole.registeredAt).toLocaleDateString('ja-JP')}
                    </p>
                  </div>
                  {pole.hasPhoto && (
                    <span className="text-sm bg-green-100 text-green-700 px-2 py-1 rounded">
                      📷 写真あり
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 所属グループ */}
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold">👥 所属グループ</h3>
              <button className="text-blue-600 text-sm font-semibold">
                すべて見る →
              </button>
            </div>
            <div className="space-y-2">
              {joinedGroups.map((group) => (
                <div
                  key={group.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <p className="font-bold">{group.name}</p>
                  {group.role === 'admin' && (
                    <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                      管理者
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 設定メニュー */}
          <div className="bg-white rounded-lg shadow-sm border">
            <h3 className="font-bold p-4 border-b">⚙️ 設定</h3>
            <div className="divide-y">
              <button className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center justify-between">
                <span>プロフィール編集</span>
                <span className="text-gray-400">→</span>
              </button>
              <button className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center justify-between">
                <span>通知設定</span>
                <span className="text-gray-400">→</span>
              </button>
              <button className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center justify-between">
                <span>プライバシー設定</span>
                <span className="text-gray-400">→</span>
              </button>
              <button className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center justify-between">
                <span>アカウント設定</span>
                <span className="text-gray-400">→</span>
              </button>
              <button className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center justify-between">
                <span>ヘルプ・サポート</span>
                <span className="text-gray-400">→</span>
              </button>
              <button className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center justify-between text-red-600">
                <span>ログアウト</span>
                <span className="text-red-400">→</span>
              </button>
            </div>
          </div>

          {/* バージョン情報 */}
          <div className="text-center text-sm text-gray-400 py-4">
            PoleNavi v1.0.0
          </div>
        </div>
      </div>

      {/* ボトムナビ */}
      <BottomNav />
    </div>
  );
}
