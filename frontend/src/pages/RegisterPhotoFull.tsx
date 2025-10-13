import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import PhotoCapture from '../components/PhotoCapture';

export default function RegisterPhotoFull() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // 前の画面から受け取ったデータ
  const { 
    location: pinLocation, 
    poleType, 
    poleSubType,
    plateCount 
  } = location.state || {};
  
  const [photoData, setPhotoData] = useState<string | null>(null); // 撮影した写真のBase64データ

  // 写真が撮影されたら
  const handlePhotoCapture = (dataUrl: string) => {
    setPhotoData(dataUrl);
  };

  // 次へ進む
  const handleNext = () => {
    if (!photoData) {
      alert('写真を撮影してください');
      return;
    }

    // 次の画面へ（番号入力画面、未実装）
    alert('次は番号入力画面へ（未実装）');
    // TODO: navigate('/register/number-input', { 
    //   state: { 
    //     location: pinLocation,
    //     poleType,
    //     poleSubType,
    //     plateCount,
    //     fullPhoto: photoData  // 全体写真を渡す
    //   } 
    // });
  };

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
        <h1 className="text-xl font-bold">全体写真を撮影</h1>
      </header>
      
      {/* メインコンテンツ */}
      <main className="flex-1 overflow-y-auto p-4">
        
        {/* 説明 */}
        <div className="mb-6 max-w-md mx-auto">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-gray-700">
              💡 <strong>撮影のコツ</strong><br />
              柱全体が写るように撮影してください。<br />
              番号札がない場合でも、柱の形状がわかる写真があると便利です。
            </p>
          </div>
        </div>

        {/* 写真撮影コンポーネント */}
        <div className="max-w-md mx-auto">
          <PhotoCapture
            onPhotoCapture={handlePhotoCapture}
            buttonText="全体写真を撮影"
            allowGallery={true}
          />
        </div>

        {/* ポイント表示 */}
        {photoData && (
          <div className="mt-6 max-w-md mx-auto animate-fadeIn">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-gray-700">
                ✅ <strong>撮影完了</strong><br />
                次のステップで番号を入力します。
              </p>
            </div>
          </div>
        )}
      </main>

      {/* 次へボタン（写真が撮影されたら表示） */}
      {photoData && (
        <div className="p-4 bg-white border-t animate-fadeIn">
          <button
            onClick={handleNext}
            className="w-full py-3 rounded-lg font-bold text-lg bg-blue-600 text-white hover:bg-blue-700"
          >
            次へ（番号入力）
          </button>
        </div>
      )}
    </div>
  );
}