/**
 * 写真から登録 - 位置確認画面（モバイル版）
 * 写真から抽出したGPS座標を表示して、ユーザーが微調整できる
 */

import { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Map from '../../components/common/Map';
import L from 'leaflet';

export default function PhotoRegisterLocation() {
  const navigate = useNavigate();
  const location = useLocation();
  const mapInstanceRef = useRef<L.Map | null>(null);
  const draggablePinRef = useRef<L.Marker | null>(null);
  const photoLocationMarkerRef = useRef<L.Marker | null>(null);

  // 前の画面から受け取ったデータ
  const { gpsLocation, photos } = location.state || {};

  // デバッグ用
  console.log('📍 PhotoRegisterLocation - 受け取ったデータ:', {
    gpsLocation,
    photos: photos ? `✅あり (${Array.isArray(photos) ? photos.length : 'object'})` : '❌なし'
  });

  const [photoLocation] = useState<[number, number]>(gpsLocation); // 写真のGPS（固定）
  const [pinLocation, setPinLocation] = useState<[number, number]>(gpsLocation); // 調整可能なピン位置
  const [mapType, setMapType] = useState<'street' | 'hybrid'>('street');

  const handleMapReady = (map: L.Map) => {
    mapInstanceRef.current = map;

    if (photoLocation && pinLocation) {
      // 写真から取得した位置マーカー（緑色、固定）
      const photoLocationIcon = L.divIcon({
        html: '<div style="background-color: #10b981; color: white; padding: 4px 8px; border-radius: 12px; font-size: 12px; font-weight: bold; white-space: nowrap; box-shadow: 0 2px 4px rgba(0,0,0,0.3);" translate="no">📸 写真の位置</div>',
        className: 'photo-location-label',
        iconSize: [100, 24],
        iconAnchor: [50, 12],
      });

      photoLocationMarkerRef.current = L.marker(photoLocation, {
        icon: photoLocationIcon,
      }).addTo(map) as any;

      // 赤いピン（ドラッグ可能）
      const redIcon = L.divIcon({
        html: '<div style="background-color: #ef4444; width: 30px; height: 30px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>',
        className: 'custom-pin-icon',
        iconSize: [30, 30],
        iconAnchor: [15, 30],
      });

      draggablePinRef.current = L.marker(pinLocation, {
        icon: redIcon,
        draggable: true,
      }).addTo(map);

      // ドラッグ時にピンの位置を更新
      draggablePinRef.current.on('dragend', (event) => {
        const marker = event.target;
        const position = marker.getLatLng();
        setPinLocation([position.lat, position.lng]);

        if (mapInstanceRef.current) {
          mapInstanceRef.current.panTo(position, {
            animate: true,
            duration: 0.3,
          });
        }
      });
    }
  };

  // 写真の位置に戻すボタン
  const handleResetToPhotoLocation = () => {
    if (photoLocation && mapInstanceRef.current && draggablePinRef.current) {
      mapInstanceRef.current.setView(photoLocation, 18, {
        animate: true,
        duration: 0.5,
      });

      draggablePinRef.current.setLatLng(photoLocation);
      setPinLocation(photoLocation);
    }
  };

  // 次へ進むボタン
  const handleNext = () => {
    if (pinLocation) {
      navigate('/register/photo/pole-info', {
        state: {
          location: pinLocation,
          photos,
        },
      });
    }
  };

  return (
    <div className="h-screen w-full flex flex-col">
      {/* ヘッダー */}
      <header className="bg-white border-b px-4 py-3 flex items-center justify-between z-10">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded"
        >
          ← 戻る
        </button>
        <div className="text-center">
          <h1 className="text-lg font-bold">位置を確認</h1>
          <p className="text-xs text-green-600">📸 写真から取得</p>
        </div>
        <div className="w-10"></div> {/* 中央揃え用 */}
      </header>

      {/* 地図エリア */}
      <main className="flex-1 relative">
        {photoLocation && pinLocation && (
          <Map
            center={photoLocation}
            zoom={18}
            onMapReady={handleMapReady}
            mapType={mapType}
          />
        )}

        {/* 地図切り替えボタン */}
        <button
          onClick={() => setMapType(mapType === 'street' ? 'hybrid' : 'street')}
          className="absolute top-4 right-4 z-[1000] bg-white px-4 py-2 rounded-lg shadow-lg font-bold text-sm hover:bg-gray-100"
        >
          {mapType === 'street' ? '🛰️ 航空写真' : '🗺️ 地図'}
        </button>

        {/* 写真位置に戻すボタン */}
        <button
          onClick={handleResetToPhotoLocation}
          className="absolute bottom-24 right-4 z-[1000] bg-white p-3 rounded-full shadow-lg hover:bg-gray-100"
        >
          📸
        </button>
      </main>

      {/* 説明 */}
      <div className="bg-blue-50 border-t border-blue-200 p-3">
        <p className="text-sm text-blue-800">
          <strong>💡 ヒント</strong><br />
          赤いピンをドラッグして位置を調整できます
        </p>
      </div>

      {/* 次へボタン */}
      <div className="p-4 pb-20 bg-white border-t">
        <button
          onClick={handleNext}
          className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold text-lg hover:bg-blue-700"
        >
          次へ（柱の情報入力）
        </button>
      </div>
    </div>
  );
}
