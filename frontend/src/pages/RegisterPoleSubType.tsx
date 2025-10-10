import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface LocationState {
  location: [number, number];
  poleType: 'pole' | 'other';
}

type SubType = 'light' | 'sign' | 'traffic' | 'other';

export default function RegisterPoleSubType() {
  const navigate = useNavigate();
  const locationState = useLocation();
  const { location, poleType } = (locationState.state as LocationState) || { location: null, poleType: 'other' };
  
  const [selectedSubType, setSelectedSubType] = useState<SubType | null>(null);

  const subTypeOptions = [
    { id: 'light' as SubType, icon: '💡', name: '照明柱', description: '街路灯、防犯灯など' },
    { id: 'sign' as SubType, icon: '🚏', name: '標識柱', description: '道路標識、案内標識など' },
    { id: 'traffic' as SubType, icon: '🚦', name: '信号柱', description: '信号機の柱' },
    { id: 'other' as SubType, icon: '📍', name: 'その他', description: 'その他の柱' },
  ];

  const handleNext = () => {
    if (!selectedSubType) {
      alert('柱の詳細を選択してください');
      return;
    }

    // TODO: 次の画面（番号札枚数確認）へ遷移（未実装）
    alert('次の画面（番号札枚数確認）へ進みます\n※まだ未実装です');
    // navigate('/register/plate-count', { 
    //   state: { 
    //     location, 
    //     poleType: 'other', 
    //     subType: selectedSubType 
    //   } 
    // });
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
        <h1 className="text-lg font-bold">柱の詳細を選択</h1>
        <div className="w-10"></div>
      </header>

      {/* メインコンテンツ */}
      <main className="flex-1 px-4 py-6 overflow-y-auto">
        <div className="max-w-md mx-auto">
          {/* 説明 */}
          <div className="mb-6">
            <p className="text-gray-600">登録する柱の種類を選択してください</p>
          </div>

          {/* 選択肢 */}
          <div className="space-y-3">
            {subTypeOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => setSelectedSubType(option.id)}
                className={`w-full p-4 rounded-lg border-2 flex items-center gap-4 transition-all ${
                  selectedSubType === option.id
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="text-3xl">{option.icon}</div>
                <div className="flex-1 text-left">
                  <div className="font-bold text-lg">{option.name}</div>
                  <div className="text-sm text-gray-600">{option.description}</div>
                </div>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  selectedSubType === option.id
                    ? 'border-blue-600 bg-blue-600'
                    : 'border-gray-300'
                }`}>
                  {selectedSubType === option.id && (
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </main>

      {/* 次へボタン */}
      <div className="bg-white border-t px-4 py-4">
        <button
          onClick={handleNext}
          disabled={!selectedSubType}
          className={`w-full py-3 rounded-lg font-bold transition-all ${
            selectedSubType
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