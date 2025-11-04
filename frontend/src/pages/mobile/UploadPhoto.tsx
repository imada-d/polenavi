// 何を: 電柱写真アップロードページ（モバイル専用）
// なぜ: モバイルではモーダルよりページ遷移の方がスクロールしやすいため

import { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { uploadPolePhoto } from '../../api/poles';

export default function UploadPhoto() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [photoType, setPhotoType] = useState<'plate' | 'full' | 'detail'>('full');
  const [isUploading, setIsUploading] = useState(false);

  // ファイル選択
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 画像ファイルかチェック
    if (!file.type.startsWith('image/')) {
      alert('画像ファイルを選択してください');
      return;
    }

    // ファイルサイズチェック（10MB以下）
    if (file.size > 10 * 1024 * 1024) {
      alert('ファイルサイズは10MB以下にしてください');
      return;
    }

    setSelectedFile(file);

    // プレビュー生成
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // アップロード実行
  const handleUpload = async () => {
    if (!selectedFile || !id) return;

    setIsUploading(true);

    try {
      await uploadPolePhoto(parseInt(id, 10), selectedFile, photoType);
      alert('✅ 写真をアップロードしました');
      // 詳細ページに戻る
      navigate(`/pole/${id}`);
    } catch (error: any) {
      console.error('写真アップロードエラー:', error);
      alert(`❌ ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white border-b px-4 py-3 flex items-center gap-3 sticky top-0 z-50">
        <button
          onClick={() => navigate(-1)}
          disabled={isUploading}
          className="text-2xl text-gray-600"
        >
          ←
        </button>
        <h1 className="text-lg font-bold">📸 写真を追加</h1>
      </header>

      {/* コンテンツ */}
      <div className="flex-1 p-4 space-y-4">
        {!preview ? (
          /* ファイル選択エリア */
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer hover:border-blue-400 hover:bg-gray-50 transition-colors"
            >
              <div className="text-6xl mb-4">📸</div>
              <p className="text-gray-700 font-bold text-lg mb-2">
                タップして写真を選択
              </p>
              <p className="text-gray-500 text-sm">
                カメラまたはギャラリーから選択
              </p>
              <p className="text-gray-400 text-xs mt-3">
                最大10MB、JPEG/PNG/WebP対応
              </p>
            </div>
          </>
        ) : (
          /* プレビューとタイプ選択 */
          <>
            {/* プレビュー画像 */}
            <div className="space-y-2">
              <p className="text-sm font-bold text-gray-700">プレビュー</p>
              <img
                src={preview}
                alt="プレビュー"
                className="w-full rounded-lg border-2 border-gray-300"
              />
              <p className="text-xs text-gray-500">
                {selectedFile?.name} ({(selectedFile!.size / 1024).toFixed(0)}KB)
              </p>
            </div>

            {/* 写真タイプ選択 */}
            <div className="space-y-3">
              <p className="text-sm font-bold text-gray-700">写真の種類</p>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => setPhotoType('plate')}
                  disabled={isUploading}
                  className={`py-4 rounded-lg font-bold transition-colors ${
                    photoType === 'plate'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  📋 番号札
                </button>
                <button
                  onClick={() => setPhotoType('full')}
                  disabled={isUploading}
                  className={`py-4 rounded-lg font-bold transition-colors ${
                    photoType === 'full'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  📷 全体
                </button>
                <button
                  onClick={() => setPhotoType('detail')}
                  disabled={isUploading}
                  className={`py-4 rounded-lg font-bold transition-colors ${
                    photoType === 'detail'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  🔍 詳細
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* フッターボタン */}
      {preview && (
        <div className="bg-white border-t p-4 space-y-2">
          <button
            onClick={() => {
              setSelectedFile(null);
              setPreview(null);
            }}
            disabled={isUploading}
            className="w-full py-4 bg-gray-100 text-gray-700 rounded-lg font-bold text-lg disabled:opacity-50"
          >
            別の写真を選択
          </button>
          <button
            onClick={handleUpload}
            disabled={isUploading}
            className="w-full py-4 bg-blue-600 text-white rounded-lg font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? '📤 アップロード中...' : '✅ アップロード'}
          </button>
        </div>
      )}
    </div>
  );
}
