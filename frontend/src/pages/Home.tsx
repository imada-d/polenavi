import { useRef, useState, useCallback, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import Map, { poleIcons } from '../components/common/Map';
import RegisterPanel from './pc/RegisterPanel';
import PoleDetailPanel from '../components/pc/PoleDetailPanel';
import SearchPanel from '../components/pc/SearchPanel';
import MapPinRegister from '../components/pc/register/MapPinRegister';
import Header from '../components/pc/Header';
import { getNearbyPoles, getPoleById } from '../api/poles';
import L from 'leaflet';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

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
  const [searchParams, setSearchParams] = useSearchParams();
  const mapInstanceRef = useRef<L.Map | null>(null);
  const currentLocationMarkerRef = useRef<L.Marker | null>(null);

  // 何を: パネル表示中の固定ピン用のref
  // なぜ: 位置調整モード以外でもピンを表示し続けるため
  const fixedPinRef = useRef<L.Marker | null>(null);

  // 何を: 登録済み電柱マーカーを保存するためのref
  // なぜ: ページリロード後も電柱を表示し続けるため
  const poleMarkersRef = useRef<L.Marker[]>([]);

  // 何を: マーカークラスタグループのref
  // なぜ: ズームレベルに応じて電柱を自動的にグループ化するため（Googleマップと同じ）
  const markerClusterGroupRef = useRef<L.MarkerClusterGroup | null>(null);

  // 何を: 位置修正モード中のマーカー用ref
  // なぜ: メインの地図でドラッグ可能なマーカーを管理するため
  const editingPoleMarkerRef = useRef<L.Marker | null>(null);

  // 地図タイプの状態を管理（2モード）
  const [mapType, setMapType] = useState<'street' | 'hybrid'>('street');
  // 初期表示位置（現在地取得前は null、失敗時に日本全体）
  const [initialCenter, setInitialCenter] = useState<[number, number] | null>(null);
  const [initialZoom, setInitialZoom] = useState<number>(13);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true); // 位置情報取得中フラグ
  const [currentUserLocation, setCurrentUserLocation] = useState<[number, number] | null>(null); // 現在地座標を保存

  // 住所検索
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // PC版：登録パネルの表示状態
  const [showRegisterPanel, setShowRegisterPanel] = useState(false);
  const [pinLocation, setPinLocation] = useState<[number, number] | null>(null);

  // 登録モードの管理
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  // PC版：詳細パネルの表示状態
  const [showDetailPanel, setShowDetailPanel] = useState(false);
  const [selectedPoleId, setSelectedPoleId] = useState<number | null>(null);
  const [selectedPoleData, setSelectedPoleData] = useState<any | null>(null);

  // PC版：検索パネルの表示状態
  const [showSearchPanel, setShowSearchPanel] = useState(false);

  // 何を: 初回表示で現在地を取得、失敗時のみ日本全体を表示
  // なぜ: ユーザーが毎回現在地から始められるようにするため
  useEffect(() => {
    // URLパラメータがある場合は、そちらを優先
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const zoom = searchParams.get('zoom');

    if (lat && lng) {
      console.log(`🗺️ URLパラメータから地図初期化: ${lat}, ${lng}`);
      setInitialCenter([parseFloat(lat), parseFloat(lng)]);
      setInitialZoom(zoom ? parseInt(zoom, 10) : 18);
      setIsLoadingLocation(false);
      // URLパラメータをクリア
      setSearchParams({});
      return;
    }

    // URLパラメータがない場合は現在地を取得
    if ('geolocation' in navigator) {
      console.log('📍 位置情報を取得中...');
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          console.log(`✅ 現在地取得成功: ${latitude}, ${longitude}`);
          setInitialCenter([latitude, longitude]);
          setInitialZoom(16); // 現在地の場合は詳細表示
          setCurrentUserLocation([latitude, longitude]); // 現在地座標を保存
          setIsLoadingLocation(false);
        },
        (error) => {
          console.log('❌ 位置情報が取得できませんでした。日本全体を表示します。', error);
          // エラー時は日本全体
          setInitialCenter([36.2048, 138.2529]);
          setInitialZoom(5);
          setIsLoadingLocation(false);
        },
        {
          enableHighAccuracy: false, // 高精度不要（起動を早くするため）
          timeout: 10000, // 10秒でタイムアウト
          maximumAge: 60000, // 1分以内のキャッシュを許可
        }
      );
    } else {
      // 位置情報非対応の場合は日本全体
      console.log('⚠️ このブラウザは位置情報に対応していません');
      setInitialCenter([36.2048, 138.2529]);
      setInitialZoom(5);
      setIsLoadingLocation(false);
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

      // カスタムDivアイコンを使用（確実に表示される）
      const customIcon = L.divIcon({
        html: '<div style="background-color: #ef4444; width: 30px; height: 30px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>',
        className: 'custom-pin-icon',
        iconSize: [30, 30],
        iconAnchor: [15, 30],
      });

      fixedPinRef.current = L.marker(pinLocation, {
        draggable: false,
        icon: customIcon
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


  // 何を: 電柱マーカークリック時の処理
  // なぜ: 電柱の詳細情報を表示するため
  const handlePoleClick = useCallback(async (poleId: number) => {
    console.log('🔍 handlePoleClick called with poleId:', poleId);
    try {
      // PC版の場合は詳細パネルを表示
      if (window.innerWidth >= 768) {
        console.log('✨ Setting pole ID:', poleId);
        setSelectedPoleId(poleId);
        setShowDetailPanel(true);
      } else {
        // モバイル版の場合は詳細ページに遷移
        navigate(`/pole/${poleId}`);
      }
    } catch (error) {
      console.error('電柱詳細取得エラー:', error);
      alert('電柱の詳細情報を取得できませんでした');
    }
  }, [navigate]);

  // 何を: selectedPoleIdが変更されたら、電柱の詳細データを取得
  // なぜ: 詳細パネルが開いている状態で別の電柱をクリックしても、データが更新されるようにするため
  useEffect(() => {
    console.log('📝 useEffect triggered - selectedPoleId:', selectedPoleId, 'showDetailPanel:', showDetailPanel);
    if (selectedPoleId && showDetailPanel) {
      console.log('🔄 Fetching pole data for ID:', selectedPoleId);
      getPoleById(selectedPoleId)
        .then((poleData) => {
          console.log('✅ Pole data fetched:', poleData);
          setSelectedPoleData(poleData);
        })
        .catch((error) => {
          console.error('電柱詳細取得エラー:', error);
          alert('電柱の詳細情報を取得できませんでした');
          setShowDetailPanel(false);
          setSelectedPoleId(null);
        });
    }
  }, [selectedPoleId, showDetailPanel]);

  // 何を: 近くの電柱を取得して表示する関数
  // なぜ: マップ準備時と登録時に使い回すため
  const loadNearbyPoles = useCallback(async () => {
    if (!mapInstanceRef.current) return;

    console.log('🔄 loadNearbyPoles: 電柱を再読み込み中...');

    // 地図の中心座標を取得
    const center = mapInstanceRef.current.getCenter();

    try {
      const poles = await getNearbyPoles(center.lat, center.lng, 50000);
      console.log('📊 取得した電柱:', poles.map((p: any) => ({ id: p.id, lat: p.latitude, lng: p.longitude })));

      // 何を: 既存のクラスタグループをクリア
      // なぜ: 古いマーカーを削除して新しいマーカーだけ表示するため
      if (markerClusterGroupRef.current && mapInstanceRef.current) {
        mapInstanceRef.current.removeLayer(markerClusterGroupRef.current);
      }

      // 何を: 新しいクラスタグループを作成
      // なぜ: Googleマップのように電柱をグループ化して表示するため
      markerClusterGroupRef.current = L.markerClusterGroup({
        maxClusterRadius: 50, // 50px以内の電柱をグループ化
        spiderfyOnMaxZoom: true, // 最大ズーム時にクモの巣状に展開
        showCoverageOnHover: false, // ホバー時の範囲表示を無効化
        zoomToBoundsOnClick: true, // クリックでズームイン
      });

      poleMarkersRef.current = [];

      // 何を: 現在のズームレベルを取得
      // なぜ: ズームレベルに応じて番号の表示を切り替えるため
      const currentZoom = mapInstanceRef.current.getZoom();
      const shouldShowLabels = currentZoom >= 15; // ズーム15以上で常に表示

      // 取得した電柱をマップに表示
      poles.forEach((pole: any) => {
        if (!mapInstanceRef.current) return;

        // 何を: 電柱の種類に応じた適切なカスタムアイコンを使用
        // なぜ: テストピンと同じ視覚的表現で登録済み電柱を表示するため
        const icon = getPoleIcon(pole.poleTypeName, pole.poleSubType);

        // 何を: マーカーを作成（地図には直接追加せず、クラスタグループに追加）
        // なぜ: ズームレベルに応じて自動的にグループ化するため
        // 補足: latitude/longitudeを数値に変換（データベースから文字列として返される場合があるため）
        const lat = Number(pole.latitude);
        const lng = Number(pole.longitude);
        const marker = L.marker([lat, lng], {
          icon: icon
        });

        // 何を: 電柱番号を表示するツールチップ
        // なぜ: ズームレベル15以上では常に表示、それ以下ではホバー時のみ表示
        const numbers = pole.numbers || [];
        const numberText = numbers.length > 0 ? numbers.join(', ') : '番号なし';
        marker.bindTooltip(numberText, {
          permanent: shouldShowLabels, // ズームレベルに応じて常に表示/ホバー時のみ
          direction: 'top',
          offset: [0, -40],
          className: shouldShowLabels ? 'permanent-pole-label' : ''
        });

        // 何を: モバイル用のポップアップを追加
        // なぜ: タップした時に番号を大きく表示するため
        const popupContent = `
          <div style="text-align: center; padding: 4px;">
            <strong style="font-size: 14px;">${numberText}</strong><br>
            <span style="font-size: 11px; color: #666;">${pole.poleTypeName || 'その他'}</span>
          </div>
        `;
        marker.bindPopup(popupContent, {
          closeButton: false,
          className: 'pole-number-popup'
        });

        // 何を: クリック時に詳細パネルを表示
        // なぜ: 電柱の詳細情報をアコーディオン形式で確認できるようにするため
        marker.on('click', () => {
          handlePoleClick(pole.id);
        });

        // 何を: マーカーをクラスタグループに追加
        // なぜ: Googleマップのように自動的にグループ化して表示するため
        markerClusterGroupRef.current?.addLayer(marker);
        poleMarkersRef.current.push(marker);
      });

      // 何を: クラスタグループを地図に追加
      // なぜ: 全てのマーカーをまとめて地図に表示するため
      if (markerClusterGroupRef.current && mapInstanceRef.current) {
        mapInstanceRef.current.addLayer(markerClusterGroupRef.current);
      }
    } catch (error) {
      console.error('❌ 電柱の取得に失敗:', error);
    }
  }, [handlePoleClick]);

  // handleMapReady をメモ化（再実行を防ぐ）
  const handleMapReady = useCallback((map: L.Map) => {
    mapInstanceRef.current = map;

    // 何を: 地図の移動（ドラッグ・ズーム）が終わったら電柱を再読み込み
    // なぜ: 移動先の範囲にある電柱を表示するため
    map.on('moveend', () => {
      loadNearbyPoles();
    });

    // マップが準備できたら電柱を読み込む
    loadNearbyPoles();

    // 何を: 地図準備時に現在地が既に取得されていたら現在地マーカーを追加
    // なぜ: 地図の準備と現在地取得のタイミングによってマーカーが表示されない問題を防ぐため
    if (currentUserLocation && !currentLocationMarkerRef.current) {
      console.log('📍 地図準備時：現在地マーカーを追加');
      const currentLocationIcon = L.divIcon({
        html: '<div style="background-color: #4285F4; color: white; padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: bold; white-space: nowrap; box-shadow: 0 2px 4px rgba(0,0,0,0.3);" translate="no">📍 現在地</div>',
        className: 'current-location-label',
        iconSize: [85, 28],
        iconAnchor: [42.5, 14],
      });

      currentLocationMarkerRef.current = L.marker(currentUserLocation, {
        icon: currentLocationIcon,
      }).addTo(map);
    }
  }, [loadNearbyPoles, currentUserLocation]);

  // 何を: 地図が準備できて、現在地が取得できていたら現在地マーカーを表示
  // なぜ: 初期表示時に自動的に現在地マーカーを表示するため
  useEffect(() => {
    if (mapInstanceRef.current && currentUserLocation && !currentLocationMarkerRef.current) {
      console.log('📍 初期表示：現在地マーカーを追加');
      const currentLocationIcon = L.divIcon({
        html: '<div style="background-color: #4285F4; color: white; padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: bold; white-space: nowrap; box-shadow: 0 2px 4px rgba(0,0,0,0.3);" translate="no">📍 現在地</div>',
        className: 'current-location-label',
        iconSize: [85, 28],
        iconAnchor: [42.5, 14],
      });

      currentLocationMarkerRef.current = L.marker(currentUserLocation, {
        icon: currentLocationIcon,
      }).addTo(mapInstanceRef.current);
    }
  }, [currentUserLocation]);

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
              html: '<div style="background-color: #4285F4; color: white; padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: bold; white-space: nowrap; box-shadow: 0 2px 4px rgba(0,0,0,0.3);" translate="no">📍 現在地</div>',
              className: 'current-location-label',
              iconSize: [85, 28],
              iconAnchor: [42.5, 14],
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

  // 電柱登録ボタンのクリック処理（レスポンシブ対応）
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

  // 何を: 位置修正中のコールバックを保存するref
  // なぜ: マーカーをドラッグしたときに PoleDetailPanel に通知するため
  const editingLocationCallbackRef = useRef<((lat: number, lng: number) => void) | null>(null);

  // 何を: 位置修正モード開始時のハンドラー
  // なぜ: PoleDetailPanelから通知を受けて、メインの地図にドラッグ可能なマーカーを表示するため
  const handleEditLocationStart = (lat: number, lng: number, onLocationChange?: (lat: number, lng: number) => void) => {
    if (!mapInstanceRef.current) return;

    console.log(`🎯 位置修正開始: 初期位置 ${lat}, ${lng}`);

    // 何を: 位置変更コールバックを保存
    // なぜ: マーカーのドラッグイベントで使用するため
    editingLocationCallbackRef.current = onLocationChange || null;

    // 何を: メインの地図に移動
    // なぜ: ユーザーが位置を確認・調整しやすくするため
    mapInstanceRef.current.setView([lat, lng], 18, {
      animate: true,
      duration: 0.5,
    });

    // 何を: ドラッグ可能なマーカーを作成
    // なぜ: ユーザーが大きな地図で位置を調整できるようにするため
    // 補足: Leafletはマーカードラッグ中は自動的に地図のドラッグを抑制する
    editingPoleMarkerRef.current = L.marker([lat, lng], {
      draggable: true,
      icon: L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      })
    }).addTo(mapInstanceRef.current);

    // 何を: マーカーがドラッグされた時のイベントリスナーを追加
    // なぜ: 新しい位置を取得してPoleDetailPanelに通知するため
    editingPoleMarkerRef.current.on('dragend', () => {
      if (editingPoleMarkerRef.current) {
        const pos = editingPoleMarkerRef.current.getLatLng();
        console.log(`📍 マーカーをドラッグ: 新しい位置 ${pos.lat}, ${pos.lng}`);

        // 何を: PoleDetailPanelに新しい位置を通知
        // なぜ: 詳細パネルの表示を更新するため
        if (editingLocationCallbackRef.current) {
          editingLocationCallbackRef.current(pos.lat, pos.lng);
        }
      }
    });
  };

  // 何を: 位置修正モードキャンセル時のハンドラー
  // なぜ: メインの地図のドラッグ可能なマーカーを削除するため
  const handleEditLocationCancel = () => {
    // 何を: ドラッグ可能なマーカーを削除
    // なぜ: 位置修正モードを終了するため
    if (editingPoleMarkerRef.current && mapInstanceRef.current) {
      console.log('🗑️ ドラッグ可能マーカーを削除');
      mapInstanceRef.current.removeLayer(editingPoleMarkerRef.current);
      editingPoleMarkerRef.current = null;
    } else {
      console.log('⚠️ ドラッグ可能マーカーが存在しません');
    }
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

    // 何を: ホバー時に「電柱を登録」と表示
    // なぜ: 登録直後であることがわかるようにするため
    marker.bindTooltip('電柱を登録', {
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
      {/* PC用ヘッダー */}
      <Header onSearchClick={() => setShowSearchPanel(true)} />

      {/* モバイル用ヘッダー */}
      <header className="md:hidden bg-white border-b px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-bold">🗺️ PoleNavi</h1>
        <div className="flex gap-2">
          <button className="p-2 hover:bg-gray-100 rounded">🔔</button>
        </div>
      </header>
      
      <main className="flex-1 relative">
        {/* 何を: 位置情報取得中はローディング表示 */}
        {/* なぜ: 地図が2回描画されるのを防ぐため */}
        {isLoadingLocation || !initialCenter ? (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">📍 現在地を取得中...</p>
            </div>
          </div>
        ) : (
          <Map
            onMapReady={handleMapReady}
            mapType={mapType}
            center={initialCenter}
            zoom={initialZoom}
          />
        )}
        
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
          showRegisterPanel ? 'right-[420px]' : showDetailPanel ? 'right-[570px]' : 'right-4'
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
            onClick={() => setShowSearchPanel(true)}
            className="hidden md:flex bg-white px-4 py-3 rounded-lg shadow-lg hover:bg-gray-50 transition-colors items-center gap-2"
            title="検索"
          >
            <span className="text-xl">🔍</span>
            <span>検索</span>
          </button>

          {/* PC版：電柱登録ボタン（登録モード中・パネル表示中は非表示） */}
          {!isRegisterMode && !showRegisterPanel && !showDetailPanel && (
            <button
              onClick={handleQuickRegister}
              className="hidden md:flex bg-blue-600 text-white px-4 py-3 rounded-lg shadow-lg hover:bg-blue-700 font-bold transition-colors items-center gap-2"
              title="電柱を登録"
            >
              <span className="text-xl">＋</span>
              <span>電柱を登録</span>
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

        {/* PC版：詳細パネル（768px以上で表示） */}
        {showDetailPanel && selectedPoleId && selectedPoleData && (
          <PoleDetailPanel
            poleId={selectedPoleId}
            poleData={selectedPoleData}
            onClose={() => {
              setShowDetailPanel(false);
              setSelectedPoleId(null);
              setSelectedPoleData(null);
            }}
            onEditLocationStart={handleEditLocationStart}
            onEditLocationCancel={handleEditLocationCancel}
            onLocationSaved={(lat, lng) => {
              // 何を: 電柱を再読み込みして、新しい位置に地図を移動
              // なぜ: ユーザーが修正した位置を確認できるようにするため
              console.log(`🗺️ 修正した電柱の位置に地図を移動: ${lat}, ${lng}`);
              loadNearbyPoles();

              // 何を: 地図を新しい位置に移動
              // なぜ: 修正した電柱がすぐに見えるようにするため
              if (mapInstanceRef.current) {
                mapInstanceRef.current.setView([lat, lng], 18, {
                  animate: true,
                  duration: 1,
                });
              }
            }}
          />
        )}

        {/* PC版：検索パネル（768px以上で表示） */}
        {showSearchPanel && (
          <SearchPanel
            onClose={() => setShowSearchPanel(false)}
            onShowOnMap={async (poleId, latitude, longitude) => {
              // 検索結果の位置に地図を移動
              if (mapInstanceRef.current) {
                mapInstanceRef.current.setView([latitude, longitude], 18);
              }

              // 電柱詳細を取得して詳細パネルを表示
              try {
                const poleData = await getPoleById(poleId);
                setSelectedPoleId(poleId);
                setSelectedPoleData(poleData);
                setShowDetailPanel(true);
                setShowSearchPanel(false);
              } catch (error) {
                console.error('電柱詳細の取得に失敗:', error);
              }
            }}
          />
        )}
      </main>
      
      {/* 電柱登録ボタン（登録モード中とパネル表示中は非表示、モバイルのみ表示） */}
      {!isRegisterMode && !showRegisterPanel && (
        <button
          onClick={handleQuickRegister}
          className="md:hidden absolute bottom-36 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-6 py-3 rounded-full shadow-lg hover:bg-blue-700 font-bold z-[2001]"
        >
          ＋ 電柱を登録
        </button>
      )}
    </div>
  );
}