import { useState } from 'react';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import imageCompression from 'browser-image-compression';

interface PhotoCaptureProps {
  onPhotoCapture: (dataUrl: string) => void; // 撮影した写真のBase64データを親に渡す
  buttonText?: string; // ボタンのテキスト（デフォルト: "写真を撮影"）
  allowGallery?: boolean; // ギャラリー選択を許可するか（デフォルト: true）
}

export default function PhotoCapture({ 
  onPhotoCapture, 
  buttonText = '写真を撮影',
  allowGallery = true 
}: PhotoCaptureProps) {
  const [preview, setPreview] = useState<string | null>(null); // プレビュー画像
  const [isProcessing, setIsProcessing] = useState(false); // 処理中かどうか

  // カメラで撮影
  const handleTakePhoto = async () => {
    try {
      setIsProcessing(true);
      
      // Capacitorのカメラを起動
      const photo = await Camera.getPhoto({
        resultType: CameraResultType.DataUrl, // Base64形式で取得
        source: CameraSource.Camera, // カメラから撮影
        quality: 80, // 画質80%（サイズとのバランス）
      });

      if (photo.dataUrl) {
        // プレビュー表示
        setPreview(photo.dataUrl);
        // 親コンポーネントに通知
        onPhotoCapture(photo.dataUrl);
      }
    } catch (error) {
      console.error('カメラ撮影エラー:', error);
      alert('カメラの起動に失敗しました。設定を確認してください。');
    } finally {
      setIsProcessing(false);
    }
  };

  // ギャラリーから選択
  const handleSelectFromGallery = async () => {
    try {
      setIsProcessing(true);
      
      // Capacitorのカメラ（ギャラリーモード）を起動
      const photo = await Camera.getPhoto({
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Photos, // ギャラリーから選択
        quality: 90, // ギャラリーは高画質
      });

      if (photo.dataUrl) {
        // Base64をBlobに変換（圧縮のため）
        const blob = await fetch(photo.dataUrl).then(r => r.blob());
        
        // 5MB超えていたら圧縮
        if (blob.size > 5 * 1024 * 1024) {
          console.log('画像が5MBを超えているため圧縮します...');
          const compressedBlob = await imageCompression(blob as File, {
            maxSizeMB: 5, // 最大5MB
            maxWidthOrHeight: 1920, // 最大解像度
            useWebWorker: true, // Web Workerで高速化
          });
          
          // 圧縮後のBlobをBase64に変換
          const reader = new FileReader();
          reader.onloadend = () => {
            const compressedDataUrl = reader.result as string;
            setPreview(compressedDataUrl);
            onPhotoCapture(compressedDataUrl);
          };
          reader.readAsDataURL(compressedBlob);
        } else {
          // 5MB以下ならそのまま使用
          setPreview(photo.dataUrl);
          onPhotoCapture(photo.dataUrl);
        }
      }
    } catch (error) {
      console.error('ギャラリー選択エラー:', error);
      alert('ギャラリーから画像を選択できませんでした。');
    } finally {
      setIsProcessing(false);
    }
  };

  // 撮り直し
  const handleRetake = () => {
    setPreview(null);
  };

  return (
    <div className="space-y-4">
      {/* プレビュー表示 */}
      {preview ? (
        <div className="space-y-3">
          <img 
            src={preview} 
            alt="プレビュー" 
            className="w-full rounded-lg border-2 border-gray-300"
          />
          <button
            onClick={handleRetake}
            className="w-full py-3 bg-gray-500 text-white rounded-lg font-bold hover:bg-gray-600"
          >
            📸 撮り直す
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {/* カメラで撮影ボタン */}
          <button
            onClick={handleTakePhoto}
            disabled={isProcessing}
            className={`w-full py-4 rounded-lg font-bold text-lg transition-all ${
              isProcessing
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isProcessing ? '処理中...' : `📷 ${buttonText}`}
          </button>

          {/* ギャラリーから選択ボタン（allowGalleryがtrueの場合のみ） */}
          {allowGallery && (
            <button
              onClick={handleSelectFromGallery}
              disabled={isProcessing}
              className={`w-full py-4 rounded-lg font-bold text-lg transition-all ${
                isProcessing
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-blue-400'
              }`}
            >
              {isProcessing ? '処理中...' : '🖼️ ギャラリーから選択'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}