import type { Dispatch, SetStateAction } from 'react';

// 何を: このコンポーネントが受け取るpropsの型定義
// なぜ: 親コンポーネント（RegisterPanel）からステートを受け取るため
interface PoleInfoSectionProps {
  poleType: 'electric' | 'other' | null;
  setPoleType: Dispatch<SetStateAction<'electric' | 'other' | null>>;
  poleSubType: 'light' | 'sign' | 'traffic' | 'other' | null;
  setPoleSubType: Dispatch<SetStateAction<'light' | 'sign' | 'traffic' | 'other' | null>>;
  plateCount: number | null;
  setPlateCount: Dispatch<SetStateAction<number | null>>;
}

export default function PoleInfoSection({
  poleType,
  setPoleType,
  poleSubType,
  setPoleSubType,
  plateCount,
  setPlateCount,
}: PoleInfoSectionProps) {

    // デバッグ用
  console.log('🔴 PoleInfoSection がレンダリングされました');
  console.log('🔴 このファイルのパス:', import.meta.url);  // ← 追加
  
  return (
    <>
      
      {/* ========== セクション1: 柱の種類 ========== */}
      <div>
        <h2 className="text-sm font-bold text-gray-700 mb-3">📌 柱の種類を選択</h2>
        <div className="space-y-2">
          {/* 電柱 */}
          <button
            onClick={() => {
              setPoleType('electric');
              setPoleSubType(null); // その他の詳細をリセット
            }}
            className={`w-full p-3 rounded-lg border-2 flex items-center transition-all ${
              poleType === 'electric'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
            }`}
          >
            <span className="text-xl mr-2">⚡</span>
            <div className="text-left">
              <div className="font-bold text-sm">電柱</div>
              <div className={`text-xs ${poleType === 'electric' ? 'text-blue-100' : 'text-gray-500'}`}>
                電力会社が管理
              </div>
            </div>
          </button>

          {/* その他 */}
          <button
            onClick={() => setPoleType('other')}
            className={`w-full p-3 rounded-lg border-2 flex items-center transition-all ${
              poleType === 'other'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
            }`}
          >
            <span className="text-xl mr-2">📍</span>
            <div className="text-left">
              <div className="font-bold text-sm">その他</div>
              <div className={`text-xs ${poleType === 'other' ? 'text-blue-100' : 'text-gray-500'}`}>
                照明柱、標識柱など
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* ========== セクション2: その他の詳細（poleType が 'other' の場合のみ表示） ========== */}
      {poleType === 'other' && (
        <div className="animate-fadeIn">
          <h2 className="text-sm font-bold text-gray-700 mb-3">🔍 詳細を選択</h2>
          <div className="space-y-2">
            {/* 照明柱 */}
            <button
              onClick={() => setPoleSubType('light')}
              className={`w-full p-3 rounded-lg border-2 flex items-center transition-all ${
                poleSubType === 'light'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
              }`}
            >
              <span className="text-xl mr-2">💡</span>
              <div className="text-left font-bold text-sm">照明柱</div>
            </button>

            {/* 標識柱 */}
            <button
              onClick={() => setPoleSubType('sign')}
              className={`w-full p-3 rounded-lg border-2 flex items-center transition-all ${
                poleSubType === 'sign'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
              }`}
            >
              <span className="text-xl mr-2">🚏</span>
              <div className="text-left font-bold text-sm">標識柱</div>
            </button>

            {/* 信号柱 */}
            <button
              onClick={() => setPoleSubType('traffic')}
              className={`w-full p-3 rounded-lg border-2 flex items-center transition-all ${
                poleSubType === 'traffic'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
              }`}
            >
              <span className="text-xl mr-2">🚦</span>
              <div className="text-left font-bold text-sm">信号柱</div>
            </button>

            {/* その他 */}
            <button
              onClick={() => setPoleSubType('other')}
              className={`w-full p-3 rounded-lg border-2 flex items-center transition-all ${
                poleSubType === 'other'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
              }`}
            >
              <span className="text-xl mr-2">📍</span>
              <div className="text-left font-bold text-sm">その他</div>
            </button>
          </div>
        </div>
      )}

      {/* ========== セクション3: 番号札の枚数（条件付き表示） ========== */}
      {/* 何を: poleTypeが選択され、その他の場合はpoleSubTypeも選択されている時に表示 */}
      {/* なぜ: 段階的に入力させるため */}
      {(poleType === 'electric' || (poleType === 'other' && poleSubType)) && (
        <div className="animate-fadeIn">
          <h2 className="text-sm font-bold text-gray-700 mb-3">❓ 番号札は何枚？</h2>
          <p className="text-xs text-gray-600 mb-3">
            この柱に付いている番号札の枚数を選択してください
          </p>
          <div className="grid grid-cols-2 gap-2">
            {/* 0枚 */}
            <button
              onClick={() => setPlateCount(0)}
              className={`py-3 rounded-lg border-2 font-bold text-sm transition-all ${
                plateCount === 0
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
              }`}
            >
              0枚
            </button>

            {/* 1枚 */}
            <button
              onClick={() => setPlateCount(1)}
              className={`py-3 rounded-lg border-2 font-bold text-sm transition-all ${
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
              className={`py-3 rounded-lg border-2 font-bold text-sm transition-all ${
                plateCount === 2
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
              }`}
            >
              2枚
            </button>

            {/* 3枚+ */}
            <button
              onClick={() => setPlateCount(3)}
              className={`py-3 rounded-lg border-2 font-bold text-sm transition-all ${
                plateCount === 3
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
              }`}
            >
              3枚+
            </button>
          </div>
        </div>
      )}
    </>
  );
}