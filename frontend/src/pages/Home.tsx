import { useRef } from 'react';
import Map from '../components/Map';
import L from 'leaflet';

export default function Home() {
  const mapInstanceRef = useRef<L.Map | null>(null);
  const currentLocationMarkerRef = useRef<L.CircleMarker | null>(null);

  const handleMapReady = (map: L.Map) => {
    mapInstanceRef.current = map;
  };

  const handleCurrentLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          
          if (mapInstanceRef.current) {
            // 地図を現在地に移動
            mapInstanceRef.current.setView([latitude, longitude], 16, {
              animate: true,
              duration: 1,
            });

            // 現在地マーカーを削除（既にある場合）
            if (currentLocationMarkerRef.current) {
              currentLocationMarkerRef.current.remove();
            }

            // 青い円のマーカーを追加
            currentLocationMarkerRef.current = L.circleMarker([latitude, longitude], {
              radius: 8,
              fillColor: '#4285F4',
              color: '#ffffff',
              weight: 2,
              opacity: 1,
              fillOpacity: 0.8,
            }).addTo(mapInstanceRef.current);
          }
        },
        (error) => {
          console.error('位置情報の取得に失敗しました:', error);
          alert('位置情報の取得に失敗しました。設定を確認してください。');
        }
      );
    } else {
      alert('お使いのブラウザは位置情報に対応していません。');
    }
  };

  return (
    <div className="h-screen w-full flex flex-col">
      <header className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-bold">PoleNavi</h1>
        <div className="flex gap-2">
          <button 
            onClick={handleCurrentLocation}
            className="p-2 hover:bg-gray-100 rounded"
            title="現在地を表示"
          >
            📍
          </button>
          <button className="p-2 hover:bg-gray-100 rounded">🔔</button>
        </div>
      </header>
      
      <main className="flex-1 relative">
        <Map onMapReady={handleMapReady} />
      </main>
      
      <button className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-6 py-3 rounded-full shadow-lg hover:bg-blue-700 font-bold z-[1000]">
        ⚡ クイック登録
      </button>
    </div>
  );
}