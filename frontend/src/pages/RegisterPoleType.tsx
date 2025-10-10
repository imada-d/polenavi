import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface LocationState {
  location: [number, number];
}

export default function RegisterPoleType() {
  const navigate = useNavigate();
  const locationState = useLocation();
  const { location } = (locationState.state as LocationState) || { location: null };
  
  const [selectedType, setSelectedType] = useState<'pole' | 'other' | null>(null);

  const handleNext = () => {
    if (!selectedType) {
      alert('柱の種類を選択してください');
      return;
    }

    if (selectedType === 'pole') {
      // TODO: 事業者選択画面へ（未実装）
      alert('次の画面（事業者選択）へ進みます\n※まだ未実装です');
      // navigate('/register/operator', { state: { location, poleType: 'pole' } });
    } else {
      // その他 → 詳細選択画面へ
      navigate('/register/pole-subtype', { state: { location, poleType: 'other' } });
    }
  };

  return (
    <div className="h-screen w-full flex flex-col bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded"
        >
          ← 戻る
        </button>
        <h1 className="text-lg font-bold">柱の種類を選択</h1>
        <div className="w-10"></div>
      </header>

      {/* メインコンテンツ */}
      <main className="flex-1 px-4 py-6">
        <div className="max-w-md mx-auto">
          {/* 説明 */}
          <div className="mb-6">
            <p className="text-gray-600">登録する柱の種類を選択してください</p>
          </div>

          {/* 選択肢 */}
          <div className="space-y-3">
            {/* 電柱 */}
            <button
              onClick={() => setSelectedType('pole')}
              className={`w-full p-4 rounded-lg border-2 flex items-center gap-4 transition-all ${
                selectedType === 'pole'
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="text-3xl">⚡</div>
              <div className="flex-1 text-left">
                <div className="font-bold text-lg">電柱</div>
                <div className="text-sm text-gray-600">電力会社が管理する電柱</div>
              </div>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                selectedType === 'pole'
                  ? 'border-blue-600 bg-blue-600'
                  : 'border-gray-300'
              }`}>
                {selectedType === 'pole' && (
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                )}
              </div>
            </button>

            {/* その他 */}
            <button
              onClick={() => setSelectedType('other')}
              className={`w-full p-4 rounded-lg border-2 flex items-center gap-4 transition-all ${
                selectedType === 'other'
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="text-3xl">📍</div>
              <div className="flex-1 text-left">
                <div className="font-bold text-lg">その他</div>
                <div className="text-sm text-gray-600">照明柱、標識柱、信号柱など</div>
              </div>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                selectedType === 'other'
                  ? 'border-blue-600 bg-blue-600'
                  : 'border-gray-300'
              }`}>
                {selectedType === 'other' && (
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                )}
              </div>
            </button>
          </div>
        </div>
      </main>

      {/* 次へボタン */}
      <div className="bg-white border-t px-4 py-4">
        <button
          onClick={handleNext}
          disabled={!selectedType}
          className={`w-full py-3 rounded-lg font-bold transition-all ${
            selectedType
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          次へ
        </button>
      </div>
    </div>
  );
}