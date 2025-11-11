/**
 * 写真を圧縮してBase64データのサイズを削減
 * sessionStorageの制限（約5-10MB）を回避するため
 */

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.0 - 1.0
}

/**
 * Base64データURLを圧縮
 */
export async function compressImage(
  dataUrl: string,
  options: CompressionOptions = {}
): Promise<string> {
  const {
    maxWidth = 1920,
    maxHeight = 1920,
    quality = 0.8,
  } = options;

  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      try {
        // キャンバスを作成
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }

        // アスペクト比を保持してリサイズ
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = width * ratio;
          height = height * ratio;
        }

        canvas.width = width;
        canvas.height = height;

        // 画像を描画
        ctx.drawImage(img, 0, 0, width, height);

        // 圧縮されたBase64を取得
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);

        console.log(`📸 圧縮: ${(dataUrl.length / 1024).toFixed(1)}KB → ${(compressedDataUrl.length / 1024).toFixed(1)}KB`);

        resolve(compressedDataUrl);
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    img.src = dataUrl;
  });
}

/**
 * 複数の画像を一括圧縮
 */
export async function compressImages(
  dataUrls: string[],
  options: CompressionOptions = {}
): Promise<string[]> {
  return Promise.all(dataUrls.map(url => compressImage(url, options)));
}

/**
 * 写真オブジェクト全体を圧縮
 */
export async function compressPhotoObject(photos: {
  plate?: string;
  full?: string[];
  detail?: string[];
}): Promise<{
  plate?: string;
  full?: string[];
  detail?: string[];
}> {
  const compressed: any = {};

  if (photos.plate) {
    compressed.plate = await compressImage(photos.plate, {
      maxWidth: 1600,
      maxHeight: 1600,
      quality: 0.85,
    });
  }

  if (photos.full && photos.full.length > 0) {
    compressed.full = await compressImages(photos.full, {
      maxWidth: 1920,
      maxHeight: 1920,
      quality: 0.8,
    });
  }

  if (photos.detail && photos.detail.length > 0) {
    compressed.detail = await compressImages(photos.detail, {
      maxWidth: 1920,
      maxHeight: 1920,
      quality: 0.8,
    });
  }

  return compressed;
}
