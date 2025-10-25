// 何を: 位置情報取得のカスタムフック
// なぜ: 位置情報取得のロジックを再利用するため

import { useState, useEffect } from 'react';

interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  error: string | null;
  loading: boolean;
}

/**
 * 位置情報を取得するカスタムフック
 *
 * 使用例:
 * ```tsx
 * const { latitude, longitude, error, loading } = useGeolocation();
 * ```
 */
export function useGeolocation(autoFetch = true) {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    error: null,
    loading: autoFetch,
  });

  const fetchLocation = () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    if (!('geolocation' in navigator)) {
      setState({
        latitude: null,
        longitude: null,
        accuracy: null,
        error: 'お使いのブラウザは位置情報に対応していません',
        loading: false,
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          error: null,
          loading: false,
        });
      },
      (error) => {
        let errorMessage = '位置情報の取得に失敗しました';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = '位置情報の利用が拒否されました';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = '位置情報が利用できません';
            break;
          case error.TIMEOUT:
            errorMessage = '位置情報の取得がタイムアウトしました';
            break;
        }

        setState({
          latitude: null,
          longitude: null,
          accuracy: null,
          error: errorMessage,
          loading: false,
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  useEffect(() => {
    if (autoFetch) {
      fetchLocation();
    }
  }, [autoFetch]);

  return {
    ...state,
    refetch: fetchLocation,
  };
}
