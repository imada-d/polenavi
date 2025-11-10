// 何を: 登録確認画面（モバイル版）
// なぜ: 登録前に内容を確認して、間違いを防ぐため

import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { usePoleRegistration } from '../../hooks/usePoleRegistration';
import { uploadPhoto } from '../../api/photos';

export default function RegisterConfirm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { register, loading } = usePoleRegistration();
  const [uploadProgress, setUploadProgress] = useState<string>('');

  // 前の画面から受け取ったデータ
  const state = location.state || {};
  const {
    location: pinLocation,
    poleType,
    poleSubType,
    plateCount,
    numbers,
    photos,
    hashtags,
    memoText,
    registrationMethod,
  } = state;

  // 柱の種類名を取得
  const getPoleTypeName = () => {
    if (poleType === 'electric') return '電柱';
    if (poleSubType === 'light') return '照明柱';
    if (poleSubType === 'sign') return '標識柱';
    if (poleSubType === 'traffic') return '信号柱';
    return 'その他';
  };

  // 登録実行
  const handleRegister = async () => {
    try {
      setUploadProgress('電柱情報を登録中...');

      // 1. 電柱を登録
      const result = await register({
        location: pinLocation,
        poleType,
        poleSubType,
        plateCount,
        numbers: numbers || [],
        memo: memoText,
        hashtag: hashtags,
      });

      const poleId = result.poleId;
      console.log('✅ 電柱登録完了:', poleId);

      // 2. 写真をアップロード（もしあれば）
      if (photos && Object.keys(photos).length > 0) {
        const photoUploads = [];

        // プレート写真
        if (photos.plate) {
          setUploadProgress('番号札写真をアップロード中...');
          photoUploads.push(
            uploadPhoto(poleId, photos.plate, 'plate', registrationMethod)
          );
        }

        // 全体写真
        if (photos.full && photos.full.length > 0) {
          setUploadProgress(`全体写真をアップロード中... (${photos.full.length}枚)`);
          for (const fullPhoto of photos.full) {
            photoUploads.push(
              uploadPhoto(poleId, fullPhoto, 'full', registrationMethod)
            );
          }
        }

        // 詳細写真
        if (photos.detail && photos.detail.length > 0) {
          setUploadProgress(`詳細写真をアップロード中... (${photos.detail.length}枚)`);
          for (const detailPhoto of photos.detail) {
            photoUploads.push(
              uploadPhoto(poleId, detailPhoto, 'detail', registrationMethod)
            );
          }
        }

        // 全ての写真を並列アップロード
        if (photoUploads.length > 0) {
          await Promise.all(photoUploads);
          console.log(`✅ 写真アップロード完了: ${photoUploads.length}枚`);
        }
      }

      setUploadProgress('完了！');

      // 3. 登録完了画面へ
      navigate('/register/complete', {
        state: {
          poleId: poleId,
          photoCount: photos ? (
            (photos.plate ? 1 : 0) +
            (photos.full?.length || 0) +
            (photos.detail?.length || 0)
          ) : 0,
        },
      });
    } catch (error) {
      console.error('登録エラー:', error);
      setUploadProgress('');
      alert('登録に失敗しました。もう一度お試しください。');
    }
  };

  return (
    <div className="h-screen w-full flex flex-col bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white border-b px-4 py-3 flex items-center">
        <button onClick={() => navigate(-1)} className="text-2xl mr-3">
          ←
        </button>
        <h1 className="text-xl font-bold">登録内容を確認</h1>
      </header>

      {/* メインコンテンツ */}
      <main className="flex-1 overflow-y-auto p-4">
        {/* 位置情報 */}
        <div className="bg-white rounded-lg p-4 mb-4 shadow">
          <h2 className="text-lg font-bold mb-2">📍 位置情報</h2>
          <p className="text-gray-700">
            緯度: {pinLocation?.[0]?.toFixed(6)}
            <br />
            経度: {pinLocation?.[1]?.toFixed(6)}
          </p>
        </div>

        {/* 柱の種類 */}
        <div className="bg-white rounded-lg p-4 mb-4 shadow">
          <h2 className="text-lg font-bold mb-2">🏷️ 柱の種類</h2>
          <p className="text-gray-700">{getPoleTypeName()}</p>
        </div>

        {/* 番号札枚数 */}
        <div className="bg-white rounded-lg p-4 mb-4 shadow">
          <h2 className="text-lg font-bold mb-2">❓ 番号札の枚数</h2>
          <p className="text-gray-700">{plateCount}枚</p>
        </div>

        {/* 番号 */}
        {numbers && numbers.length > 0 && (
          <div className="bg-white rounded-lg p-4 mb-4 shadow">
            <h2 className="text-lg font-bold mb-2">🔢 登録する番号</h2>
            {numbers.map((number: string, index: number) => (
              <p key={index} className="text-gray-700">
                {index + 1}. {number}
              </p>
            ))}
          </div>
        )}

        {/* 写真 */}
        {photos && photos.length > 0 && (
          <div className="bg-white rounded-lg p-4 mb-4 shadow">
            <h2 className="text-lg font-bold mb-2">📸 写真</h2>
            <p className="text-gray-700">{photos.length}枚</p>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {photos.map((photo: any, index: number) => (
                <img
                  key={index}
                  src={photo.dataUrl}
                  alt={`写真${index + 1}`}
                  className="w-full h-24 object-cover rounded"
                />
              ))}
            </div>
          </div>
        )}

        {/* ハッシュタグ */}
        {hashtags && hashtags.length > 0 && (
          <div className="bg-white rounded-lg p-4 mb-4 shadow">
            <h2 className="text-lg font-bold mb-2">🏷️ ハッシュタグ</h2>
            <div className="flex flex-wrap gap-2">
              {hashtags.map((tag: string, index: number) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* メモ */}
        {memoText && memoText.length > 0 && (
          <div className="bg-white rounded-lg p-4 mb-4 shadow">
            <h2 className="text-lg font-bold mb-2">📝 メモ</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{memoText}</p>
          </div>
        )}
      </main>

      {/* ボタンエリア */}
      <div className="p-4 pb-20 bg-white border-t space-y-3">
        {uploadProgress && (
          <div className="text-center text-sm text-blue-600 font-medium">
            {uploadProgress}
          </div>
        )}
        <button
          onClick={handleRegister}
          disabled={loading}
          className="w-full py-3 rounded-lg font-bold text-lg bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? uploadProgress || '登録中...' : '登録する'}
        </button>
        <button
          onClick={() => navigate(-1)}
          disabled={loading}
          className="w-full py-3 rounded-lg font-bold text-lg bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:bg-gray-400"
        >
          修正する
        </button>
      </div>
    </div>
  );
}
