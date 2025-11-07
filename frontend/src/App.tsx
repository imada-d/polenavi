import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import BottomNav from './components/mobile/BottomNav';
import Home from './pages/Home';
import SearchMobile from './pages/mobile/Search';
import GroupsMobile from './pages/mobile/Groups';
import MyPageMobile from './pages/mobile/MyPage';
import ProfileEditMobile from './pages/mobile/ProfileEdit';
import MyDataMobile from './pages/mobile/MyData';
import NotificationSettings from './pages/NotificationSettings';
import PrivacySettings from './pages/PrivacySettings';
import AccountSettings from './pages/AccountSettings';
import HelpSupport from './pages/HelpSupport';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import SearchPC from './pages/pc/SearchPC';
import GroupsPC from './pages/pc/GroupsPC';
import MyPagePC from './pages/pc/MyPagePC';
import ProfileEditPC from './pages/pc/ProfileEditPC';
import MyDataPC from './pages/pc/MyDataPC';
import Login from './pages/Login';
import Signup from './pages/Signup';
import PoleDetail from './pages/mobile/PoleDetail';
import UploadPhoto from './pages/mobile/UploadPhoto';
import RegisterLocation from './pages/RegisterLocation';
import RegisterPoleInfo from './pages/mobile/RegisterPoleInfo';
import RegisterPhotoClassify from './pages/mobile/RegisterPhotoClassify';
import RegisterNumberInput from './pages/mobile/RegisterNumberInput';
import RegisterMemo from './pages/mobile/RegisterMemo';
import RegisterConfirm from './pages/mobile/RegisterConfirm';
import RegisterComplete from './pages/mobile/RegisterComplete';



// レスポンシブラッパー：PC/モバイルで異なるコンポーネントを表示
function ResponsiveWrapper({ mobile: Mobile, pc: PC }: { mobile: React.ComponentType; pc: React.ComponentType }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isMobile ? <Mobile /> : <PC />;
}

function AppContent() {
  const location = useLocation();

  // 登録画面、詳細画面、認証画面、設定画面ではボトムナビを非表示
  const hideBottomNav =
    location.pathname.startsWith('/register') ||
    location.pathname.startsWith('/pole/') ||
    location.pathname === '/login' ||
    location.pathname === '/signup' ||
    location.pathname === '/profile/edit' ||
    location.pathname === '/mydata' ||
    location.pathname === '/notification-settings' ||
    location.pathname === '/privacy-settings' ||
    location.pathname === '/account-settings' ||
    location.pathname === '/help-support' ||
    location.pathname === '/terms' ||
    location.pathname === '/privacy';

  return (
    <div className="relative">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<ResponsiveWrapper mobile={SearchMobile} pc={SearchPC} />} />
        <Route path="/groups" element={<ResponsiveWrapper mobile={GroupsMobile} pc={GroupsPC} />} />
        <Route path="/mypage" element={<ResponsiveWrapper mobile={MyPageMobile} pc={MyPagePC} />} />
        <Route path="/profile/edit" element={<ResponsiveWrapper mobile={ProfileEditMobile} pc={ProfileEditPC} />} />
        <Route path="/mydata" element={<ResponsiveWrapper mobile={MyDataMobile} pc={MyDataPC} />} />
        <Route path="/notification-settings" element={<NotificationSettings />} />
        <Route path="/privacy-settings" element={<PrivacySettings />} />
        <Route path="/account-settings" element={<AccountSettings />} />
        <Route path="/help-support" element={<HelpSupport />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
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
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}