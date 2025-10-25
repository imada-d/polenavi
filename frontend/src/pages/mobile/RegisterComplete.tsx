// 何を: 登録完了画面（モバイル版）
// なぜ: 登録成功を伝え、次のアクションに誘導するため

import { useNavigate, useLocation } from 'react-router-dom';

export default function RegisterComplete() {
  const navigate = useNavigate();
  const location = useLocation();

  // 前の画面から受け取ったデータ
  const state = location.state || {};
  const { points } = state;

  // 地図に戻る
  const handleBackToMap = () => {
    navigate('/');
  };

  // 続けて登録
  const handleContinue = () => {
    navigate('/register/location');
  };

  return (
    <div className="h-screen w-full flex flex-col bg-gray-50">
      {/* メインコンテンツ */}
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        {/* 完了アイコン */}
        <div className="text-8xl mb-6">🎉</div>

        {/* 完了メッセージ */}
        <h1 className="text-3xl font-bold mb-2">登録完了！</h1>
        <p className="text-gray-600 mb-8">電柱を登録しました</p>

        {/* ポイント表示 */}
        <div className="bg-white rounded-lg p-6 mb-8 shadow-lg w-full max-w-md">
          <div className="text-center mb-4">
            <p className="text-gray-600 mb-2">🎁 獲得ポイント</p>
            <p className="text-5xl font-bold text-blue-600">+{points || 10}pt</p>
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">累計登録数</span>
              <span className="text-xl font-bold">15本</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">累計ポイント</span>
              <span className="text-xl font-bold">150pt</span>
            </div>
          </div>
        </div>

        {/* ヒント */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8 w-full max-w-md">
          <p className="text-sm text-gray-700">
            💡 <strong>次のステップ</strong>
            <br />
            ・続けて登録するとポイントが貯まります
            <br />
            ・連続登録でボーナスポイントがもらえます
            <br />
            ・月間ランキングで上位を目指そう！
          </p>
        </div>

        {/* ボタンエリア */}
        <div className="w-full max-w-md space-y-3">
          <button
            onClick={handleContinue}
            className="w-full py-4 rounded-lg font-bold text-lg bg-blue-600 text-white hover:bg-blue-700 shadow-lg"
          >
            ⚡ 続けて登録する
          </button>
          <button
            onClick={handleBackToMap}
            className="w-full py-4 rounded-lg font-bold text-lg bg-white text-gray-700 hover:bg-gray-100 border-2 border-gray-300"
          >
            🗺️ 地図に戻る
          </button>
        </div>
      </main>
    </div>
  );
}
