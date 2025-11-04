import { useRef, useState, useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Map, { poleIcons } from '../components/common/Map';
import RegisterPanel from './pc/RegisterPanel';
import MapPinRegister from '../components/pc/register/MapPinRegister';
import { getNearbyPoles } from '../api/poles';
import L from 'leaflet';

// 何を: 電柱の種類名から適切なアイコンを取得する関数
// なぜ: データベースの poleTypeName を正しいアイコンにマッピングするため
const getPoleIcon = (poleTypeName: string, poleSubType?: string) => {
  if (poleTypeName === '電柱') return poleIcons.electric;
  if (poleTypeName === '照明柱' || poleSubType === 'light') return poleIcons.light;
  if (poleTypeName === '標識柱' || poleSubType === 'sign') return poleIcons.sign;
  if (poleTypeName === '信号柱' || poleSubType === 'traffic') return poleIcons.traffic;
  return poleIcons.other;
};

export default function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const mapInstanceRef = useRef<L.Map | null>(null);
  const currentLocationMarkerRef = useRef<L.Marker | null>(null);

  // 何を: パネル表示中の固定ピン用のref
  // なぜ: 位置調整モード以外でもピンを表示し続けるため
  const fixedPinRef = useRef<L.Marker | null>(null);

  // 何を: 登録済み電柱マーカーを保存するためのref
  // なぜ: ページリロード後も電柱を表示し続けるため
  const poleMarkersRef = useRef<L.Marker[]>([]);
  
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
  
  // 登録モードの管理
  const [isRegisterMode, setIsRegisterMode] = useState(false);

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

  // 何を: パネルが開いたら固定ピンを表示、閉じたら削除
  // なぜ: パネル表示中は常にピンを表示するため
  useEffect(() => {
    if (showRegisterPanel && pinLocation && mapInstanceRef.current) {
      // 固定ピンを作成（ドラッグ不可）
      if (fixedPinRef.current) {
        mapInstanceRef.current.removeLayer(fixedPinRef.current);
      }

      fixedPinRef.current = L.marker(pinLocation, {
        draggable: false,
        icon: L.icon({
          iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41]
        })
      }).addTo(mapInstanceRef.current);
    } else {
      // パネルが閉じたら固定ピンを削除
      if (fixedPinRef.current && mapInstanceRef.current) {
        mapInstanceRef.current.removeLayer(fixedPinRef.current);
        fixedPinRef.current = null;
      }
    }

    // クリーンアップ
    return () => {
      if (fixedPinRef.current && mapInstanceRef.current) {
        mapInstanceRef.current.removeLayer(fixedPinRef.current);
        fixedPinRef.current = null;
      }
    };
  }, [showRegisterPanel, pinLocation]);

  // 検索結果から地図の位置を変更
  useEffect(() => {
    const state = location.state as { center?: [number, number]; zoom?: number };
    if (state?.center && mapInstanceRef.current) {
      mapInstanceRef.current.setView(state.center, state.zoom || 18, {
        animate: true,
        duration: 1,
      });

      // 検索結果の位置にマーカーを追加
      const searchMarker = L.marker(state.center, {
        icon: L.icon({
          iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41],
        }),
      }).addTo(mapInstanceRef.current);

      // location.stateをクリア（次回のために）
      navigate('/', { replace: true, state: {} });

      // マーカーを10秒後に削除
      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.removeLayer(searchMarker);
        }
      }, 10000);
    }
  }, [location.state, navigate]);

  // 何を: 近くの電柱を取得して表示する関数
  // なぜ: マップ準備時と登録時に使い回すため
  const loadNearbyPoles = useCallback(async () => {
    if (!mapInstanceRef.current) return;

    // 地図の中心座標を取得
    const center = mapInstanceRef.current.getCenter();

    try {
      const poles = await getNearbyPoles(center.lat, center.lng, 50000);

      // 既存のマーカーを削除
      poleMarkersRef.current.forEach(marker => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.removeLayer(marker);
        }
      });
      poleMarkersRef.current = [];

      // 取得した電柱をマップに表示
      poles.forEach((pole: any) => {
        if (!mapInstanceRef.current) return;

        // 何を: 電柱の種類に応じた適切なカスタムアイコンを使用
        // なぜ: テストピンと同じ視覚的表現で登録済み電柱を表示するため
        const icon = getPoleIcon(pole.poleTypeName, pole.poleSubType);

        const marker = L.marker([pole.latitude, pole.longitude], {
          icon: icon
        }).addTo(mapInstanceRef.current);

        // 何を: ホバー時に電柱番号を表示するツールチップ
        // なぜ: ユーザーがマーカーに近づいた時に番号がわかるようにするため
        const numbers = pole.numbers || [];
        const numberText = numbers.length > 0 ? numbers.join(', ') : '番号なし';
        marker.bindTooltip(numberText, {
          permanent: false,
          direction: 'top',
          offset: [0, -40]
        });

        // 何を: クリック時に詳細を表示するポップアップ
        // なぜ: 電柱の詳細情報を確認できるようにするため
        const popupContent = `
          <div style="min-width: 200px;">
            <h3 style="font-weight: bold; margin-bottom: 8px;">${pole.poleTypeName}</h3>
            <p style="margin: 4px 0;"><strong>番号:</strong> ${numberText}</p>
            <p style="margin: 4px 0;"><strong>距離:</strong> 約${Math.round(pole.distance)}m</p>
            <p style="margin: 4px 0;"><strong>位置:</strong> ${pole.latitude.toFixed(6)}, ${pole.longitude.toFixed(6)}</p>
          </div>
        `;
        marker.bindPopup(popupContent, {
          maxWidth: 300,
          className: 'pole-popup'
        });

        poleMarkersRef.current.push(marker);
      });

      console.log(`✅ ${poles.length}件の電柱を表示しました`);
    } catch (error) {
      console.error('❌ 電柱の取得に失敗:', error);
    }
  }, []);

  // handleMapReady をメモ化（再実行を防ぐ）
  const handleMapReady = useCallback((map: L.Map) => {
    mapInstanceRef.current = map;
    // マップが準備できたら電柱を読み込む
    loadNearbyPoles();
  }, [loadNearbyPoles]);

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

            // 現在地を「📍 現在地」というテキストで表示
            const currentLocationIcon = L.divIcon({
              html: '<div style="background-color: #4285F4; color: white; padding: 4px 8px; border-radius: 12px; font-size: 12px; font-weight: bold; white-space: nowrap; box-shadow: 0 2px 4px rgba(0,0,0,0.3);" translate="no">📍 現在地</div>',
              className: 'current-location-label',
              iconSize: [60, 24],
              iconAnchor: [30, 12],
            });

            currentLocationMarkerRef.current = L.marker([latitude, longitude], {
              icon: currentLocationIcon,
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
  const handleQuickRegister = () => {
    if (window.innerWidth < 768) {
      // モバイル：既存の画面遷移
      navigate('/register/location');
    } else {
      // PC：登録モードに入る
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            setPinLocation([latitude, longitude]);
            setIsRegisterMode(true);
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

  // 位置確定
  const handleConfirmLocation = () => {
    setIsRegisterMode(false);
    setShowRegisterPanel(true);
  };

  // キャンセル
  const handleCancelRegister = () => {
    setIsRegisterMode(false);
    setPinLocation(null);
  };

  // 何を: 登録成功時に地図上にマーカーを作成
  // なぜ: 登録した電柱がすぐに地図に表示されるようにするため
  const handleRegisterSuccess = (location: [number, number], poleType: string, poleSubType?: string) => {
    if (!mapInstanceRef.current) return;

    // 何を: 電柱の種類名を取得（表示用）
    // なぜ: ポップアップに正しい種類名を表示するため
    const poleTypeName = poleType === 'electric' ? '電柱' : 'その他の柱';

    // 何を: 電柱の種類に応じた適切なカスタムアイコンを使用
    // なぜ: テストピンや既存の電柱と同じ視覚的表現で表示するため
    const icon = getPoleIcon(poleTypeName, poleSubType);

    // マーカーを作成
    const marker = L.marker(location, {
      icon: icon
    }).addTo(mapInstanceRef.current);

    // 何を: ホバー時に「新規登録」と表示
    // なぜ: 登録直後であることがわかるようにするため
    marker.bindTooltip('新規登録', {
      permanent: false,
      direction: 'top',
      offset: [0, -40]
    });

    // 何を: クリック時に詳細を表示
    // なぜ: 登録した電柱の情報を確認できるようにするため
    const popupContent = `
      <div style="min-width: 200px;">
        <h3 style="font-weight: bold; margin-bottom: 8px;">${poleTypeName}</h3>
        <p style="margin: 4px 0; color: green;"><strong>✅ 登録完了</strong></p>
        <p style="margin: 4px 0;"><strong>位置:</strong> ${location[0].toFixed(6)}, ${location[1].toFixed(6)}</p>
        <p style="margin: 4px 0; font-size: 12px; color: gray;">ページを更新すると番号が表示されます</p>
      </div>
    `;
    marker.bindPopup(popupContent, {
      maxWidth: 300,
      className: 'pole-popup'
    });

    // 何を: 登録したマーカーを保存
    // なぜ: ページリロード時も表示し続けるため
    poleMarkersRef.current.push(marker);

    // 地図を登録した位置に移動
    mapInstanceRef.current.setView(location, 18, {
      animate: true,
      duration: 1,
    });
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
          
          {/* 現在地ボタン */}
          <button
            onClick={handleCurrentLocation}
            className="bg-white px-4 py-3 rounded-lg shadow-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
            title="現在地を表示"
          >
            <span className="text-xl">📍</span>
            <span translate="no">現在地</span>
          </button>

          {/* PC版：検索ボタン */}
          <button
            onClick={() => navigate('/search')}
            className="hidden md:flex bg-white px-4 py-3 rounded-lg shadow-lg hover:bg-gray-50 transition-colors items-center gap-2"
            title="検索"
          >
            <span className="text-xl">🔍</span>
            <span>検索</span>
          </button>

          {/* PC版：新規登録ボタン（登録モード中は非表示） */}
          {!isRegisterMode && !showRegisterPanel && (
            <button
              onClick={handleQuickRegister}
              className="hidden md:flex bg-blue-600 text-white px-4 py-3 rounded-lg shadow-lg hover:bg-blue-700 font-bold transition-colors items-center gap-2"
              title="新規登録"
            >
              <span className="text-xl">＋</span>
              <span>新規登録</span>
            </button>
          )}
        </div>

        {/* PC版：ピン登録モード */}
        {isRegisterMode && (
          <MapPinRegister
            map={mapInstanceRef.current}
            pinLocation={pinLocation}
            setPinLocation={setPinLocation}
            onConfirm={handleConfirmLocation}
            onCancel={handleCancelRegister}
          />
        )}

        {/* PC版：登録パネル（768px以上で表示） */}
        {showRegisterPanel && pinLocation && (
          <RegisterPanel
            pinLocation={pinLocation}
            onClose={() => {
              setShowRegisterPanel(false);
              setPinLocation(null); // ピンもリセット
            }}
            map={mapInstanceRef.current}
            onLocationChange={setPinLocation}
            fixedPinRef={fixedPinRef}
            onRegisterSuccess={handleRegisterSuccess}
          />
        )}
      </main>
      
      {/* 新規登録ボタン（登録モード中とパネル表示中は非表示、モバイルのみ表示） */}
      {!isRegisterMode && !showRegisterPanel && (
        <button
          onClick={handleQuickRegister}
          className="md:hidden absolute bottom-36 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-6 py-3 rounded-full shadow-lg hover:bg-blue-700 font-bold z-[2001]"
        >
          ＋ 新規登録
        </button>
      )}
    </div>
  );
}