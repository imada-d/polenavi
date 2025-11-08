import { useState } from 'react';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import imageCompression from 'browser-image-compression';

interface PhotoCaptureProps {
  onPhotoCapture: (dataUrl: string) => void; // 1枚撮影時のコールバック
  onMultiplePhotoCapture?: (dataUrls: string[]) => void; // 複数選択時のコールバック
  buttonText?: string;
  allowGallery?: boolean;
  allowMultiple?: boolean; // 複数選択を許可するか
}

export default function PhotoCapture({ 
  onPhotoCapture, 
  onMultiplePhotoCapture,
  buttonText = '写真を撮影',
  allowGallery = true,
  allowMultiple = false
}: PhotoCaptureProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // カメラで撮影（1枚）
  const handleTakePhoto = async () => {
    try {
      setIsProcessing(true);
      
      const photo = await Camera.getPhoto({
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
        quality: 80,
      });

      if (photo.dataUrl) {
        setPreview(photo.dataUrl);
        onPhotoCapture(photo.dataUrl);
      }
    } catch (error) {
      console.error('カメラ撮影エラー:', error);
      alert('カメラの起動に失敗しました。');
    } finally {
      setIsProcessing(false);
    }
  };

  // ギャラリーから選択（1枚）
  const handleSelectFromGallery = async () => {
    try {
      setIsProcessing(true);
      
      const photo = await Camera.getPhoto({
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Photos,
        quality: 90,
      });

      if (photo.dataUrl) {
        const blob = await fetch(photo.dataUrl).then(r => r.blob());
        
        if (blob.size > 5 * 1024 * 1024) {
          const compressedBlob = await imageCompression(blob as File, {
            maxSizeMB: 5,
            maxWidthOrHeight: 1920,
            useWebWorker: true,
          });
          
          const reader = new FileReader();
          reader.onloadend = () => {
            const compressedDataUrl = reader.result as string;
            setPreview(compressedDataUrl);
            onPhotoCapture(compressedDataUrl);
          };
          reader.readAsDataURL(compressedBlob);
        } else {
          setPreview(photo.dataUrl);
          onPhotoCapture(photo.dataUrl);
        }
      }
    } catch (error) {
      console.error('ギャラリー選択エラー:', error);
      alert('ギャラリーからの選択に失敗しました。');
    } finally {
      setIsProcessing(false);
    }
  };

  // 複数選択（ネイティブ: pickImages / Web: input file）
  const handleSelectMultiple = async () => {
    try {
      setIsProcessing(true);
      
      if (Capacitor.isNativePlatform()) {
        // ネイティブアプリ → CapacitorのpickImages
        const photos = await Camera.pickImages({
          quality: 90,
        });

        if (photos.photos && photos.photos.length > 0) {
          // webPathをそのまま使用（既にdata URLまたはfile pathになっている）
          const dataUrls: string[] = [];

          for (const photo of photos.photos) {
            if (photo.webPath) {
              // webPathがdata URLでない場合はfetchして変換
              if (photo.webPath.startsWith('data:')) {
                dataUrls.push(photo.webPath);
              } else {
                // file pathの場合はfetchしてdata URLに変換
                const response = await fetch(photo.webPath);
                const blob = await response.blob();
                const dataUrl = await new Promise<string>((resolve) => {
                  const reader = new FileReader();
                  reader.onloadend = () => resolve(reader.result as string);
                  reader.readAsDataURL(blob);
                });
                dataUrls.push(dataUrl);
              }
            }
          }

          if (onMultiplePhotoCapture && dataUrls.length > 0) {
            onMultiplePhotoCapture(dataUrls);
          }
        }
      } else {
        // Webブラウザ → HTML input file
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.multiple = true;
        
        input.onchange = async (e) => {
          const files = (e.target as HTMLInputElement).files;
          if (!files || files.length === 0){
            setIsProcessing(false);
            return;
          }
          
          const dataUrls: string[] = [];
          
          for (let i = 0; i < files.length; i++) {
            const file = files[i];
            
            // 5MB超えは圧縮
            let processedFile = file;
            if (file.size > 5 * 1024 * 1024) {
              processedFile = await imageCompression(file, {
                maxSizeMB: 5,
                maxWidthOrHeight: 1920,
                useWebWorker: true,
              });
            }
            
            // Base64に変換
            const dataUrl = await new Promise<string>((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result as string);
              reader.readAsDataURL(processedFile);
            });
            
            dataUrls.push(dataUrl);
          }
          
          if (onMultiplePhotoCapture) {
            onMultiplePhotoCapture(dataUrls);
          }
          
          setIsProcessing(false);
        };
        input.oncancel = () => {
          setIsProcessing(false);
        };

        
        input.click();
      }
    } catch (error) {
      console.error('複数選択エラー:', error);
      alert(`写真の選択に失敗しました。\nエラー: ${error instanceof Error ? error.message : '不明なエラー'}`);
      setIsProcessing(false);
    } finally {
      if (!Capacitor.isNativePlatform()) {
        // Web版は上記のinput.oncancelやinput.onchangeでsetIsProcessing(false)するが
        // エラー時のため念のため
      }
    }
  };

  // 撮り直し
  const handleRetake = () => {
    setPreview(null);
  };

  return (
    <div className="space-y-4">
      {preview ? (
        <div className="space-y-3">
          <img 
            src={preview} 
            alt="プレビュー" 
            className="w-full rounded-lg border-2 border-gray-300"
          />
          <button
            onClick={handleRetake}
            className="w-full py-3 bg-white text-gray-700 border-2 border-gray-300 rounded-lg font-bold hover:border-gray-400"
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
            className={`w-full py-4 rounded-lg font-bold text-lg transition-all border-2 ${
              isProcessing
                ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
            }`}
          >
            {isProcessing ? '処理中...' : `📷 ${buttonText}`}
          </button>

          {/* ギャラリーから選択ボタン（1枚） */}
          {allowGallery && (
            <button
              onClick={handleSelectFromGallery}
              disabled={isProcessing}
              className={`w-full py-4 rounded-lg font-bold text-lg transition-all border-2 ${
                isProcessing
                  ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
              }`}
            >
              {isProcessing ? '処理中...' : '🖼️ ギャラリーから選択'}
            </button>
          )}

          {/* 複数選択ボタン */}
          {allowMultiple && onMultiplePhotoCapture && (
            <button
              onClick={handleSelectMultiple}
              disabled={isProcessing}
              className={`w-full py-4 rounded-lg font-bold text-lg transition-all border-2 ${
                isProcessing
                  ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
              }`}
            >
              {isProcessing ? '処理中...' : '📸 複数選択（まとめて）'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}