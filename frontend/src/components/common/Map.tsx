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
  // 各レイヤーを保存するための ref
  const streetLayerRef = useRef<L.TileLayer | null>(null);
  const satelliteLayerRef = useRef<L.TileLayer | null>(null);
  const labelsLayerRef = useRef<L.TileLayer | null>(null);

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

    // Esri World Imagery タイル（航空写真）
    const satelliteLayer = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        attribution: 'Tiles © Esri',
        maxZoom: 18,
      }
    );

    // 地名・道路名レイヤー（航空写真の上に重ねる）
    const labelsLayer = L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}.png',
      {
        attribution: '© OpenStreetMap contributors, © CARTO',
        maxZoom: 18,
        opacity: 1,
      }
    );

    // 初期表示は mapType に応じて決定
    if (mapType === 'hybrid') {
      // ハイブリッドモード（航空写真 + 地名）
      satelliteLayer.addTo(map);
      labelsLayer.addTo(map);
    } else {
      // 道路地図モード（デフォルト）
      streetLayer.addTo(map);
    }

    // ref に保存
    mapRef.current = map;
    streetLayerRef.current = streetLayer;
    satelliteLayerRef.current = satelliteLayer;
    labelsLayerRef.current = labelsLayer;

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
    if (!mapRef.current || !streetLayerRef.current || !satelliteLayerRef.current || !labelsLayerRef.current) return;

    const map = mapRef.current;
    const streetLayer = streetLayerRef.current;
    const satelliteLayer = satelliteLayerRef.current;
    const labelsLayer = labelsLayerRef.current;

    // まず全てのレイヤーを削除
    if (map.hasLayer(streetLayer)) {
      map.removeLayer(streetLayer);
    }
    if (map.hasLayer(satelliteLayer)) {
      map.removeLayer(satelliteLayer);
    }
    if (map.hasLayer(labelsLayer)) {
      map.removeLayer(labelsLayer);
    }

    // mapType に応じて必要なレイヤーを追加
    if (mapType === 'hybrid') {
      // 航空写真 + 地名
      satelliteLayer.addTo(map);
      labelsLayer.addTo(map);
    } else {
      // 道路地図のみ
      streetLayer.addTo(map);
    }
  }, [mapType]);

  return (
    <div 
      ref={containerRef} 
      style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
    />
  );
}