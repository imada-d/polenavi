import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import PhotoCapture from '../../components/mobile/PhotoCapture';

// 写真の分類タイプ
type PhotoType = 'plate' | 'full' | 'detail';

// 各写真の情報
interface Photo {
  dataUrl: string; // Base64データ
  type: PhotoType | null; // 分類（未選択の場合はnull）
}

export default function RegisterPhotoClassify() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // 前の画面から受け取ったデータ
  const { location: pinLocation, poleType, poleSubType, plateCount } = location.state || {};
  
  // 写真の配列（最大4枚）
  const [photos, setPhotos] = useState<Photo[]>([]);
  
  // 写真追加中かどうか（PhotoCaptureを表示するか）
  const [isAdding, setIsAdding] = useState(false);

  // 写真を追加
  const handlePhotoAdd = (dataUrl: string) => {
    // dataUrlをBase64データとして受け取る
    // 新しい写真を追加（分類は未選択）
    setPhotos([...photos, { dataUrl, type: null }]);
    setIsAdding(false); // PhotoCaptureを非表示
  };

  // 写真を複数追加（まとめて）
  const handleMultiplePhotosAdd = (dataUrls: string[]) => {
    // 最大4枚まで
    const currentCount = photos.length;
    const available = 4 - currentCount;
    const toAdd = dataUrls.slice(0, available);
    
    const newPhotos = toAdd.map(dataUrl => ({ dataUrl, type: null }));
    setPhotos([...photos, ...newPhotos]);
    setIsAdding(false);
    
    // 4枚超えた場合は警告
    if (dataUrls.length > available) {
      alert(`最大4枚までです。${available}枚のみ追加しました。`);
    }
  };

  // 写真を削除
  const handlePhotoDelete = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    setPhotos(newPhotos);
  };

  // 写真の分類を変更
  const handleTypeChange = (index: number, type: PhotoType) => {
    const newPhotos = [...photos];
    
    // すでに番号札が選択されている場合、他の写真で番号札を選べない
    if (type === 'plate') {
      const alreadyHasPlate = photos.some((p, i) => i !== index && p.type === 'plate');
      if (alreadyHasPlate) {
        alert('番号札は1枚のみ選択できます');
        return;
      }
    }
    
    newPhotos[index].type = type;
    setPhotos(newPhotos);
  };

  // 次へボタン
  const handleNext = () => {
    // 写真を分類ごとに分ける
    const platePhoto = photos.find(p => p.type === 'plate')?.dataUrl;
    const fullPhotos = photos.filter(p => p.type === 'full').map(p => p.dataUrl);
    const detailPhotos = photos.filter(p => p.type === 'detail').map(p => p.dataUrl);

    const photosData = {
      plate: platePhoto,
      full: fullPhotos,
      detail: detailPhotos
    };

    // 番号札が0枚の場合は番号入力をスキップしてメモ画面へ
    if (plateCount === 0) {
      navigate('/register/memo', {
        state: {
          location: pinLocation,
          poleType,
          poleSubType,
          plateCount,
          numbers: [], // 空配列（自動生成される）
          photos: photosData
        }
      });
      return;
    }

    // 1枚以上の場合は番号入力画面へ
    navigate('/register/number-input', {
      state: {
        location: pinLocation,
        poleType,
        poleSubType,
        plateCount,
        photos: photosData
      }
    });
  };

  // 番号札が選択されているか
  const hasPlatePhoto = photos.some(p => p.type === 'plate');
  
  // 写真が0枚か
  const hasNoPhotos = photos.length === 0;

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
        <h1 className="text-xl font-bold">写真を撮影</h1>
      </header>
      
      {/* メインコンテンツ */}
      <main className="flex-1 overflow-y-auto p-4">
        
        {/* 説明 */}
        <div className="mb-6 max-w-md mx-auto">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-gray-700">
              📸 <strong>写真を撮影してください</strong><br />
              {plateCount === 0 
                ? '番号札がないので、全体写真を撮影してください'
                : '番号札をまとめて撮影し、後から分類できます（最大4枚）'
              }
            </p>
          </div>
        </div>

        {/* 写真追加エリア */}
        {!isAdding && photos.length < 4 && (
          <div className="mb-6 max-w-md mx-auto">
            <button
              onClick={() => setIsAdding(true)}
              className="w-full py-4 bg-white text-gray-700 border-2 border-gray-300 rounded-lg font-bold text-lg hover:border-gray-400"
            >
              📷 写真を追加（{photos.length}/4枚）
            </button>
          </div>
        )}

        {/* PhotoCaptureコンポーネント（写真追加中のみ表示） */}
        {isAdding && (
          <div className="mb-6 max-w-md mx-auto">
            <PhotoCapture 
              onPhotoCapture={handlePhotoAdd}
              onMultiplePhotoCapture={handleMultiplePhotosAdd}
              buttonText="撮影する"
              allowGallery={true}
              allowMultiple={true}
            />
            <button
              onClick={() => setIsAdding(false)}
              className="w-full mt-3 py-3 bg-white text-gray-700 border-2 border-gray-300 rounded-lg font-bold hover:border-gray-400"
            >
              キャンセル
            </button>
          </div>
        )}

        {/* 撮影した写真一覧 */}
        {photos.length > 0 && (
          <div className="mb-6 max-w-md mx-auto space-y-4">
            <h2 className="text-lg font-bold">📋 撮影した写真を分類</h2>
            
            {photos.map((photo, index) => (
              <div key={index} className="bg-white rounded-lg border-2 border-gray-300 p-3">
                {/* サムネイル */}
                <img 
                  src={photo.dataUrl} 
                  alt={`写真${index + 1}`}
                  className="w-full h-40 object-cover rounded mb-3"
                />
                
                {/* 分類ボタン */}
                <div className="space-y-2">
                  <p className="text-sm font-bold text-gray-700">この写真は何ですか？</p>
                  
                  <div className="flex gap-2">
                    {/* 番号札ボタン */}
                    <button
                      onClick={() => handleTypeChange(index, 'plate')}
                      className={`flex-1 py-2 rounded border-2 font-bold text-sm transition-all ${
                        photo.type === 'plate'
                          ? 'bg-gray-50 text-gray-900 border-gray-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      📋 番号札
                    </button>
                    
                    {/* 全体写真ボタン */}
                    <button
                      onClick={() => handleTypeChange(index, 'full')}
                      className={`flex-1 py-2 rounded border-2 font-bold text-sm transition-all ${
                        photo.type === 'full'
                          ? 'bg-gray-50 text-gray-900 border-gray-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      📷 全体
                    </button>
                    
                    {/* 詳細写真ボタン */}
                    <button
                      onClick={() => handleTypeChange(index, 'detail')}
                      className={`flex-1 py-2 rounded border-2 font-bold text-sm transition-all ${
                        photo.type === 'detail'
                          ? 'bg-gray-50 text-gray-900 border-gray-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      🔍 詳細
                    </button>
                  </div>
                </div>
                
                {/* 削除ボタン */}
                <button
                  onClick={() => handlePhotoDelete(index)}
                  className="w-full mt-3 py-2 bg-white text-red-600 border-2 border-gray-300 rounded font-bold hover:border-red-400"
                >
                  🗑️ 削除
                </button>
              </div>
            ))}
          </div>
        )}

        {/* 警告メッセージ */}
        {(hasNoPhotos || !hasPlatePhoto) && (
          <div className="mb-6 max-w-md mx-auto">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-gray-700">
                ⚠️ <strong>注意</strong><br />
                {hasNoPhotos && '写真が0枚です。'}
                {!hasNoPhotos && !hasPlatePhoto && '番号札の写真がありません。'}
              </p>
            </div>
          </div>
        )}
      </main>

      {/* 次へボタン（常に表示） */}
      <div className="p-4 pb-20 bg-white border-t">
        <button
          onClick={handleNext}
          className="w-full py-3 rounded-lg font-bold text-lg bg-white text-gray-700 border-2 border-gray-300 hover:border-gray-400"
        >
          {plateCount === 0 ? '次へ（メモ入力）' : '次へ（番号入力）'}
        </button>
      </div>
    </div>
  );
}