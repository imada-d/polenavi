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
import HashtagPolesMobile from './pages/mobile/HashtagPoles';
import HashtagPolesPC from './pages/pc/HashtagPolesPC';
import StatsMobile from './pages/mobile/Stats';
import StatsPC from './pages/pc/StatsPC';
import AdminDashboardMobile from './pages/mobile/AdminDashboard';
import AdminDashboardPC from './pages/pc/AdminDashboardPC';
import AdminUsersMobile from './pages/mobile/AdminUsers';
import AdminUsersPC from './pages/pc/AdminUsersPC';
import AdminUserDetailMobile from './pages/mobile/AdminUserDetail';
import AdminUserDetailPC from './pages/pc/AdminUserDetailPC';
import AdminReportsMobile from './pages/mobile/AdminReports';
import AdminReportsPC from './pages/pc/AdminReportsPC';
import AdminReportDetailMobile from './pages/mobile/AdminReportDetail';
import AdminReportDetailPC from './pages/pc/AdminReportDetailPC';
import AdminPolesMobile from './pages/mobile/AdminPoles';
import AdminPolesPC from './pages/pc/AdminPolesPC';
import AdminBugReportsMobile from './pages/mobile/AdminBugReports';
import AdminBugReportsPC from './pages/pc/AdminBugReportsPC';
import AdminBugReportDetailMobile from './pages/mobile/AdminBugReportDetail';
import AdminBugReportDetailPC from './pages/pc/AdminBugReportDetailPC';
import SearchPC from './pages/pc/SearchPC';
import ProtectedRoute from './components/ProtectedRoute';
import GroupsPC from './pages/pc/GroupsPC';
import MyPagePC from './pages/pc/MyPagePC';
import ProfileEditPC from './pages/pc/ProfileEditPC';
import MyDataPC from './pages/pc/MyDataPC';
import Login from './pages/Login';
import Signup from './pages/Signup';
import VerifyEmail from './pages/VerifyEmail';
import EmailVerificationPending from './pages/EmailVerificationPending';
import PoleDetail from './pages/mobile/PoleDetail';
import UploadPhoto from './pages/mobile/UploadPhoto';
import RegisterLocation from './pages/RegisterLocation';
import RegisterPoleInfo from './pages/mobile/RegisterPoleInfo';
import RegisterPhotoClassify from './pages/mobile/RegisterPhotoClassify';
import RegisterNumberInput from './pages/mobile/RegisterNumberInput';
import RegisterMemo from './pages/mobile/RegisterMemo';
import RegisterConfirm from './pages/mobile/RegisterConfirm';
import RegisterComplete from './pages/mobile/RegisterComplete';
import GroupDetail from './pages/mobile/GroupDetail';
import HashtagManager from './pages/mobile/HashtagManager';
import RegisterFromPhotoMobile from './pages/mobile/RegisterFromPhoto';
import RegisterFromPhotoPC from './pages/pc/RegisterFromPhoto';
import RegisterDuplicateCheck from './pages/RegisterDuplicateCheck';
import PhotoRegisterLocation from './pages/mobile/PhotoRegisterLocation';
import PhotoRegisterPoleInfo from './pages/mobile/PhotoRegisterPoleInfo';
import PhotoRegisterNumberInput from './pages/mobile/PhotoRegisterNumberInput';
import PhotoRegisterMemo from './pages/mobile/PhotoRegisterMemo';
import BugReport from './pages/BugReport';

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

  // 詳細画面、認証画面、設定画面ではボトムナビを非表示
  // 登録画面は表示する（ナビゲーションしやすくするため）
  const hideBottomNav =
    location.pathname.startsWith('/pole/') ||
    location.pathname.startsWith('/groups/') ||
    location.pathname === '/login' ||
    location.pathname === '/signup' ||
    location.pathname === '/verify-email' ||
    location.pathname === '/email-verification-pending' ||
    location.pathname === '/profile/edit' ||
    location.pathname === '/mydata' ||
    location.pathname === '/notification-settings' ||
    location.pathname === '/privacy-settings' ||
    location.pathname === '/account-settings' ||
    location.pathname === '/help-support' ||
    location.pathname === '/bug-report' ||
    location.pathname === '/terms' ||
    location.pathname === '/privacy' ||
    location.pathname.startsWith('/hashtag/') ||
    location.pathname === '/hashtags' ||
    location.pathname === '/stats' ||
    location.pathname.startsWith('/admin');

  return (
    <div className="relative">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<ResponsiveWrapper mobile={SearchMobile} pc={SearchPC} />} />
        <Route path="/groups" element={<ResponsiveWrapper mobile={GroupsMobile} pc={GroupsPC} />} />
        <Route path="/groups/:id" element={<GroupDetail />} />
        <Route path="/hashtags" element={<HashtagManager />} />
        <Route path="/mypage" element={<ResponsiveWrapper mobile={MyPageMobile} pc={MyPagePC} />} />
        <Route path="/profile/edit" element={<ResponsiveWrapper mobile={ProfileEditMobile} pc={ProfileEditPC} />} />
        <Route path="/mydata" element={<ResponsiveWrapper mobile={MyDataMobile} pc={MyDataPC} />} />
        <Route path="/notification-settings" element={<NotificationSettings />} />
        <Route path="/privacy-settings" element={<PrivacySettings />} />
        <Route path="/account-settings" element={<AccountSettings />} />
        <Route path="/help-support" element={<HelpSupport />} />
        <Route path="/bug-report" element={<BugReport />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/hashtag/:tag" element={<ResponsiveWrapper mobile={HashtagPolesMobile} pc={HashtagPolesPC} />} />
        <Route path="/stats" element={<ResponsiveWrapper mobile={StatsMobile} pc={StatsPC} />} />
        <Route path="/admin" element={<ProtectedRoute requireAdmin><ResponsiveWrapper mobile={AdminDashboardMobile} pc={AdminDashboardPC} /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute requireAdmin><ResponsiveWrapper mobile={AdminUsersMobile} pc={AdminUsersPC} /></ProtectedRoute>} />
        <Route path="/admin/users/:id" element={<ProtectedRoute requireAdmin><ResponsiveWrapper mobile={AdminUserDetailMobile} pc={AdminUserDetailPC} /></ProtectedRoute>} />
        <Route path="/admin/reports" element={<ProtectedRoute requireAdmin><ResponsiveWrapper mobile={AdminReportsMobile} pc={AdminReportsPC} /></ProtectedRoute>} />
        <Route path="/admin/reports/:id" element={<ProtectedRoute requireAdmin><ResponsiveWrapper mobile={AdminReportDetailMobile} pc={AdminReportDetailPC} /></ProtectedRoute>} />
        <Route path="/admin/poles" element={<ProtectedRoute requireAdmin><ResponsiveWrapper mobile={AdminPolesMobile} pc={AdminPolesPC} /></ProtectedRoute>} />
        <Route path="/admin/bug-reports" element={<ProtectedRoute requireAdmin><ResponsiveWrapper mobile={AdminBugReportsMobile} pc={AdminBugReportsPC} /></ProtectedRoute>} />
        <Route path="/admin/bug-reports/:id" element={<ProtectedRoute requireAdmin><ResponsiveWrapper mobile={AdminBugReportDetailMobile} pc={AdminBugReportDetailPC} /></ProtectedRoute>} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/email-verification-pending" element={<EmailVerificationPending />} />
        <Route path="/pole/:id" element={<PoleDetail />} />
        <Route path="/pole/:id/upload" element={<UploadPhoto />} />
        <Route path="/register-from-photo" element={<ResponsiveWrapper mobile={RegisterFromPhotoMobile} pc={RegisterFromPhotoPC} />} />
        <Route path="/register/duplicate-check" element={<RegisterDuplicateCheck />} />
        {/* 写真から登録専用フロー */}
        <Route path="/register/photo/location" element={<PhotoRegisterLocation />} />
        <Route path="/register/photo/pole-info" element={<PhotoRegisterPoleInfo />} />
        <Route path="/register/photo/number-input" element={<PhotoRegisterNumberInput />} />
        <Route path="/register/photo/memo" element={<PhotoRegisterMemo />} />
        {/* 手動入力フロー */}
        <Route path="/register/location" element={<RegisterLocation />} />
        <Route path="/register/pole-info" element={<RegisterPoleInfo />} />
        <Route path="/register/photo-classify" element={<RegisterPhotoClassify />} />
        <Route path="/register/number-input" element={<RegisterNumberInput />} />
        <Route path="/register/memo" element={<RegisterMemo />} />
        {/* 共通 */}
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