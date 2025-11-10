// 何を: PC用ヘッダーコンポーネント
// なぜ: PC画面のナビゲーションとユーザー情報を表示するため

import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface HeaderProps {
  onSearchClick?: () => void;
}

export default function Header({ onSearchClick }: HeaderProps = {}) {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="hidden md:flex bg-white border-b shadow-sm px-6 py-3 items-center justify-between">
      {/* ロゴとナビゲーション */}
      <div className="flex items-center gap-8">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl">🗺️</span>
          <h1 className="text-xl font-bold text-gray-800">PoleNavi</h1>
        </Link>

        <nav className="flex items-center gap-6">
          <Link
            to="/"
            className="text-gray-700 hover:text-blue-600 font-semibold transition-colors"
          >
            地図
          </Link>
          {onSearchClick ? (
            <button
              onClick={onSearchClick}
              className="text-gray-700 hover:text-blue-600 font-semibold transition-colors"
            >
              検索
            </button>
          ) : (
            <Link
              to="/search"
              className="text-gray-700 hover:text-blue-600 font-semibold transition-colors"
            >
              検索
            </Link>
          )}
          <Link
            to="/groups"
            className="text-gray-700 hover:text-blue-600 font-semibold transition-colors"
          >
            グループ
          </Link>
          <Link
            to="/register-from-photo"
            className="text-gray-700 hover:text-blue-600 font-semibold transition-colors flex items-center gap-1"
          >
            📸 写真で登録
          </Link>
        </nav>
      </div>

      {/* ユーザー情報とアクション */}
      <div className="flex items-center gap-4">
        {isAuthenticated && user ? (
          <>
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-800">
                {user.displayName || user.username}
              </p>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                to="/mypage"
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
              >
                マイページ
              </Link>
              <button
                onClick={handleLogout}
                className="bg-red-100 text-red-700 px-4 py-2 rounded-lg font-semibold hover:bg-red-200 transition-colors"
              >
                ログアウト
              </button>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
            >
              ログイン
            </Link>
            <Link
              to="/signup"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              会員登録
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
