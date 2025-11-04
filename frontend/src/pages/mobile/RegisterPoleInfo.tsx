import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function RegisterPoleInfo() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // 前の画面（位置確認）から受け取ったデータ
  // pinLocation は [緯度, 経度] の配列
  const { location: pinLocation } = location.state || {};
  
  // ステップ1: 柱の種類
  const [poleType, setPoleType] = useState<'electric' | 'other' | null>(null);
  
  // ステップ2: その他の詳細（poleType が 'other' の場合のみ）
  const [poleSubType, setPoleSubType] = useState<'light' | 'sign' | 'traffic' | 'other' | null>(null);
  
  // ステップ3: 番号札の枚数
  const [plateCount, setPlateCount] = useState<number | null>(null);

  // 次へボタン
  const handleNext = () => {
    // バリデーション
    if (!poleType) {
      alert('柱の種類を選択してください');
      return;
    }
    
    if (poleType === 'other' && !poleSubType) {
      alert('詳細を選択してください');
      return;
    }
    
    if (plateCount === null) {
      alert('番号札の枚数を選択してください');
      return;
    }

    // 次の画面へ（写真分類）
    // 0枚でも1枚以上でも同じ画面を使う
    navigate('/register/photo-classify', { 
      state: { 
        location: pinLocation,  // 位置情報
        poleType,               // 柱の種類
        poleSubType,            // その他の詳細（poleType='other'の場合のみ）
        plateCount              // 番号札の枚数
      } 
    });
};


  // 「次へ」ボタンを表示する条件
  // 電柱の場合: poleType && plateCount !== null
  // その他の場合: poleType && poleSubType && plateCount !== null
  const canProceed = 
    poleType === 'electric' 
      ? plateCount !== null
      : poleType === 'other' && poleSubType && plateCount !== null;

  return (
    <div className="h-screen w-full flex flex-col bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white border-b px-4 py-3 flex items-center">
        <button 
          onClick={() => navigate(-1)}
          className="text-2xl mr-3"
        >
          ←
        </button>
        <h1 className="text-xl font-bold">電柱登録</h1>
      </header>
      
      {/* メインコンテンツ */}
      <main className="flex-1 overflow-y-auto p-4">
        
        {/* ========== ステップ1: 柱の種類 ========== */}
        <div className="mb-6">
          <h2 className="text-lg font-bold mb-3">📍 柱の種類を選択</h2>
          <div className="space-y-3 max-w-md mx-auto">
            {/* 電柱 */}
            <button
              onClick={() => {
                setPoleType('electric');
                setPoleSubType(null); // その他の詳細をリセット
              }}
              className={`w-full p-4 rounded-lg border-2 flex items-center transition-all ${
                poleType === 'electric'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
              }`}
            >
              <span className="text-2xl mr-3">⚡</span>
              <div className="text-left">
                <div className="font-bold">電柱</div>
              </div>
            </button>

            {/* その他 */}
            <button
              onClick={() => setPoleType('other')}
              className={`w-full p-4 rounded-lg border-2 flex items-center transition-all ${
                poleType === 'other'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
              }`}
            >
              <span className="text-2xl mr-3">📍</span>
              <div className="text-left">
                <div className="font-bold">その他</div>
                <div className={`text-sm ${poleType === 'other' ? 'text-blue-100' : 'text-gray-500'}`}>
                  照明柱、標識柱、信号柱など
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* ========== ステップ2: その他の詳細（poleType が 'other' の場合のみ表示） ========== */}
        {poleType === 'other' && (
          <div className="mb-6 animate-fadeIn">
            <h2 className="text-lg font-bold mb-3">🔍 詳細を選択</h2>
            <div className="space-y-3 max-w-md mx-auto">
              {/* 照明柱 */}
              <button
                onClick={() => setPoleSubType('light')}
                className={`w-full p-4 rounded-lg border-2 flex items-center transition-all ${
                  poleSubType === 'light'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                }`}
              >
                <span className="text-2xl mr-3">💡</span>
                <div className="text-left font-bold">照明柱</div>
              </button>

              {/* 標識柱 */}
              <button
                onClick={() => setPoleSubType('sign')}
                className={`w-full p-4 rounded-lg border-2 flex items-center transition-all ${
                  poleSubType === 'sign'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                }`}
              >
                <span className="text-2xl mr-3">🚏</span>
                <div className="text-left font-bold">標識柱</div>
              </button>

              {/* 信号柱 */}
              <button
                onClick={() => setPoleSubType('traffic')}
                className={`w-full p-4 rounded-lg border-2 flex items-center transition-all ${
                  poleSubType === 'traffic'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                }`}
              >
                <span className="text-2xl mr-3">🚦</span>
                <div className="text-left font-bold">信号柱</div>
              </button>

              {/* その他 */}
              <button
                onClick={() => setPoleSubType('other')}
                className={`w-full p-4 rounded-lg border-2 flex items-center transition-all ${
                  poleSubType === 'other'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                }`}
              >
                <span className="text-2xl mr-3">📍</span>
                <div className="text-left font-bold">その他</div>
              </button>
            </div>
          </div>
        )}

        {/* ========== ステップ3: 番号札の枚数（poleType が選択されている場合のみ表示） ========== */}
        {/* 電柱の場合: すぐ表示 */}
        {/* その他の場合: poleSubType も選択されていたら表示 */}
        {(poleType === 'electric' || (poleType === 'other' && poleSubType)) && (
          <div className="mb-6 animate-fadeIn">
            <h2 className="text-lg font-bold mb-3">❓ 番号札は何枚？</h2>
            <p className="text-sm text-gray-600 mb-3 max-w-md mx-auto">
              この柱に付いている番号札の枚数を選択してください
            </p>
            <div className="space-y-3 max-w-md mx-auto">
              {/* 0枚（なし） */}
              <button
                onClick={() => setPlateCount(0)}
                className={`w-full py-4 rounded-lg border-2 font-bold text-lg transition-all ${
                  plateCount === 0
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                }`}
              >
                0枚（なし）
              </button>

              {/* 1枚 */}
              <button
                onClick={() => setPlateCount(1)}
                className={`w-full py-4 rounded-lg border-2 font-bold text-lg transition-all ${
                  plateCount === 1
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                }`}
              >
                1枚
              </button>

              {/* 2枚 */}
              <button
                onClick={() => setPlateCount(2)}
                className={`w-full py-4 rounded-lg border-2 font-bold text-lg transition-all ${
                  plateCount === 2
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                }`}
              >
                2枚
              </button>

              {/* 3枚 */}
              <button
                onClick={() => setPlateCount(3)}
                className={`w-full py-4 rounded-lg border-2 font-bold text-lg transition-all ${
                  plateCount === 3
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                }`}
              >
                3枚
              </button>

              {/* 4枚以上 */}
              <button
                onClick={() => setPlateCount(4)}
                className={`w-full py-4 rounded-lg border-2 font-bold text-lg transition-all ${
                  plateCount === 4
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                }`}
              >
                4枚以上
              </button>
            </div>
          </div>
        )}

        {/* ヒント */}
        {plateCount !== null && (
          <div className="mt-6 max-w-md mx-auto animate-fadeIn">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-gray-700">
                💡 <strong>次のステップ</strong><br />
                {plateCount === 0 
                  ? '番号札がないので、全体写真を撮影します'
                  : `${plateCount}枚の番号札をまとめて撮影します`
                }
              </p>
            </div>
          </div>
        )}
      </main>

      {/* 次へボタン（全ての選択が完了したら表示） */}
      {canProceed && (
        <div className="p-4 bg-white border-t animate-fadeIn">
          <button
            onClick={handleNext}
            className="w-full py-3 rounded-lg font-bold text-lg bg-blue-600 text-white hover:bg-blue-700"
          >
            次へ（写真撮影）
          </button>
        </div>
      )}
    </div>
  );
}