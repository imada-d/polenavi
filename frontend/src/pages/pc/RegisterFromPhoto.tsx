/**
 * 写真から電柱登録 - 写真選択・分類画面（PC版）
 * 左側: 写真取り込み + 分類選択
 * 右側: 電柱種類選択 + 番号札枚数選択 + 番号入力
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, X, Camera, ArrowLeft, AlertTriangle } from 'lucide-react';
import { extractGPSFromPhoto } from '../../utils/exifExtractor';
import PoleTypeSelector from '../../components/register/PoleTypeSelector';
import PlateCountSelector from '../../components/register/PlateCountSelector';

// 写真の分類タイプ
type PhotoType = 'plate' | 'full' | 'detail';

// 各写真の情報
interface Photo {
  file: File;
  dataUrl: string;
  type: PhotoType | null;
}

// LocalStorageのキー
const LAST_REG_KEY = 'lastRegistration';

// 前回の登録情報の型
interface LastRegistration {
  numbers: string[];
  poleType: 'electric' | 'other';
  timestamp: number;
}

export default function RegisterFromPhotoPC() {
  const navigate = useNavigate();

  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // 電柱情報入力
  const [poleType, setPoleType] = useState<'electric' | 'other' | null>(null);
  const [poleSubType, setPoleSubType] = useState<'light' | 'sign' | 'traffic' | 'other' | null>(null);
  const [plateCount, setPlateCount] = useState<number | null>(null);

  // 番号入力
  const [numbers, setNumbers] = useState<string[]>([]);
  const [isContinuousMode, setIsContinuousMode] = useState(false);
  const [lastReg, setLastReg] = useState<LastRegistration | null>(null);

  // 写真拡大表示用
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // 番号札として分類された写真
  const platePhotos = photos.filter(p => p.type === 'plate');

  // 初回読み込み時に前回値を取得
  useEffect(() => {
    const saved = localStorage.getItem(LAST_REG_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setLastReg(data);
      } catch (e) {
        console.error('前回値の読み込みエラー:', e);
      }
    }
  }, []);

  // 番号札枚数が変更されたら入力欄を初期化
  useEffect(() => {
    if (plateCount !== null && plateCount > 0) {
      setNumbers(new Array(plateCount).fill(''));
    } else {
      setNumbers([]);
    }
  }, [plateCount]);

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

  // 番号入力関連の関数
  const incrementNumber = (baseNumber: string, delta: number): string => {
    const match = baseNumber.match(/^(.*?)(\d+)$/);
    if (!match) return baseNumber;

    const prefix = match[1];
    const numStr = match[2];
    const num = parseInt(numStr, 10);
    const newNum = num + delta;

    if (newNum < 0) return baseNumber;

    const newNumStr = String(newNum).padStart(numStr.length, '0');
    return prefix + newNumStr;
  };

  const handleContinuousMode = () => {
    if (!lastReg) {
      alert('前回の登録がありません');
      return;
    }

    if (lastReg.poleType !== poleType) {
      const lastTypeDisplay = lastReg.poleType === 'electric' ? '電柱' : 'その他';
      alert(`前回は「${lastTypeDisplay}」を登録しました。\n連続入力は同じ種類のみ可能です。`);
      return;
    }

    setIsContinuousMode(true);

    if (plateCount && plateCount > 0 && lastReg.numbers.length > 0) {
      const nextNumber = incrementNumber(lastReg.numbers[0], 1);
      const newNumbers = new Array(plateCount).fill('');
      newNumbers[0] = nextNumber;
      setNumbers(newNumbers);
    }
  };

  const handleNormalMode = () => {
    setIsContinuousMode(false);
    if (plateCount) {
      setNumbers(new Array(plateCount).fill(''));
    }
  };

  const handleSuggestion = (delta: number) => {
    if (!lastReg || lastReg.numbers.length === 0) return;
    const suggested = incrementNumber(lastReg.numbers[0], delta);
    const newNumbers = [...numbers];
    newNumbers[0] = suggested;
    setNumbers(newNumbers);
  };

  const handleNumberChange = (index: number, value: string) => {
    const newNumbers = [...numbers];
    newNumbers[index] = value;
    setNumbers(newNumbers);
  };

  const generateAutoNumber = (): string => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let randomStr = '';
    for (let i = 0; i < 8; i++) {
      const randomIndex = Math.floor(Math.random() * chars.length);
      randomStr += chars[randomIndex];
    }
    return `#NoID-${randomStr}`;
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

    // 電柱種類が選択されているかチェック
    if (!poleType) {
      alert('柱の種類を選択してください');
      return;
    }

    // その他の場合はサブタイプもチェック
    if (poleType === 'other' && !poleSubType) {
      alert('詳細な種類を選択してください');
      return;
    }

    // 番号札枚数が選択されているかチェック
    if (plateCount === null) {
      alert('番号札の枚数を選択してください');
      return;
    }

    // 番号のバリデーション
    let finalNumbers: string[];
    if (plateCount === 0) {
      finalNumbers = [generateAutoNumber()];
    } else {
      const trimmedNumbers = numbers.map(n => n.trim()).filter(n => n !== '');
      if (trimmedNumbers.length === 0 || !trimmedNumbers[0]) {
        alert('1番目の番号を入力してください');
        return;
      }

      // 重複チェック
      const nonEmptyNumbers = trimmedNumbers.filter(n => n !== '');
      const uniqueNumbers = new Set(nonEmptyNumbers);
      if (nonEmptyNumbers.length !== uniqueNumbers.size) {
        const duplicates = nonEmptyNumbers.filter((num, index) =>
          nonEmptyNumbers.indexOf(num) !== index
        );
        alert(`⚠️ 同じ番号が複数入力されています\n\n重複: ${duplicates[0]}\n\n異なる番号を入力してください`);
        return;
      }

      finalNumbers = trimmedNumbers;
    }

    // 前回値として保存
    if (poleType) {
      const regData: LastRegistration = {
        numbers: finalNumbers,
        poleType,
        timestamp: Date.now(),
      };
      localStorage.setItem(LAST_REG_KEY, JSON.stringify(regData));
    }

    setIsProcessing(true);

    try {
      // 番号札からGPS座標を抽出
      const gps = await extractGPSFromPhoto(platePhoto.file);

      if (!gps) {
        // GPS情報が無い場合
        setIsProcessing(false);
        const shouldManualRegister = window.confirm(
          'この写真には位置情報が含まれていません。\n\n手動で位置を選択しますか？'
        );

        if (shouldManualRegister) {
          // 写真データを保持したまま、手動で位置を選択する画面へ
          const photosByType = {
            plate: photos.find(p => p.type === 'plate')?.dataUrl || null,
            full: photos.filter(p => p.type === 'full').map(p => p.dataUrl),
            detail: photos.filter(p => p.type === 'detail').map(p => p.dataUrl),
          };

          // 現在地を取得してから遷移
          if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
              (position) => {
                const { latitude, longitude } = position.coords;
                sessionStorage.setItem('registrationMethod', 'photo-first');
                navigate('/register/photo/location', {
                  state: {
                    gpsLocation: [latitude, longitude],
                    photos: photosByType,
                    poleType,
                    poleSubType,
                    plateCount,
                    numbers: finalNumbers,
                    registrationMethod: 'photo-first',
                    manualLocation: true,
                  },
                });
              },
              (error) => {
                console.error('位置情報の取得に失敗:', error);
                sessionStorage.setItem('registrationMethod', 'photo-first');
                navigate('/register/photo/location', {
                  state: {
                    gpsLocation: [36.5, 138.0],
                    photos: photosByType,
                    poleType,
                    poleSubType,
                    plateCount,
                    numbers: finalNumbers,
                    registrationMethod: 'photo-first',
                    manualLocation: true,
                  },
                });
              }
            );
          } else {
            sessionStorage.setItem('registrationMethod', 'photo-first');
            navigate('/register/photo/location', {
              state: {
                gpsLocation: [36.5, 138.0],
                photos: photosByType,
                poleType,
                poleSubType,
                plateCount,
                numbers: finalNumbers,
                registrationMethod: 'photo-first',
                manualLocation: true,
              },
            });
          }
        }
        return;
      }

      // GPS情報がある場合 → 重複チェック画面へ
      const photosByType = {
        plate: photos.find(p => p.type === 'plate')?.dataUrl || null,
        full: photos.filter(p => p.type === 'full').map(p => p.dataUrl),
        detail: photos.filter(p => p.type === 'detail').map(p => p.dataUrl),
      };

      sessionStorage.setItem('registrationMethod', 'photo-first');

      navigate('/register/duplicate-check', {
        state: {
          gps,
          photos: photosByType,
          poleType,
          poleSubType,
          plateCount,
          numbers: finalNumbers,
          registrationMethod: 'photo-first',
        },
      });
    } catch (error) {
      console.error('Error processing photos:', error);
      const errorMessage = error instanceof Error ? error.message : '不明なエラー';
      alert(`写真の処理中にエラーが発生しました\n\n詳細: ${errorMessage}`);
      setIsProcessing(false);
    }
  };

  // 番号札が選択されているか
  const hasPlatePhoto = photos.some(p => p.type === 'plate');
  const canProceed = hasPlatePhoto && photos.every(p => p.type !== null) && photos.length > 0 && poleType !== null && (poleType === 'electric' || poleSubType !== null) && plateCount !== null;

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* 写真拡大モーダル */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-full max-h-full">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 bg-white text-black rounded-full p-2 shadow-lg hover:bg-gray-200 z-10"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={selectedImage}
              alt="拡大表示"
              className="max-w-[90vw] max-h-[90vh] object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      {/* ヘッダー */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>戻る</span>
          </button>
        </div>
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Camera className="w-6 h-6" />
          写真から登録
        </h1>
        <p className="text-gray-600 mt-2">
          撮影済みの写真から位置情報を取得して電柱を登録できます（最大4枚）
        </p>
      </div>

      {/* 左右分割レイアウト */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 左側: 写真取り込み + 分類選択 */}
        <div className="space-y-6 h-[calc(100vh-400px)] overflow-y-auto pr-2">
          {/* 写真選択ボタン */}
          {photos.length < 4 && (
            <label className="block">
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
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="font-bold text-gray-800 mb-4 text-lg">
                選択した写真 ({photos.length}/4)
              </h2>

              <div className="space-y-4">
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
        </div>

        {/* 右側: 電柱種類選択 + 番号札枚数選択 + 番号入力 */}
        <div className="space-y-6 h-[calc(100vh-400px)] overflow-y-auto pr-2">
          {photos.length > 0 && hasPlatePhoto && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <PoleTypeSelector
                poleType={poleType}
                poleSubType={poleSubType}
                onPoleTypeChange={setPoleType}
                onPoleSubTypeChange={setPoleSubType}
              />
            </div>
          )}

          {photos.length > 0 && hasPlatePhoto && poleType && (poleType === 'electric' || poleSubType) && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <PlateCountSelector
                plateCount={plateCount}
                onPlateCountChange={setPlateCount}
              />
            </div>
          )}

          {plateCount !== null && plateCount > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
              <h2 className="font-bold text-gray-800 text-lg">番号を入力</h2>

              {/* 連続入力モード表示 */}
              {isContinuousMode && lastReg && lastReg.numbers.length > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-sm text-gray-700">
                    🔄 <strong>連続入力モード</strong><br />
                    前回: {lastReg.numbers[0]}
                  </p>
                </div>
              )}

              {/* 番号札写真と入力欄 */}
              {numbers.map((number, index) => (
                <div key={index} className="space-y-2">
                  {/* 番号札写真のサムネイル */}
                  {platePhotos[index] && (
                    <div className="bg-gray-100 rounded-lg p-2">
                      <p className="text-xs text-gray-600 mb-1">番号札 {index + 1} 📷 クリックで拡大</p>
                      <img
                        src={platePhotos[index].dataUrl}
                        alt={`番号札 ${index + 1}`}
                        className="w-full h-40 object-contain rounded cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => setSelectedImage(platePhotos[index].dataUrl)}
                      />
                    </div>
                  )}

                  {/* 番号入力欄 */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">
                      {index === 0 ? '1番目（一番上）*' : `${index + 1}番目`}
                    </label>
                    <input
                      type="text"
                      value={number}
                      onChange={(e) => handleNumberChange(index, e.target.value)}
                      placeholder={
                        index === 0
                          ? poleType === 'electric'
                            ? '例: 247エ714'
                            : '例: BL2025-001'
                          : '任意'
                      }
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-lg focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              ))}

              {/* 連続入力モード：候補ボタン */}
              {isContinuousMode && lastReg && lastReg.numbers.length > 0 && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">1番目の候補を選択：</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSuggestion(2)}
                      className="flex-1 py-2 bg-white text-gray-700 border-2 border-gray-300 rounded font-bold hover:border-gray-400"
                    >
                      {incrementNumber(lastReg.numbers[0], 2)}
                      <br />
                      <span className="text-xs">(+2)</span>
                    </button>
                    <button
                      onClick={() => handleSuggestion(3)}
                      className="flex-1 py-2 bg-white text-gray-700 border-2 border-gray-300 rounded font-bold hover:border-gray-400"
                    >
                      {incrementNumber(lastReg.numbers[0], 3)}
                      <br />
                      <span className="text-xs">(+3)</span>
                    </button>
                    <button
                      onClick={() => handleSuggestion(-1)}
                      className="flex-1 py-2 bg-white text-gray-700 border-2 border-gray-300 rounded font-bold hover:border-gray-400"
                    >
                      {incrementNumber(lastReg.numbers[0], -1)}
                      <br />
                      <span className="text-xs">(-1)</span>
                    </button>
                  </div>
                </div>
              )}

              {/* モード切り替えボタン */}
              <div className="space-y-2">
                {!isContinuousMode ? (
                  <button
                    onClick={handleContinuousMode}
                    className="w-full py-3 bg-white text-gray-700 border-2 border-gray-300 rounded-lg font-bold hover:border-gray-400"
                  >
                    🔄 連続入力モード
                  </button>
                ) : (
                  <button
                    onClick={handleNormalMode}
                    className="w-full py-3 bg-white text-gray-700 border-2 border-gray-300 rounded-lg font-bold hover:border-gray-400"
                  >
                    ❌ 通常入力に戻る
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 次へボタン */}
      {photos.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 mt-6">
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
        </div>
      )}

      {/* 注意事項（一番下に表示） */}
      {photos.length === 0 && (
        <>
          {/* 制約ルール */}
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded mt-6">
            <p className="font-bold text-yellow-800 mb-2">📋 選択ルール</p>
            <ul className="space-y-1 text-yellow-700">
              <li>• <strong>番号札:</strong> 必ず1枚（位置情報取得のため必須）</li>
              <li>• <strong>残り3枚:</strong> 全体・詳細は自由に組み合わせ可能</li>
              <li>• <strong>合計:</strong> 最大4枚まで選択できます</li>
            </ul>
          </div>

          {/* EXIF情報についての重要な注意 */}
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 rounded">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-bold text-red-800 mb-2">⚠️ 重要：位置情報について</p>
                <ul className="space-y-1 text-red-700 text-sm">
                  <li>• <strong>EXIF データ</strong>から位置情報を取得します</li>
                  <li>• <strong>生写真（カメラで撮影したオリジナル）</strong>でないと位置情報が取れません</li>
                  <li>• スクリーンショット、編集済み、SNSからダウンロードした写真は位置情報が削除されています</li>
                  <li>• 位置情報が無い場合は、手動で位置を指定する必要があります</li>
                </ul>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
