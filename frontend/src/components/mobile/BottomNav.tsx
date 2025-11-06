import { Link, useLocation } from 'react-router-dom';

// 何を: モバイル用ボトムナビゲーション（4タブ）
// なぜ: シンプルで業務実用的なUIにするため
export default function BottomNav() {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  // 何を: 4タブのナビゲーション（地図/検索/グループ/マイページ）
  // なぜ: ゲーミフィケーション削除、グループ機能重視の新設計
  const navItems = [
    { path: '/', icon: '🗺️', label: '地図' },
    { path: '/search', icon: '🔍', label: '検索' },
    { path: '/groups', icon: '👥', label: 'グループ' },
    { path: '/mypage', icon: '👤', label: 'マイページ' },
  ];
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t z-[2000] md:hidden">
      <div className="flex justify-around">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex-1 flex flex-col items-center py-2 ${
              isActive(item.path)
                ? 'text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <span className="text-2xl">{item.icon}</span>
            <span className="text-xs mt-1">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}