import { useRef, useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Map from '../components/common/Map';
import RegisterPanel from './pc/RegisterPanel';
import L from 'leaflet';

export default function Home() {
    console.log('🟢 Home がレンダリングされました');
  const navigate = useNavigate();
  const mapInstanceRef = useRef<L.Map | null>(null);
  const currentLocationMarkerRef = useRef<L.CircleMarker | null>(null);
  
  // 地図タイプの状態を管理（2モード）
  const [mapType, setMapType] = useState<'street' | 'hybrid'>('street');
  // 初期表示位置（日本全体）
  const [initialCenter, setInitialCenter] = useState<[number, number]>([36.2048, 138.2529]);
  const [initialZoom, setInitialZoom] = useState<number>(5); // 日本全体が見えるズーム
  
  // 住所検索
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // PC版：登録パネルの表示状態
  const [showRegisterPanel, setShowRegisterPanel] = useState(false);
  const [pinLocation, setPinLocation] = useState<[number, number] | null>(null);

  // 初回のみ現在地を取得して初期表示にする
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setInitialCenter([latitude, longitude]);
          setInitialZoom(13); // 現在地の場合は詳細表示
        },
        (error) => {
          console.log('位置情報が取得できませんでした。日本全体を表示します。', error);
          // エラー時は日本全体のまま
        }
      );
    }
  }, []);

  // handleMapReady をメモ化（再実行を防ぐ）
  const handleMapReady = useCallback((map: L.Map) => {
    mapInstanceRef.current = map;
  }, []);

  const handleCurrentLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          
          if (mapInstanceRef.current) {
            mapInstanceRef.current.setView([latitude, longitude], 16, {
              animate: true,
              duration: 1,
            });

            if (currentLocationMarkerRef.current) {
              currentLocationMarkerRef.current.remove();
            }

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

  // 住所検索処理
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      alert('住所を入力してください');
      return;
    }

    setIsSearching(true);

    try {
      // Nominatim API（OpenStreetMapのジオコーディング）
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&countrycodes=jp&limit=1`,
        {
          headers: {
            'User-Agent': 'PoleNavi App', // 必須
          },
        }
      );

      const data = await response.json();

      if (data.length > 0) {
        const { lat, lon } = data[0];
        
        if (mapInstanceRef.current) {
          // 検索結果の位置に移動
          mapInstanceRef.current.setView([parseFloat(lat), parseFloat(lon)], 15, {
            animate: true,
            duration: 1,
          });
        }
      } else {
        alert('住所が見つかりませんでした。別の住所を試してください。');
      }
    } catch (error) {
      console.error('住所検索エラー:', error);
      alert('住所検索に失敗しました。もう一度お試しください。');
    } finally {
      setIsSearching(false);
    }
  };

  // 新規登録ボタンのクリック処理（レスポンシブ対応）
  // モバイル（768px未満）: 画面遷移、PC（768px以上）: 右パネル表示
  const handleQuickRegister = () => {
    console.log('🟡 handleQuickRegister が呼ばれました');
    if (window.innerWidth < 768) {
      // モバイル：既存の画面遷移
      navigate('/register/location');
    } else {
      // PC：現在地を取得して RegisterPanel を表示
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            setPinLocation([latitude, longitude]);
            setShowRegisterPanel(true);
          },
          (error) => {
            console.error('位置情報の取得に失敗しました:', error);
            alert('位置情報の取得に失敗しました。設定を確認してください。');
          }
        );
      } else {
        alert('お使いのブラウザは位置情報に対応していません。');
      }
    }
  };

  return (
    <div className="h-screen w-full flex flex-col">
      <header className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-bold">PoleNavi</h1>
        <div className="flex gap-2">
          <button className="p-2 hover:bg-gray-100 rounded">🔔</button>
        </div>
      </header>
      
      <main className="flex-1 relative">
        <Map 
          onMapReady={handleMapReady} 
          mapType={mapType}
          center={initialCenter}
          zoom={initialZoom}
        />
        
        {/* 住所検索窓（地図の上部中央） */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] w-full max-w-md px-4">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="住所を検索... (例: 東京都渋谷区)"
              className="w-full px-4 py-3 pr-12 rounded-lg shadow-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isSearching}
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
              disabled={isSearching}
              title="検索"
            >
              {isSearching ? '🔄' : '🔍'}
            </button>
          </form>
        </div>
        
        {/* 右側のコントロールエリア */}
        <div className={`absolute top-4 z-[1000] flex flex-col gap-2 transition-all duration-300 ${
          showRegisterPanel ? 'right-[420px]' : 'right-4'
        }`}>
          {/* 地図タイプ選択ボタン */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <button
              onClick={() => setMapType('street')}
              className={`flex items-center gap-2 px-4 py-2 w-full text-left hover:bg-gray-100 transition-colors ${
                mapType === 'street' ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-700'
              }`}
            >
              <span className="text-xl">🗺️</span>
              <span>地図</span>
            </button>
            
            <div className="border-t border-gray-200"></div>
            
            <button
              onClick={() => setMapType('hybrid')}
              className={`flex items-center gap-2 px-4 py-2 w-full text-left hover:bg-gray-100 transition-colors ${
                mapType === 'hybrid' ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-700'
              }`}
            >
              <span className="text-xl">🌐</span>
              <span>航空写真</span>
            </button>
          </div>
          
          {/* 現在地ボタン（独立） */}
          <button
            onClick={handleCurrentLocation}
            className="bg-white p-3 rounded-lg shadow-lg hover:bg-gray-50 transition-colors"
            title="現在地を表示"
          >
            <span className="text-2xl">📍</span>
          </button>
        </div>

        {/* PC版：登録パネル（768px以上で表示） */}
        {showRegisterPanel && pinLocation && (
          <RegisterPanel
            pinLocation={pinLocation}
            onClose={() => setShowRegisterPanel(false)}
          />
        )}
      </main>
      
      {/* 新規登録ボタン */}
      <button 
        onClick={handleQuickRegister}
        className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-6 py-3 rounded-full shadow-lg hover:bg-blue-700 font-bold z-[1000]"
      >
        ＋ 新規登録
      </button>
    </div>
  );
}