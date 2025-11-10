import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Map from '../components/common/Map';
import L from 'leaflet';

export default function RegisterLocation() {
  const navigate = useNavigate();
  const mapInstanceRef = useRef<L.Map | null>(null);
  const draggablePinRef = useRef<L.Marker | null>(null);
  const currentLocationCircleRef = useRef<L.Circle | null>(null);

  const [currentLocation, setCurrentLocation] = useState<[number, number] | null>(null);
  const [pinLocation, setPinLocation] = useState<[number, number] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mapType, setMapType] = useState<'street' | 'hybrid'>('street'); // 地図種類の切り替え

  // 画面表示時にGPS自動取得
  useEffect(() => {
    // 現在地取得
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const loc: [number, number] = [latitude, longitude];

          setCurrentLocation(loc);
          setPinLocation(loc); // ピンも同じ位置に初期配置
          setIsLoading(false);
        },
        (error) => {
          console.error('位置情報の取得に失敗しました:', error);
          alert('位置情報の取得に失敗しました。設定を確認してください。');
          setIsLoading(false);
        }
      );
    } else {
      alert('お使いのブラウザは位置情報に対応していません。');
      setIsLoading(false);
    }
  }, []);

  const handleMapReady = (map: L.Map) => {
    mapInstanceRef.current = map;

    if (currentLocation && pinLocation) {
      // 現在地マーカー
      const currentLocationIcon = L.divIcon({
        html: `<div style="background-color: #4285F4; color: white; padding: 4px 8px; border-radius: 12px; font-size: 12px; font-weight: bold; white-space: nowrap; box-shadow: 0 2px 4px rgba(0,0,0,0.3);" translate="no">📍 現在地</div>`,
        className: 'current-location-label',
        iconSize: [80, 24],
        iconAnchor: [40, 12],
      });

      currentLocationCircleRef.current = L.marker(currentLocation, {
        icon: currentLocationIcon,
      }).addTo(map) as any;

      // 赤いピン（ドラッグ可能）を追加（CSS-based divIcon）
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

      // ドラッグ時にピンの位置を更新し、地図の中心もピンに追従
      draggablePinRef.current.on('dragend', (event) => {
        const marker = event.target;
        const position = marker.getLatLng();
        setPinLocation([position.lat, position.lng]);
        
        // 地図の中心をピンの位置に移動（なめらかなアニメーション付き）
        if (mapInstanceRef.current) {
          mapInstanceRef.current.panTo(position, { 
            animate: true, 
            duration: 0.3  // 0.3秒でなめらかに移動
          });
        } 
      });
    }
  };

  // 現在地に戻すボタン
  const handleResetToCurrentLocation = () => {
    if (currentLocation && mapInstanceRef.current && draggablePinRef.current) {
      // 地図を現在地に移動
      mapInstanceRef.current.setView(currentLocation, 18, {
        animate: true,
        duration: 0.5,
      });

      // ピンを現在地に戻す
      draggablePinRef.current.setLatLng(currentLocation);
      setPinLocation(currentLocation);
    }
  };

  // 次へ進むボタン
  const handleNext = () => {
    if (pinLocation) {
      navigate('/register/pole-info', {
        state: {
          location: pinLocation,
        },
      });
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">📍</div>
          <div className="text-lg font-bold">位置情報を取得中...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex flex-col">
      {/* ヘッダー */}
      <header className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => navigate('/')}
          className="p-2 hover:bg-gray-100 rounded"
        >
          ← 戻る
        </button>
        <div className="text-center">
          <h1 className="text-lg font-bold">位置を確認</h1>
        </div>
        <div className="w-10"></div> {/* 中央揃え用 */}
      </header>

      {/* 地図エリア */}
      <main className="flex-1 relative">
        {currentLocation && pinLocation && (
          <Map 
            center={currentLocation} 
            zoom={18}
            mapType={mapType}  // 地図種類を渡す
            onMapReady={handleMapReady}
          />
        )}

        {/* 説明文（上部中央） */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white px-4 py-2 rounded-lg shadow-lg z-[1000]">
          <p className="text-sm font-bold">赤いピンをドラッグして調整</p>
        </div>

        {/* 右側のコントロールパネル */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 z-[1000]">
          {/* 地図種類選択 */}
          <button
            onClick={() => setMapType('street')}
            className={`px-4 py-2 rounded-lg shadow-lg font-bold transition-all ${
              mapType === 'street'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            🗺️ 地図
          </button>
          <button
            onClick={() => setMapType('hybrid')}
            className={`px-4 py-2 rounded-lg shadow-lg font-bold transition-all ${
              mapType === 'hybrid'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            🌐 航空写真
          </button>
        </div>

        {/* 現在地に戻すボタン（画面下部中央） */}
        <div className="absolute bottom-28 left-1/2 -translate-x-1/2 z-[1001]">
          <button
            onClick={handleResetToCurrentLocation}
            className="bg-white px-6 py-3 rounded-lg shadow-lg hover:bg-gray-50 font-bold"
            title="現在地に戻す"
          >
            <span translate="no">📍 現在地に戻す</span>
          </button>
        </div>
      </main>

      {/* 次へボタン - z-indexをBottomNav(2000)より高く設定 */}
      <div className="bg-white border-t px-4 py-4 relative z-[2001]">
        <button
          onClick={handleNext}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700"
        >
          ✅ この位置で次へ
        </button>
      </div>
    </div>
  );
}