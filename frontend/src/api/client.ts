import axios from 'axios';

// APIクライアントの設定
const baseURL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api';
console.log('🌐 [API Client] Base URL:', baseURL);
console.log('🌐 [API Client] VITE_API_URL:', import.meta.env.VITE_API_URL || '(未設定)');

const apiClient = axios.create({
  // 環境変数が設定されていない場合は相対パス（/api）を使用
  // 開発環境: vite.config.tsのproxyで localhost:3000 に転送
  // 本番環境: VITE_API_URL + /api に接続（例: https://api.polenavi.com/api）
  baseURL,
  timeout: 10000,
  withCredentials: true, // httpOnly Cookie認証を有効化
  headers: {
    'Content-Type': 'application/json',
  },
});

// トークンを保持する変数（AuthContextから設定される）
let accessToken: string | null = null;

// トークンを設定する関数（AuthContextから呼ばれる）
export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

// リクエストインターセプター（JWT トークンを自動で付与）
apiClient.interceptors.request.use(
  (config) => {
    console.log('📤 [API Request]', config.method?.toUpperCase(), config.url);
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    console.error('❌ [API Request Error]', error);
    return Promise.reject(error);
  }
);

// レスポンスインターセプター（エラーハンドリング）
// 401エラーは AuthContext で処理するため、ここではリダイレクトしない
apiClient.interceptors.response.use(
  (response) => {
    console.log('✅ [API Response]', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('❌ [API Error]', error.response?.status, error.config?.url, error.message);
    // エラーをそのまま返す（AuthContextで処理）
    return Promise.reject(error);
  }
);

export { apiClient };
export default apiClient;