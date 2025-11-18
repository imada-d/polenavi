import { useEffect, useRef } from 'react';
import L from 'leaflet';

// Leafletのデフォルトアイコン問題の修正
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// カスタムSVGアイコンをインポート
import poleElectricIcon from "../../assets/icons/pole-electric.svg";
import poleLightIcon from "../../assets/icons/pole-light.svg";
import poleSignIcon from "../../assets/icons/pole-sign.svg";
import poleTrafficIcon from "../../assets/icons/pole-traffic.svg";
import poleOtherIcon from "../../assets/icons/pole-other.svg";

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

// カスタムアイコンを作成（5種類）
const createPoleIcon = (iconUrl: string) => {
  return L.icon({
    iconUrl,
    iconSize: [32, 40],        // SVGのサイズ（width, height）
    iconAnchor: [16, 28],      // アイコンの位置（下のピンの先端が位置）
    popupAnchor: [0, -28],     // ポップアップの位置
  });
};

// 各柱の種類ごとのアイコン
export const poleIcons = {
  electric: createPoleIcon(poleElectricIcon),
  light: createPoleIcon(poleLightIcon),
  sign: createPoleIcon(poleSignIcon),
  traffic: createPoleIcon(poleTrafficIcon),
  other: createPoleIcon(poleOtherIcon),
};

interface MapProps {
  center?: [number, number];
  zoom?: number;
  mapType?: 'street' | 'hybrid'; // 2つのモードのみ
  onMapReady?: (map: L.Map) => void;
}

export default function Map({
  center = [36.5, 138.0],  // デフォルトは日本全体が見える位置
  zoom = 5,  // 日本全体が見えるズームレベル
  mapType = 'street',
  onMapReady
}: MapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const mapTypeRef = useRef<'street' | 'hybrid'>(mapType); // mapTypeを参照用に保存
  // 各レイヤーを保存するための ref
  const streetLayerRef = useRef<L.TileLayer | null>(null);
  const satelliteLayerRef = useRef<L.TileLayer | null>(null);
  const satelliteLayerEsriRef = useRef<L.TileLayer | null>(null); // Esri航空写真（ズーム13以下用）
  const labelsLayerRef = useRef<L.TileLayer | null>(null);

  // mapType が変更されたら ref を更新
  useEffect(() => {
    mapTypeRef.current = mapType;
  }, [mapType]);

  // 地図の初期化（初回のみ）
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // 地図の初期化（ズームコントロールを左下、アトリビューションを右上に配置）
    const map = L.map(containerRef.current, {
      zoomControl: false,  // デフォルトを無効化して位置を変更
      attributionControl: false,  // デフォルトを無効化して位置を変更
    }).setView(center, zoom);

    // ズームコントロールを左下に追加
    L.control.zoom({ position: 'bottomleft' }).addTo(map);

    // アトリビューションを右上に追加（BottomNavに隠れないように）
    L.control.attribution({ position: 'topright', prefix: false }).addTo(map);

    // OpenStreetMap タイル（道路地図）
    const streetLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    });

    // 国土地理院 航空写真タイル（ズーム14以上で表示）
    const satelliteLayer = L.tileLayer(
      'https://cyberjapandata.gsi.go.jp/xyz/seamlessphoto/{z}/{x}/{y}.jpg',
      {
        attribution: '<a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank">国土地理院</a>',
        maxZoom: 18,
        minZoom: 14,
      }
    );

    // Esri 航空写真タイル（ズーム13以下で表示）
    const satelliteLayerEsri = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        attribution: '© Esri',
        maxZoom: 13,
      }
    );

    // 地名・道路名レイヤー（航空写真の上に重ねる）
    // CartoDB Positron ラベルレイヤーを使用
    const labelsLayer = L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}.png',
      {
        attribution: '© OpenStreetMap contributors, © CARTO',
        maxZoom: 19,
        zIndex: 250, // タイルレイヤーのz-index（マーカーより下に配置）
      }
    );

    // 初期表示は mapType に応じて決定
    if (mapType === 'hybrid') {
      // ハイブリッドモード（航空写真 + 地名）
      const currentZoom = map.getZoom();
      console.log(`🗺️ 初期表示: ズーム=${currentZoom}, モード=hybrid`);
      if (currentZoom >= 14) {
        console.log('✅ 初期表示: 国土地理院を追加');
        satelliteLayer.addTo(map);
      } else {
        console.log('✅ 初期表示: Esriを追加');
        satelliteLayerEsri.addTo(map);
      }
      labelsLayer.addTo(map);
      map.setMaxZoom(18); // 航空写真の最大ズームに合わせる
    } else {
      // 道路地図モード（デフォルト）
      console.log(`🗺️ 初期表示: モード=street`);
      streetLayer.addTo(map);
      map.setMaxZoom(19); // 道路地図の最大ズームに合わせる
    }

    // ref に保存
    mapRef.current = map;
    streetLayerRef.current = streetLayer;
    satelliteLayerRef.current = satelliteLayer;
    satelliteLayerEsriRef.current = satelliteLayerEsri;
    labelsLayerRef.current = labelsLayer;

    // ズーム変更時に航空写真レイヤーを切り替え
    map.on('zoomend', () => {
      const currentMapType = mapTypeRef.current; // ref から取得
      console.log('🔍 zoomend イベント: mapType =', currentMapType);

      if (currentMapType !== 'hybrid') return;

      const zoom = map.getZoom();
      const hasGsi = map.hasLayer(satelliteLayer);
      const hasEsri = map.hasLayer(satelliteLayerEsri);

      console.log(`📍 現在のズーム: ${zoom}, 国土地理院: ${hasGsi}, Esri: ${hasEsri}`);

      if (zoom >= 14 && !hasGsi) {
        // ズーム14以上：国土地理院に切り替え
        console.log('✅ 国土地理院に切り替え');
        if (hasEsri) map.removeLayer(satelliteLayerEsri);
        satelliteLayer.addTo(map);
      } else if (zoom < 14 && !hasEsri) {
        // ズーム13以下：Esriに切り替え
        console.log('✅ Esriに切り替え');
        if (hasGsi) map.removeLayer(satelliteLayer);
        satelliteLayerEsri.addTo(map);
      }
    });

    // サイズの再計算
    setTimeout(() => {
      map.invalidateSize();
      onMapReady?.(map);
    }, 100);

    // クリーンアップ
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // mapType が変わったらレイヤーを切り替え
  useEffect(() => {
    if (!mapRef.current || !streetLayerRef.current || !satelliteLayerRef.current || !satelliteLayerEsriRef.current || !labelsLayerRef.current) return;

    const map = mapRef.current;
    const streetLayer = streetLayerRef.current;
    const satelliteLayer = satelliteLayerRef.current;
    const satelliteLayerEsri = satelliteLayerEsriRef.current;
    const labelsLayer = labelsLayerRef.current;

    // まず全てのレイヤーを削除
    if (map.hasLayer(streetLayer)) {
      map.removeLayer(streetLayer);
    }
    if (map.hasLayer(satelliteLayer)) {
      map.removeLayer(satelliteLayer);
    }
    if (map.hasLayer(satelliteLayerEsri)) {
      map.removeLayer(satelliteLayerEsri);
    }
    if (map.hasLayer(labelsLayer)) {
      map.removeLayer(labelsLayer);
    }

    // mapType に応じて必要なレイヤーを追加
    console.log(`🔄 mapType切り替え: ${mapType}`);
    if (mapType === 'hybrid') {
      // 航空写真 + 地名（ズームレベルに応じて切り替え）
      const currentZoom = map.getZoom();
      console.log(`📍 現在のズーム: ${currentZoom}`);
      if (currentZoom >= 14) {
        console.log('✅ 国土地理院レイヤーを追加');
        satelliteLayer.addTo(map);
      } else {
        console.log('✅ Esriレイヤーを追加');
        satelliteLayerEsri.addTo(map);
      }
      labelsLayer.addTo(map);
      map.setMaxZoom(18); // 航空写真の最大ズームに合わせる
    } else {
      // 道路地図のみ
      console.log('✅ 道路地図レイヤーを追加');
      streetLayer.addTo(map);
      map.setMaxZoom(19); // 道路地図の最大ズームに合わせる
    }
  }, [mapType]);

  return (
    <div 
      ref={containerRef} 
      style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
    />
  );
}