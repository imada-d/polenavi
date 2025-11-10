/**
 * 写真から電柱登録 - 写真選択・分類画面（PC版）
 *
 * フロー:
 * 1. 複数写真選択（最大4枚）
 * 2. 各写真の種類選択（番号札は1枚必須）
 * 3. 番号札からEXIF GPS抽出
 * 4. 重複チェック or 手動登録へ誘導
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, X, Camera } from 'lucide-react';
import { extractGPSFromPhoto } from '../../utils/exifExtractor';

// 写真の分類タイプ
type PhotoType = 'plate' | 'full' | 'detail';

// 各写真の情報
interface Photo {
  file: File;
  dataUrl: string;
  type: PhotoType | null;
}

export default function RegisterFromPhotoPC() {
  const navigate = useNavigate();

  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // 写真選択（複数）
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const currentCount = photos.length;
    const available = 4 - currentCount;

    if (files.length > available) {
      alert(`最大4枚までです。${available}枚のみ追加します。`);
    }

    const filesToAdd = Array.from(files).slice(0, available);

    for (const file of filesToAdd) {
      const dataUrl = await fileToDataURL(file);
      setPhotos(prev => [...prev, { file, dataUrl, type: null }]);
    }
  };

  // Fileを Base64 DataURL に変換
  const fileToDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // 写真削除
  const handlePhotoDelete = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  // 写真の種類を変更
  const handleTypeChange = (index: number, type: PhotoType) => {
    // 番号札が既に選択されているかチェック
    if (type === 'plate') {
      const alreadyHasPlate = photos.some((p, i) => i !== index && p.type === 'plate');
      if (alreadyHasPlate) {
        alert('番号札は1枚のみ選択できます');
        return;
      }
    }

    setPhotos(prev => {
      const newPhotos = [...prev];
      newPhotos[index].type = type;
      return newPhotos;
    });
  };

  // 次へ（EXIF GPS抽出 → 重複チェック）
  const handleNext = async () => {
    // 番号札が選択されているかチェック
    const platePhoto = photos.find(p => p.type === 'plate');
    if (!platePhoto) {
      alert('番号札を1枚選択してください');
      return;
    }

    // 全ての写真が分類されているかチェック
    const hasUnclassified = photos.some(p => p.type === null);
    if (hasUnclassified) {
      alert('全ての写真の種類を選択してください');
      return;
    }

    setIsProcessing(true);

    try {
      // 番号札からGPS座標を抽出
      const gps = await extractGPSFromPhoto(platePhoto.file);

      if (!gps) {
        // GPS情報が無い場合
        setIsProcessing(false);
        const shouldManualRegister = window.confirm(
          'この写真には位置情報が含まれていません。\n\n手動で登録しますか？'
        );

        if (shouldManualRegister) {
          // 通常の登録フローへ遷移（位置選択から）
          navigate('/register/location');
        }
        return;
      }

      // GPS情報がある場合 → 重複チェック画面へ
      const photosByType = {
        plate: photos.find(p => p.type === 'plate')?.dataUrl || null,
        full: photos.filter(p => p.type === 'full').map(p => p.dataUrl),
        detail: photos.filter(p => p.type === 'detail').map(p => p.dataUrl),
      };

      navigate('/register/duplicate-check', {
        state: {
          gps,
          photos: photosByType,
          registrationMethod: 'photo-first',
        },
      });
    } catch (error) {
      console.error('Error processing photos:', error);
      alert('写真の処理中にエラーが発生しました');
      setIsProcessing(false);
    }
  };

  // 番号札が選択されているか
  const hasPlatePhoto = photos.some(p => p.type === 'plate');
  const plateCount = photos.filter(p => p.type === 'plate').length;
  const canProceed = hasPlatePhoto && photos.every(p => p.type !== null) && photos.length > 0;

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* ヘッダー */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Camera className="w-6 h-6" />
          写真から登録
        </h1>
        <p className="text-gray-600 mt-2">
          撮影済みの写真から位置情報を取得して電柱を登録できます（最大4枚）
        </p>
      </div>

      {/* 制約ルール */}
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded">
        <p className="font-bold text-yellow-800 mb-2">📋 選択ルール</p>
        <ul className="space-y-1 text-yellow-700">
          <li>• <strong>番号札:</strong> 必ず1枚（位置情報取得のため必須）</li>
          <li>• <strong>残り3枚:</strong> 全体・詳細は自由に組み合わせ可能</li>
          <li>• <strong>合計:</strong> 最大4枚まで選択できます</li>
        </ul>
      </div>

      {/* 写真選択ボタン */}
      {photos.length < 4 && (
        <label className="block mb-6">
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
          <div className="border-2 border-dashed border-blue-400 rounded-lg p-12 text-center cursor-pointer hover:bg-blue-50 transition-colors">
            <Upload className="w-16 h-16 mx-auto mb-4 text-blue-600" />
            <p className="text-blue-600 font-bold text-lg">写真を選択</p>
            <p className="text-gray-500 mt-2">
              残り {4 - photos.length} 枚選択できます
            </p>
          </div>
        </label>
      )}

      {/* 写真グリッド表示 */}
      {photos.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="font-bold text-gray-800 mb-4 text-lg">
            選択した写真 ({photos.length}/4)
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {photos.map((photo, index) => (
              <div key={index} className="border rounded-lg p-4 relative hover:shadow-lg transition-shadow">
                {/* 削除ボタン */}
                <button
                  onClick={() => handlePhotoDelete(index)}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 shadow-lg hover:bg-red-600 z-10"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* 写真プレビュー */}
                <div className="mb-4">
                  <img
                    src={photo.dataUrl}
                    alt={`写真 ${index + 1}`}
                    className="w-full h-48 object-cover rounded"
                  />
                </div>

                {/* 種類選択 */}
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    写真の種類を選択:
                  </p>
                  <div className="space-y-2">
                    <label className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded">
                      <input
                        type="radio"
                        name={`photo-type-${index}`}
                        checked={photo.type === 'plate'}
                        onChange={() => handleTypeChange(index, 'plate')}
                        className="mr-3"
                      />
                      <span className="font-medium">📋 番号札</span>
                      {photo.type === 'plate' && (
                        <span className="ml-auto text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                          GPS取得元
                        </span>
                      )}
                    </label>
                    <label className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded">
                      <input
                        type="radio"
                        name={`photo-type-${index}`}
                        checked={photo.type === 'full'}
                        onChange={() => handleTypeChange(index, 'full')}
                        className="mr-3"
                      />
                      <span className="font-medium">📷 全体</span>
                    </label>
                    <label className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded">
                      <input
                        type="radio"
                        name={`photo-type-${index}`}
                        checked={photo.type === 'detail'}
                        onChange={() => handleTypeChange(index, 'detail')}
                        className="mr-3"
                      />
                      <span className="font-medium">🔍 詳細</span>
                    </label>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 次へボタン */}
      {photos.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <button
            onClick={handleNext}
            disabled={!canProceed || isProcessing}
            className={`w-full py-4 rounded-lg font-bold text-lg transition-colors ${
              canProceed && !isProcessing
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isProcessing ? '処理中...' : '次へ（位置情報を取得）'}
          </button>

          {!hasPlatePhoto && photos.length > 0 && (
            <p className="text-red-500 text-sm mt-3 text-center">
              ⚠️ 番号札を1枚選択してください
            </p>
          )}
          {plateCount > 1 && (
            <p className="text-red-500 text-sm mt-3 text-center">
              ⚠️ 番号札は1枚のみ選択できます
            </p>
          )}
        </div>
      )}
    </div>
  );
}
