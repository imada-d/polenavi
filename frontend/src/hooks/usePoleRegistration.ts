// 何を: 電柱登録のカスタムフック
// なぜ: 登録処理のロジックを再利用するため

import { useState } from 'react';
import { apiClient } from '../api/client';

interface PoleRegistrationData {
  location: [number, number];
  poleType: 'electric' | 'other';
  poleSubType?: 'light' | 'sign' | 'traffic' | 'other';
  plateCount: number;
  numbers: string[];
}

interface RegistrationState {
  loading: boolean;
  error: string | null;
  success: boolean;
  data: any | null;
}

/**
 * 電柱登録のカスタムフック
 *
 * 使用例:
 * ```tsx
 * const { register, loading, error } = usePoleRegistration();
 * await register(data);
 * ```
 */
export function usePoleRegistration() {
  const [state, setState] = useState<RegistrationState>({
    loading: false,
    error: null,
    success: false,
    data: null,
  });

  const register = async (data: PoleRegistrationData) => {
    setState({ loading: true, error: null, success: false, data: null });

    try {
      const response = await apiClient.post('/poles', {
        latitude: data.location[0],
        longitude: data.location[1],
        poleType: data.poleType,
        poleSubType: data.poleSubType,
        plateCount: data.plateCount,
        numbers: data.numbers,
      });

      setState({
        loading: false,
        error: null,
        success: true,
        data: response.data,
      });

      return response.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error?.message || '登録に失敗しました';

      setState({
        loading: false,
        error: errorMessage,
        success: false,
        data: null,
      });

      throw error;
    }
  };

  const reset = () => {
    setState({
      loading: false,
      error: null,
      success: false,
      data: null,
    });
  };

  return {
    register,
    reset,
    ...state,
  };
}
