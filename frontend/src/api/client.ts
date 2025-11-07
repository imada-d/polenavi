import axios from 'axios';

// APIクライアントの設定
const apiClient = axios.create({
  // 環境変数が設定されていない場合は相対パス（/api）を使用
  // 開発環境: vite.config.tsのproxyで localhost:3000 に転送
  // 本番環境: VITE_API_URL + /api に接続（例: https://api.polenavi.com/api）
  baseURL: import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api',
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
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// レスポンスインターセプター（エラーハンドリング）
// 401エラーは AuthContext で処理するため、ここではリダイレクトしない
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // エラーをそのまま返す（AuthContextで処理）
    return Promise.reject(error);
  }
);

export { apiClient };
export default apiClient;