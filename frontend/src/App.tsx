import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import BottomNav from './components/mobile/BottomNav';
import Home from './pages/Home';
import Search from './pages/mobile/Search';
import Groups from './pages/mobile/Groups';
import MyPage from './pages/mobile/MyPage';
import PoleDetail from './pages/mobile/PoleDetail';
import UploadPhoto from './pages/mobile/UploadPhoto';
import RegisterLocation from './pages/RegisterLocation';
import RegisterPoleInfo from './pages/mobile/RegisterPoleInfo';
import RegisterPhotoClassify from './pages/mobile/RegisterPhotoClassify';
import RegisterNumberInput from './pages/mobile/RegisterNumberInput';
import RegisterMemo from './pages/mobile/RegisterMemo';
import RegisterConfirm from './pages/mobile/RegisterConfirm';
import RegisterComplete from './pages/mobile/RegisterComplete';



function AppContent() {
  const location = useLocation();

  // 登録画面と詳細画面ではボトムナビを非表示
  const hideBottomNav = location.pathname.startsWith('/register') || location.pathname.startsWith('/pole/');

  return (
    <div className="relative">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<Search />} />
        <Route path="/groups" element={<Groups />} />
        <Route path="/mypage" element={<MyPage />} />
        <Route path="/pole/:id" element={<PoleDetail />} />
        <Route path="/pole/:id/upload" element={<UploadPhoto />} />
        <Route path="/register/location" element={<RegisterLocation />} />
        <Route path="/register/pole-info" element={<RegisterPoleInfo />} />
        <Route path="/register/photo-classify" element={<RegisterPhotoClassify />} />
        <Route path="/register/number-input" element={<RegisterNumberInput />} />
        <Route path="/register/memo" element={<RegisterMemo />} />
        <Route path="/register/confirm" element={<RegisterConfirm />} />
        <Route path="/register/complete" element={<RegisterComplete />} />
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