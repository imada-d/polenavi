// 何を: 写真関連のAPI呼び出し
// なぜ: 写真のアップロード、取得、削除機能を提供するため

import apiClient from './client';

/**
 * Base64画像をBlobに変換
 */
function base64ToBlob(base64: string): Blob {
  const parts = base64.split(';base64,');
  const contentType = parts[0].split(':')[1];
  const raw = window.atob(parts[1]);
  const rawLength = raw.length;
  const uInt8Array = new Uint8Array(rawLength);

  for (let i = 0; i < rawLength; ++i) {
    uInt8Array[i] = raw.charCodeAt(i);
  }

  return new Blob([uInt8Array], { type: contentType });
}

/**
 * 写真をアップロード
 * POST /api/poles/:poleId/photos
 */
export async function uploadPhoto(
  poleId: number,
  photoBase64: string,
  photoType: 'plate' | 'full' | 'detail'
): Promise<any> {
  try {
    console.log(`📸 写真アップロード開始: poleId=${poleId}, type=${photoType}`);

    // Base64をBlobに変換
    const blob = base64ToBlob(photoBase64);

    // FormDataを作成
    const formData = new FormData();
    formData.append('photo', blob, `${photoType}-${Date.now()}.jpg`);
    formData.append('photoType', photoType);

    const response = await apiClient.post(`/poles/${poleId}/photos`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    console.log(`✅ 写真アップロード成功:`, response.data);
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.error?.message || '写真のアップロードに失敗しました';
    console.error('❌ 写真アップロードエラー:', error);
    throw new Error(errorMessage);
  }
}

/**
 * 電柱の写真一覧を取得
 * GET /api/poles/:poleId/photos
 */
export async function getPhotosByPoleId(poleId: number): Promise<any> {
  try {
    const response = await apiClient.get(`/poles/${poleId}/photos`);
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.error?.message || '写真の取得に失敗しました';
    console.error('❌ 写真取得エラー:', error);
    throw new Error(errorMessage);
  }
}

/**
 * 写真を削除
 * DELETE /api/photos/:photoId
 */
export async function deletePhoto(photoId: number): Promise<any> {
  try {
    const response = await apiClient.delete(`/photos/${photoId}`);
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.error?.message || '写真の削除に失敗しました';
    console.error('❌ 写真削除エラー:', error);
    throw new Error(errorMessage);
  }
}
