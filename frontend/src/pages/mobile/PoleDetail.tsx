// 何を: 電柱詳細ページ（モバイル版）
// なぜ: 電柱の詳細情報をフルスクリーンでアコーディオン形式で表示するため

import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import L from 'leaflet';
import Accordion from '../../components/common/Accordion';
import PhotoUploadModal from '../../components/common/PhotoUploadModal';
import { FEATURES } from '../../config/features';
import { getPoleById, uploadPolePhoto } from '../../api/poles';
import { calculateDistance } from '../../utils/distance';

export default function PoleDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  const [poleData, setPoleData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);

  // 何を: 検証ボタンのクリックハンドラー
  // なぜ: ユーザーが実際にその場所に行って検証できるようにするため
  const handleVerify = () => {
    if (!poleData) return;

    if (!('geolocation' in navigator)) {
      alert('お使いのブラウザは位置情報に対応していません。');
      return;
    }

    setIsVerifying(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        // 電柱との距離を計算
        const distance = calculateDistance(
          latitude,
          longitude,
          poleData.latitude,
          poleData.longitude
        );

        setIsVerifying(false);

        // 50m以内なら検証成功
        if (distance <= 50) {
          alert(`✅ 検証成功！\n電柱まで約${Math.round(distance)}mです。\n\n※ログイン機能実装後、検証記録が保存されます。`);
        } else {
          alert(`❌ 電柱に近づいてください\n現在地から約${Math.round(distance)}m離れています。\n検証には50m以内に近づく必要があります。`);
        }
      },
      (error) => {
        setIsVerifying(false);
        console.error('位置情報の取得に失敗しました:', error);
        alert('位置情報の取得に失敗しました。設定を確認してください。');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // 何を: 写真アップロードボタンのクリックハンドラー
  // なぜ: モーダルを開くため
  const handlePhotoClick = () => {
    setIsPhotoModalOpen(true);
  };

  // 何を: 写真アップロード処理
  // なぜ: 選択された写真をアップロードして、データを再取得するため
  const handlePhotoUpload = async (file: File, photoType: 'plate' | 'full' | 'detail') => {
    if (!poleData) return;

    await uploadPolePhoto(poleData.id, file, photoType);

    // データを再取得して表示を更新
    const updatedData = await getPoleById(poleData.id);
    setPoleData(updatedData);

    alert('✅ 写真をアップロードしました');
  };

  // 何を: 電柱データを取得
  // なぜ: 詳細情報を表示するため
  useEffect(() => {
    const fetchPoleData = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        const data = await getPoleById(parseInt(id, 10));
        setPoleData(data);
      } catch (err: any) {
        setError(err.message || '電柱の詳細情報を取得できませんでした');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPoleData();
  }, [id]);

  // 何を: 詳細ページ上部の地図を初期化
  // なぜ: 電柱の位置を視覚的に確認できるようにするため
  useEffect(() => {
    if (!mapRef.current || !poleData || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: [poleData.latitude, poleData.longitude],
      zoom: 16,
      zoomControl: false,
      dragging: true, // モバイルはドラッグ可能
      scrollWheelZoom: false,
      doubleClickZoom: true,
      touchZoom: true,
    });

    // OpenStreetMap タイル
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(map);

    // 電柱マーカーを追加
    L.marker([poleData.latitude, poleData.longitude], {
      icon: L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
      }),
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [poleData]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">読み込み中...</p>
      </div>
    );
  }

  if (error || !poleData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <p className="text-red-600 mb-4">{error || 'データが見つかりません'}</p>
        <button
          onClick={() => navigate('/')}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg"
        >
          ホームに戻る
        </button>
      </div>
    );
  }

  return (
    <>
      {/* 写真アップロードモーダル */}
      <PhotoUploadModal
        isOpen={isPhotoModalOpen}
        onClose={() => setIsPhotoModalOpen(false)}
        onUpload={handlePhotoUpload}
        poleId={poleData?.id || 0}
      />

      <div className="min-h-screen flex flex-col bg-gray-50">
        {/* ヘッダー */}
      <header className="bg-white border-b px-4 py-3 flex items-center gap-3 sticky top-0 z-50">
        <button
          onClick={() => navigate(-1)}
          className="text-2xl text-gray-600"
        >
          ←
        </button>
        <h1 className="text-lg font-bold">📍 電柱詳細</h1>
      </header>

      {/* 地図エリア */}
      <div ref={mapRef} className="w-full h-48 bg-gray-200"></div>

      {/* アコーディオンエリア */}
      <div className="flex-1 bg-white">
        {/* セクション1: 基本情報（デフォルト展開） */}
        <Accordion title="基本情報" icon="📋" defaultOpen={true}>
          <div className="space-y-3">
            {/* 電柱番号 */}
            <div>
              <p className="text-sm text-gray-600 mb-1">電柱番号</p>
              {poleData.poleNumbers && poleData.poleNumbers.length > 0 ? (
                <div className="space-y-1">
                  {poleData.poleNumbers.map((pn: any, index: number) => (
                    <p key={index} className="font-bold text-blue-600 text-lg">
                      {pn.poleNumber}
                    </p>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400">番号なし</p>
              )}
            </div>

            {/* 事業者名 */}
            <div>
              <p className="text-sm text-gray-600 mb-1">事業者</p>
              <p className="font-medium">{poleData.poleNumbers?.[0]?.operatorName || '不明'}</p>
            </div>

            {/* 電柱種類 */}
            <div>
              <p className="text-sm text-gray-600 mb-1">種類</p>
              <p className="font-medium">{poleData.poleTypeName || '電柱'}</p>
            </div>

            {/* 登録日時 */}
            <div>
              <p className="text-sm text-gray-600 mb-1">登録日時</p>
              <p className="text-sm">{poleData.createdAt ? new Date(poleData.createdAt).toLocaleString('ja-JP') : '-'}</p>
            </div>

            {/* 登録者名 */}
            <div>
              <p className="text-sm text-gray-600 mb-1">登録者</p>
              <p className="text-sm">{poleData.registeredByName || '匿名'}</p>
            </div>
          </div>
        </Accordion>

        {/* セクション2: 写真 */}
        <Accordion title="写真" icon="📸">
          <div className="space-y-3">
            {poleData.photos && poleData.photos.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {poleData.photos.map((photo: any, index: number) => (
                  <div key={index} className="relative aspect-square bg-gray-200 rounded-lg overflow-hidden">
                    <img
                      src={photo.photoUrl}
                      alt={`写真${index + 1}`}
                      className="w-full h-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                    />
                    {FEATURES.LIKES_ENABLED && (
                      <div className="absolute bottom-2 right-2 bg-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                        ❤️ {photo.likeCount || 0}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-4">写真はまだありません</p>
            )}

            {FEATURES.PHOTO_UPLOAD_ENABLED && (
              <button
                onClick={handlePhotoClick}
                className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-500 transition-colors"
              >
                + 写真を追加
              </button>
            )}
          </div>
        </Accordion>

        {/* セクション3: メモ・ハッシュタグ */}
        <Accordion title="メモ・ハッシュタグ" icon="📝">
          <div className="space-y-3">
            {/* メモ */}
            <div>
              <p className="text-sm text-gray-600 mb-1">メモ</p>
              {poleData.memo ? (
                <p className="whitespace-pre-wrap">{poleData.memo}</p>
              ) : (
                <p className="text-gray-400">メモなし</p>
              )}
            </div>

            {/* ハッシュタグ */}
            <div>
              <p className="text-sm text-gray-600 mb-1">ハッシュタグ</p>
              {poleData.hashtag ? (
                <div className="flex flex-wrap gap-2">
                  {poleData.hashtag.split(/\s+/).map((tag: string, index: number) => (
                    <span key={index} className="bg-blue-100 text-blue-600 px-2 py-1 rounded-full text-sm">
                      {tag}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400">ハッシュタグなし</p>
              )}
            </div>
          </div>
        </Accordion>

        {/* セクション4: 検証情報 */}
        {FEATURES.VERIFICATION_ENABLED && (
          <Accordion title="検証情報" icon="✅">
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600 mb-1">検証状態</p>
                <p className="font-medium">{poleData.verificationStatus || '未検証'}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1">検証回数</p>
                <p className="font-medium">{poleData.verificationCount || 0}人</p>
              </div>

              {poleData.lastVerifiedAt && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">最終検証日時</p>
                  <p className="text-sm">{new Date(poleData.lastVerifiedAt).toLocaleString('ja-JP')}</p>
                </div>
              )}

              <button
                onClick={handleVerify}
                disabled={isVerifying}
                className={`w-full py-3 rounded-lg transition-colors font-bold ${
                  isVerifying
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {isVerifying ? '📍 位置情報を取得中...' : '📍 この場所を検証する'}
              </button>
            </div>
          </Accordion>
        )}

        {/* セクション5: この電柱を編集 */}
        {FEATURES.EDIT_ENABLED && (
          <Accordion title="この電柱を編集" icon="✏️">
            <div className="space-y-2">
              <button
                onClick={handlePhotoClick}
                className="w-full py-3 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
              >
                📸 写真を追加
              </button>
              <button className="w-full py-3 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
                🔢 番号を追加
              </button>
              <button className="w-full py-3 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
                📍 位置を修正
              </button>
              {FEATURES.DELETE_REQUEST_ENABLED && (
                <button className="w-full py-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors">
                  🗑️ 削除要請
                </button>
              )}
            </div>
          </Accordion>
        )}
      </div>
    </div>
    </>
  );
}
