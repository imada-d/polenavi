import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,  // ECMと被らないように5174に変更（ECMは5173を使用中）
    host: '0.0.0.0'  // 外部からアクセス可能にする（本番サーバー用）
  }
})