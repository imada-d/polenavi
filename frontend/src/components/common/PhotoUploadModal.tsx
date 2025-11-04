// 何を: 写真アップロード用モーダル
// なぜ: 電柱詳細画面で写真を追加する際に、タイプ選択とプレビュー機能を提供するため

import { useState, useRef } from 'react';

interface PhotoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File, photoType: 'plate' | 'full' | 'detail') => Promise<void>;
  poleId: number;
}

export default function PhotoUploadModal({ isOpen, onClose, onUpload }: PhotoUploadModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [photoType, setPhotoType] = useState<'plate' | 'full' | 'detail'>('full');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // ファイル選択
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
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
    if (!selectedFile) return;

    setIsUploading(true);

    try {
      await onUpload(selectedFile, photoType);
      // 成功したらモーダルを閉じる
      handleClose();
    } catch (error: any) {
      console.error('写真アップロードエラー:', error);
      alert(`❌ ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  // モーダルを閉じる
  const handleClose = () => {
    setSelectedFile(null);
    setPreview(null);
    setPhotoType('full');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[2000] flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-bold">📸 写真を追加</h2>
          <button
            onClick={handleClose}
            disabled={isUploading}
            className="text-2xl text-gray-600 hover:text-gray-900"
          >
            ✕
          </button>
        </div>

        {/* コンテンツ */}
        <div className="p-4 space-y-4">
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
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-gray-50 transition-colors"
              >
                <div className="text-5xl mb-3">📸</div>
                <p className="text-gray-700 font-semibold mb-1">
                  クリックして写真を選択
                </p>
                <p className="text-gray-500 text-sm">
                  または画像ファイルをドラッグ&ドロップ
                </p>
                <p className="text-gray-400 text-xs mt-2">
                  最大10MB、JPEG/PNG/WebP対応
                </p>
              </div>
            </>
          ) : (
            /* プレビューとタイプ選択 */
            <>
              {/* プレビュー画像 */}
              <div className="space-y-2">
                <p className="text-sm font-semibold text-gray-700">プレビュー</p>
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
              <div className="space-y-2">
                <p className="text-sm font-semibold text-gray-700">写真の種類</p>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setPhotoType('plate')}
                    disabled={isUploading}
                    className={`py-3 rounded-lg font-semibold transition-colors ${
                      photoType === 'plate'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    📋 番号札
                  </button>
                  <button
                    onClick={() => setPhotoType('full')}
                    disabled={isUploading}
                    className={`py-3 rounded-lg font-semibold transition-colors ${
                      photoType === 'full'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    📷 全体
                  </button>
                  <button
                    onClick={() => setPhotoType('detail')}
                    disabled={isUploading}
                    className={`py-3 rounded-lg font-semibold transition-colors ${
                      photoType === 'detail'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    🔍 詳細
                  </button>
                </div>
              </div>

              {/* アクションボタン */}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setSelectedFile(null);
                    setPreview(null);
                  }}
                  disabled={isUploading}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 disabled:opacity-50"
                >
                  別の写真を選択
                </button>
                <button
                  onClick={handleUpload}
                  disabled={isUploading}
                  className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploading ? '📤 アップロード中...' : '✅ アップロード'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
