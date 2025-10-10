import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Map from '../components/Map';
import L from 'leaflet';

export default function RegisterLocation() {
  const navigate = useNavigate();
  const mapInstanceRef = useRef<L.Map | null>(null);
  const draggablePinRef = useRef<L.Marker | null>(null);
  const currentLocationCircleRef = useRef<L.Circle | null>(null);
  
  const [currentLocation, setCurrentLocation] = useState<[number, number] | null>(null);
  const [pinLocation, setPinLocation] = useState<[number, number] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 画面表示時にGPS自動取得
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const location: [number, number] = [latitude, longitude];
          
          setCurrentLocation(location);
          setPinLocation(location); // ピンも同じ位置に初期配置
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
      // 現在地の薄い青い円を追加
      currentLocationCircleRef.current = L.circle(currentLocation, {
        radius: 10,
        fillColor: '#4285F4',
        color: '#4285F4',
        weight: 1,
        opacity: 0.3,
        fillOpacity: 0.1,
      }).addTo(map);

      // 赤いピン（ドラッグ可能）を追加
      const redIcon = L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
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
      navigate('/register/pole-type', { state: { location: pinLocation } });
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
        <h1 className="text-lg font-bold">位置を確認</h1>
        <div className="w-10"></div> {/* 中央揃え用 */}
      </header>

      {/* 地図エリア */}
      <main className="flex-1 relative">
        {currentLocation && pinLocation && (
          <Map 
            center={currentLocation} 
            zoom={18} 
            onMapReady={handleMapReady}
          />
        )}

        {/* 現在地に戻すボタン */}
        <button
          onClick={handleResetToCurrentLocation}
          className="absolute top-4 right-4 bg-white p-3 rounded-full shadow-lg hover:bg-gray-50 z-[1000]"
          title="現在地に戻す"
        >
          📍
        </button>

        {/* 説明文 */}
        <div className="absolute top-4 left-4 bg-white px-4 py-2 rounded-lg shadow-lg z-[1000]">
          <p className="text-sm font-bold">赤いピンをドラッグして調整</p>
        </div>
      </main>

      {/* 次へボタン */}
      <div className="bg-white border-t px-4 py-4">
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