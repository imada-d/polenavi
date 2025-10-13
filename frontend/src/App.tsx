import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import BottomNav from './components/mobile/BottomNav';
import Home from './pages/Home';
import Search from './pages/Search';
import Stats from './pages/Stats';
import Gallery from './pages/Gallery';
import Ranking from './pages/Ranking';
import RegisterLocation from './pages/RegisterLocation';
import RegisterPoleInfo from './pages/mobile/RegisterPoleInfo'; 
import RegisterPhotoClassify from './pages/mobile/RegisterPhotoClassify';
import RegisterNumberInput from './pages/mobile/RegisterNumberInput';



function AppContent() {
  console.log('🔵 AppContent がレンダリングされました');
  const location = useLocation();
  
  // 登録画面ではボトムナビを非表示
  const hideBottomNav = location.pathname.startsWith('/register');

  return (
    <div className="relative">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<Search />} />
        <Route path="/stats" element={<Stats />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/ranking" element={<Ranking />} />
        <Route path="/register/location" element={<RegisterLocation />} />
        <Route path="/register/pole-info" element={<RegisterPoleInfo />} /> {/* 👈 新しいルート */}
        <Route path="/register/photo-classify" element={<RegisterPhotoClassify />} /> {/* 👈 新しいルート */}
        <Route path="/register/number-input" element={<RegisterNumberInput />} /> {/* 👈 追加 */}
      </Routes>
      {!hideBottomNav && <BottomNav />}
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}