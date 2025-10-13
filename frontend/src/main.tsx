
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import 'leaflet/dist/leaflet.css'  // 👈 追加


createRoot(document.getElementById('root')!).render(    <App />
)