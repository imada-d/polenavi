/**
 * EXIF データ抽出ユーティリティ
 * 写真からGPS座標やメタデータを取得する
 */

import exifr from 'exifr';

export interface GPSCoordinates {
  latitude: number;
  longitude: number;
}

export interface PhotoMetadata {
  gps: GPSCoordinates | null;
  timestamp: Date | null;
  cameraMake: string | null;
  cameraModel: string | null;
}

/**
 * 写真からGPS座標を抽出
 * @param photoDataUrl - Base64エンコードされた写真データURL または Blob
 * @returns GPS座標 (緯度・経度) または null
 */
export async function extractGPSFromPhoto(
  photoDataUrl: string | Blob
): Promise<GPSCoordinates | null> {
  try {
    console.log('📍 EXIF GPS抽出開始:', {
      type: typeof photoDataUrl,
      isBlob: photoDataUrl instanceof Blob,
      isFile: photoDataUrl instanceof File,
    });

    const exifData = await exifr.gps(photoDataUrl);

    console.log('📍 EXIF GPS結果:', exifData);

    if (!exifData || !exifData.latitude || !exifData.longitude) {
      console.log('GPS data not found in photo EXIF');
      return null;
    }

    return {
      latitude: exifData.latitude,
      longitude: exifData.longitude,
    };
  } catch (error) {
    console.error('❌ Error extracting GPS from photo:', error);
    throw new Error(`EXIF GPS抽出失敗: ${error instanceof Error ? error.message : '不明なエラー'}`);
  }
}

/**
 * 写真から全メタデータを抽出
 * @param photoDataUrl - Base64エンコードされた写真データURL または Blob
 * @returns 写真のメタデータ
 */
export async function extractPhotoMetadata(
  photoDataUrl: string | Blob
): Promise<PhotoMetadata> {
  const metadata: PhotoMetadata = {
    gps: null,
    timestamp: null,
    cameraMake: null,
    cameraModel: null,
  };

  try {
    // GPS情報を取得
    const gpsData = await exifr.gps(photoDataUrl);
    if (gpsData && gpsData.latitude && gpsData.longitude) {
      metadata.gps = {
        latitude: gpsData.latitude,
        longitude: gpsData.longitude,
      };
    }

    // その他のEXIF情報を取得
    const exifData = await exifr.parse(photoDataUrl, {
      pick: ['DateTimeOriginal', 'Make', 'Model'],
    });

    if (exifData) {
      metadata.timestamp = exifData.DateTimeOriginal || null;
      metadata.cameraMake = exifData.Make || null;
      metadata.cameraModel = exifData.Model || null;
    }
  } catch (error) {
    console.error('Error extracting photo metadata:', error);
  }

  return metadata;
}

/**
 * 複数の写真からGPS座標を抽出（最初に見つかったものを返す）
 * @param photos - 写真の配列 (Base64 または Blob)
 * @returns GPS座標 または null
 */
export async function extractGPSFromPhotos(
  photos: (string | Blob)[]
): Promise<GPSCoordinates | null> {
  for (const photo of photos) {
    const gps = await extractGPSFromPhoto(photo);
    if (gps) {
      return gps;
    }
  }
  return null;
}

/**
 * FileオブジェクトをBlobに変換（exifrが使用できる形式）
 * @param file - Fileオブジェクト
 * @returns Blob
 */
export function fileToBlob(file: File): Blob {
  return new Blob([file], { type: file.type });
}
