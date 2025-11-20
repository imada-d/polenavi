/**
 * 写真から登録 - 手動位置選択画面（GPS情報なし専用）
 * 写真に位置情報がなかった場合に、現在地または手動で位置を選択する
 */

import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Map from '../../components/common/Map';
import { X } from 'lucide-react';
import L from 'leaflet';

export default function PhotoRegisterManualLocation() {
  const navigate = useNavigate();
  const location = useLocation();
  const mapInstanceRef = useRef<L.Map | null>(null);
  const draggablePinRef = useRef<L.Marker | null>(null);

  // 前の画面から受け取ったデータ
  const { photos, poleType, poleSubType, plateCount, numbers } = location.state || {};

  const [pinLocation, setPinLocation] = useState<[number, number] | null>(null);
  const [mapType, setMapType] = useState<'street' | 'hybrid'>('street');
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  // データが渡されていない場合は最初の画面に戻す
  useEffect(() => {
    if (!photos || !poleType || plateCount === null || plateCount === undefined || !numbers) {
      alert('データが不足しています。最初からやり直してください。');
      navigate('/register-from-photo');
    }
  }, [photos, poleType, plateCount, numbers, navigate]);

  const handleMapReady = (map: L.Map) => {
    mapInstanceRef.current = map;

    if (pinLocation) {
      addDraggablePin(map, pinLocation);
    }
  };

  const addDraggablePin = (map: L.Map, position: [number, number]) => {
    // 既存のピンがあれば削除
    if (draggablePinRef.current) {
      draggablePinRef.current.remove();
    }

    // 赤いピン（ドラッグ可能）
    const redIcon = L.divIcon({
      html: '<div style="background-color: #ef4444; width: 30px; height: 30px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>',
      className: 'custom-pin-icon',
      iconSize: [30, 30],
      iconAnchor: [15, 30],
    });

    draggablePinRef.current = L.marker(position, {
      icon: redIcon,
      draggable: true,
    }).addTo(map);

    // ドラッグ時にピンの位置を更新
    draggablePinRef.current.on('dragend', (event) => {
      const marker = event.target;
      const markerPosition = marker.getLatLng();
      setPinLocation([markerPosition.lat, markerPosition.lng]);

      if (mapInstanceRef.current) {
        mapInstanceRef.current.panTo(markerPosition, {
          animate: true,
          duration: 0.3,
        });
      }
    });
  };

  // 現在地を取得ボタン
  const handleGetCurrentLocation = () => {
    if (!('geolocation' in navigator)) {
      alert('お使いのブラウザは位置情報に対応していません。');
      return;
    }

    setIsGettingLocation(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const newLocation: [number, number] = [latitude, longitude];

        setPinLocation(newLocation);

        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView(newLocation, 18, {
            animate: true,
            duration: 0.5,
          });

          addDraggablePin(mapInstanceRef.current, newLocation);
        }

        setIsGettingLocation(false);
      },
      (error) => {
        console.error('位置情報の取得に失敗:', error);
        alert('位置情報の取得に失敗しました。\n地図上をタップして位置を選択してください。');
        setIsGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // 地図クリックで位置を設定
  const handleMapClick = (e: L.LeafletMouseEvent) => {
    const { lat, lng } = e.latlng;
    const newLocation: [number, number] = [lat, lng];

    setPinLocation(newLocation);

    if (mapInstanceRef.current) {
      addDraggablePin(mapInstanceRef.current, newLocation);
    }
  };

  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.on('click', handleMapClick);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.off('click', handleMapClick);
      }
    };
  }, []);

  // 次へ進むボタン
  const handleNext = () => {
    if (!pinLocation) {
      alert('位置を選択してください。\n「現在地を取得」ボタンを押すか、地図上をタップしてください。');
      return;
    }

    const dataToSave = {
      location: pinLocation,
      photos,
      poleType,
      poleSubType,
      plateCount,
      numbers,
      manualLocation: true, // 手動選択フラグ
    };

    // sessionStorage に保存（iPhoneで消える対策）
    try {
      sessionStorage.setItem('poleRegistrationData', JSON.stringify(dataToSave));
      console.log('✅ sessionStorage に保存（ManualLocation）');
    } catch (error) {
      console.error('❌ sessionStorage 保存エラー:', error);
    }

    // メモ画面に直接遷移
    navigate('/register/photo/memo', {
      state: dataToSave,
    });
  };

  // 初期表示位置（東京駅周辺）
  const defaultCenter: [number, number] = [35.6812, 139.7671];

  return (
    <div className="h-screen w-full flex flex-col">
      {/* ヘッダー */}
      <header className="bg-white border-b px-4 py-3 flex items-center justify-between z-10">
        <div className="text-center flex-1">
          <h1 className="text-lg font-bold">📍 位置を選択</h1>
          <p className="text-xs text-orange-600">
            写真に位置情報がありません
          </p>
        </div>
        <button
          onClick={() => navigate('/register-from-photo')}
          className="p-2 hover:bg-gray-100 rounded-full"
          title="キャンセル"
        >
          <X size={24} className="text-gray-600" />
        </button>
      </header>

      {/* 地図エリア */}
      <main className="flex-1 relative">
        <Map
          center={pinLocation || defaultCenter}
          zoom={pinLocation ? 18 : 13}
          onMapReady={handleMapReady}
          mapType={mapType}
        />

        {/* 地図切り替えボタン */}
        <button
          onClick={() => setMapType(mapType === 'street' ? 'hybrid' : 'street')}
          className="absolute top-4 right-4 z-[1000] bg-white px-4 py-2 rounded-lg shadow-lg font-bold text-sm hover:bg-gray-100"
        >
          {mapType === 'street' ? '🛰️ 航空写真' : '🗺️ 地図'}
        </button>

        {/* 現在地取得ボタン */}
        <button
          onClick={handleGetCurrentLocation}
          disabled={isGettingLocation}
          className="absolute bottom-24 right-4 z-[1000] bg-blue-600 text-white px-4 py-3 rounded-full shadow-lg hover:bg-blue-700 disabled:bg-gray-400 font-bold"
        >
          {isGettingLocation ? '取得中...' : '📍 現在地を取得'}
        </button>
      </main>

      {/* 説明 */}
      <div className="bg-orange-50 border-t border-orange-200 p-3">
        <p className="text-sm text-orange-800">
          <strong>💡 ヒント</strong><br />
          「現在地を取得」ボタンを押すか、地図上をタップして位置を選択してください。<br />
          赤いピンをドラッグして微調整できます。
        </p>
      </div>

      {/* 次へボタン */}
      <div className="p-4 pb-32 bg-white border-t shadow-lg">
        <button
          onClick={handleNext}
          disabled={!pinLocation}
          className={`w-full py-3 rounded-lg font-bold text-lg transition-colors ${
            pinLocation
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          次へ（メモ入力）
        </button>
      </div>
    </div>
  );
}
