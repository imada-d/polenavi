import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import BottomNav from './components/BottomNav';
import Home from './pages/Home';
import Search from './pages/Search';
import Stats from './pages/Stats';
import Gallery from './pages/Gallery';
import Ranking from './pages/Ranking';
import RegisterLocation from './pages/RegisterLocation';
import RegisterPoleType from './pages/RegisterPoleType';

function AppContent() {
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
        <Route path="/register/pole-type" element={<RegisterPoleType />} />
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