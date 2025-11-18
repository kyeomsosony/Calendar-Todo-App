import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { TodoProvider } from './contexts/TodoContext';
import { BottomTabBar } from './components/BottomTabBar';
import { InstallPWA } from './components/InstallPWA';
import { HomePage } from './pages/HomePage';
import { CalendarPage } from './pages/CalendarPage';
import { RecordsPage } from './pages/RecordsPage';
import { SettingsPage } from './pages/SettingsPage';
import { DailyRecordPage } from './pages/DailyRecordPage';
import { DailyRecordOthersPage } from './pages/DailyRecordOthersPage';
import { LoginPage } from './pages/LoginPage';
import { Toaster } from './components/ui/sonner';

// Protected Route Wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // 현재 활성 탭 결정
  const getActiveTab = (): 'home' | 'calendar' | 'records' | 'settings' => {
    if (location.pathname.startsWith('/calendar')) return 'calendar';
    if (location.pathname.startsWith('/records')) return 'records';
    if (location.pathname.startsWith('/settings')) return 'settings';
    return 'home';
  };

  const handleTabChange = (tab: 'home' | 'calendar' | 'records' | 'settings') => {
    navigate(`/${tab === 'home' ? '' : tab}`);
  };

  // 상세 페이지에서는 탭바 숨기기
  const shouldShowTabBar = !location.pathname.includes('/records/my/') && 
                          !location.pathname.includes('/records/others/') &&
                          location.pathname !== '/login';

  return (
    <div className="min-h-screen bg-white max-w-2xl mx-auto">
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
        <Route path="/preview_page.html" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
        <Route path="/calendar" element={<ProtectedRoute><CalendarPage /></ProtectedRoute>} />
        <Route path="/records" element={<ProtectedRoute><RecordsPage /></ProtectedRoute>} />
        <Route path="/records/my/:date" element={<ProtectedRoute><DailyRecordPage /></ProtectedRoute>} />
        <Route path="/records/others/:userId/:date" element={<ProtectedRoute><DailyRecordOthersPage /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
        <Route path="*" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
      </Routes>
      {shouldShowTabBar && user && (
        <BottomTabBar activeTab={getActiveTab()} onTabChange={handleTabChange} />
      )}
    </div>
  );
}

export default function App() {
  // PWA Service Worker 등록
  useEffect(() => {
    // iOS PWA 메타 태그 추가
    const addMetaTags = () => {
      // apple-mobile-web-app-capable 메타 태그 확인 및 추가
      let capable = document.querySelector('meta[name="apple-mobile-web-app-capable"]');
      if (!capable) {
        capable = document.createElement('meta');
        capable.setAttribute('name', 'apple-mobile-web-app-capable');
        capable.setAttribute('content', 'yes');
        document.head.appendChild(capable);
      }

      // apple-mobile-web-app-status-bar-style 메타 태그
      let statusBar = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
      if (!statusBar) {
        statusBar = document.createElement('meta');
        statusBar.setAttribute('name', 'apple-mobile-web-app-status-bar-style');
        statusBar.setAttribute('content', 'default');
        document.head.appendChild(statusBar);
      }

      // apple-mobile-web-app-title 메타 태그
      let title = document.querySelector('meta[name="apple-mobile-web-app-title"]');
      if (!title) {
        title = document.createElement('meta');
        title.setAttribute('name', 'apple-mobile-web-app-title');
        title.setAttribute('content', 'CalTodo');
        document.head.appendChild(title);
      }

      // manifest 링크
      let manifest = document.querySelector('link[rel="manifest"]');
      if (!manifest) {
        manifest = document.createElement('link');
        manifest.setAttribute('rel', 'manifest');
        manifest.setAttribute('href', '/manifest.json');
        document.head.appendChild(manifest);
      }

      // apple-touch-icon 링크
      let icon = document.querySelector('link[rel="apple-touch-icon"]');
      if (!icon) {
        icon = document.createElement('link');
        icon.setAttribute('rel', 'apple-touch-icon');
        icon.setAttribute('href', '/icon-192.png');
        document.head.appendChild(icon);
      }
    };

    addMetaTags();

    // Service Worker 등록
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/service-worker.js')
          .then((registration) => {
            console.log('Service Worker registered successfully:', registration.scope);
          })
          .catch((error) => {
            console.log('Service Worker registration failed:', error);
          });
      });
    }
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        <TodoProvider>
          <AppContent />
          <Toaster />
        </TodoProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}