/**
 * 柱の種類選択コンポーネント（共通）
 * 手動入力・写真登録の両方で使用
 */

interface PoleTypeSelectorProps {
  poleType: 'electric' | 'other' | null;
  poleSubType: 'light' | 'sign' | 'traffic' | 'other' | null;
  onPoleTypeChange: (type: 'electric' | 'other') => void;
  onPoleSubTypeChange: (subType: 'light' | 'sign' | 'traffic' | 'other') => void;
}

export default function PoleTypeSelector({
  poleType,
  poleSubType,
  onPoleTypeChange,
  onPoleSubTypeChange,
}: PoleTypeSelectorProps) {
  return (
    <>
      {/* ========== ステップ1: 柱の種類 ========== */}
      <div className="mb-6">
        <h2 className="text-lg font-bold mb-3">📍 柱の種類を選択</h2>
        <div className="space-y-3 max-w-md mx-auto">
          {/* 電柱 */}
          <button
            onClick={() => onPoleTypeChange('electric')}
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
            onClick={() => onPoleTypeChange('other')}
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
              onClick={() => onPoleSubTypeChange('light')}
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
              onClick={() => onPoleSubTypeChange('sign')}
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
              onClick={() => onPoleSubTypeChange('traffic')}
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
              onClick={() => onPoleSubTypeChange('other')}
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
    </>
  );
}
